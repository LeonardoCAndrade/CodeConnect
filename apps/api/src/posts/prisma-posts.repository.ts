import { Injectable } from '@nestjs/common';
import { isUuid, normalizeUuid } from '../common/uuid.js';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Comment, Post, TagUsage } from './post.entity.js';
import {
  ListPostsQuery,
  NewComment,
  NewPost,
  PostNotFoundError,
  PostPage,
  PostsRepository,
} from './posts.repository.js';

const FOREIGN_KEY_VIOLATION = 'P2003';
const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

const authorSelect = { select: { id: true, name: true } } as const;

function postInclude(viewerId?: string) {
  return {
    author: authorSelect,
    tags: { select: { tag: { select: { name: true } } } },
    _count: { select: { likes: true, comments: true } },
    // Só a curtida do próprio usuário, para saber se ele já curtiu.
    likes:
      viewerId && isUuid(viewerId)
        ? { where: { userId: viewerId }, select: { userId: true } }
        : { where: { userId: { in: [] } }, select: { userId: true } },
  } satisfies Prisma.PostInclude;
}

type PostRecord = Prisma.PostGetPayload<{
  include: ReturnType<typeof postInclude>;
}>;

@Injectable()
export class PrismaPostsRepository extends PostsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async list(query: ListPostsQuery): Promise<PostPage> {
    const { search, tags, sort, page, pageSize, viewerId } = query;

    // Filtro, ordenação e paginação ficam no SQL: o full-text search não é
    // suportado pelo Prisma, e assim nunca há listas grandes de ids em parâmetros.
    const fullText = search
      ? Prisma.sql`INNER JOIN CONTAINSTABLE([dbo].[posts], ([title], [body]), ${search}, LANGUAGE 1046) AS ft ON ft.[KEY] = p.[id]`
      : Prisma.empty;
    const tagConditions = tags.map(
      (tag) => Prisma.sql`EXISTS (
        SELECT 1 FROM [dbo].[post_tags] pt
        INNER JOIN [dbo].[tags] t ON t.[id] = pt.[tag_id]
        WHERE pt.[post_id] = p.[id] AND t.[name] = ${tag})`,
    );
    const where = tagConditions.length
      ? Prisma.sql`WHERE ${Prisma.join(tagConditions, ' AND ')}`
      : Prisma.empty;
    const orderBy =
      sort === 'popular'
        ? Prisma.sql`(SELECT COUNT(*) FROM [dbo].[likes] l WHERE l.[post_id] = p.[id]) DESC, p.[created_at] DESC, p.[id]`
        : Prisma.sql`p.[created_at] DESC, p.[id]`;

    const rows = await this.prisma.$queryRaw<{ id: string; total: number }[]>`
      SELECT p.[id] AS id, COUNT(*) OVER () AS total
      FROM [dbo].[posts] p
      ${fullText}
      ${where}
      ORDER BY ${orderBy}
      OFFSET ${(page - 1) * pageSize} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    const total =
      rows.length > 0
        ? Number(rows[0].total)
        : await this.count(fullText, where);
    if (rows.length === 0) {
      return { items: [], total };
    }

    const ids = rows.map((row) => row.id);
    const records = await this.prisma.post.findMany({
      where: { id: { in: ids } },
      include: postInclude(viewerId),
    });
    // findMany não garante a ordem: reaplica a ordem da consulta paginada.
    const byId = new Map(records.map((r) => [normalizeUuid(r.id), r]));
    const items = ids
      .map((id) => byId.get(normalizeUuid(id)))
      .filter((record): record is PostRecord => record !== undefined)
      .map(toPost);
    return { items, total };
  }

  private async count(fullText: Prisma.Sql, where: Prisma.Sql) {
    const [row] = await this.prisma.$queryRaw<{ total: number }[]>`
      SELECT COUNT(*) AS total FROM [dbo].[posts] p ${fullText} ${where}`;
    return Number(row?.total ?? 0);
  }

  async findById(id: string, viewerId?: string): Promise<Post | undefined> {
    if (!isUuid(id)) {
      return undefined;
    }
    const record = await this.prisma.post.findUnique({
      where: { id },
      include: postInclude(viewerId),
    });
    return record ? toPost(record) : undefined;
  }

  async create(data: NewPost): Promise<Post> {
    const record = await this.prisma.post.create({
      data: {
        title: data.title,
        body: data.body,
        code: data.code,
        imageUrl: data.imageUrl,
        authorId: data.authorId,
        tags: {
          create: data.tags.map((name) => ({
            tag: { connectOrCreate: { where: { name }, create: { name } } },
          })),
        },
      },
      include: postInclude(data.authorId),
    });
    return toPost(record);
  }

  async like(postId: string, userId: string): Promise<void> {
    await this.ensurePostExists(postId);
    try {
      await this.prisma.like.upsert({
        where: { userId_postId: { userId, postId } },
        create: { userId, postId },
        update: {},
      });
    } catch (error) {
      // Curtida simultânea do mesmo usuário: a outra requisição já gravou.
      if (isKnownError(error, UNIQUE_CONSTRAINT_VIOLATION)) {
        return;
      }
      if (isKnownError(error, FOREIGN_KEY_VIOLATION)) {
        throw new PostNotFoundError();
      }
      throw error;
    }
  }

  async unlike(postId: string, userId: string): Promise<void> {
    await this.ensurePostExists(postId);
    await this.prisma.like.deleteMany({ where: { postId, userId } });
  }

  async listComments(postId: string): Promise<Comment[]> {
    await this.ensurePostExists(postId);
    const records = await this.prisma.comment.findMany({
      where: { postId },
      include: { author: authorSelect },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    return records.map(toComment);
  }

  async createComment(data: NewComment): Promise<Comment> {
    await this.ensurePostExists(data.postId);
    try {
      const record = await this.prisma.comment.create({
        data,
        include: { author: authorSelect },
      });
      return toComment(record);
    } catch (error) {
      if (isKnownError(error, FOREIGN_KEY_VIOLATION)) {
        throw new PostNotFoundError();
      }
      throw error;
    }
  }

  async listTags(limit: number): Promise<TagUsage[]> {
    const records = await this.prisma.tag.findMany({
      where: { posts: { some: {} } },
      orderBy: [{ posts: { _count: 'desc' } }, { name: 'asc' }],
      take: limit,
      select: { name: true, _count: { select: { posts: true } } },
    });
    return records.map((r) => ({ name: r.name, postsCount: r._count.posts }));
  }

  private async ensurePostExists(postId: string): Promise<void> {
    const found =
      isUuid(postId) &&
      (await this.prisma.post.count({ where: { id: postId } })) > 0;
    if (!found) {
      throw new PostNotFoundError();
    }
  }
}

function isKnownError(error: unknown, code: string): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
  );
}

function toPost(record: PostRecord): Post {
  return {
    id: normalizeUuid(record.id),
    title: record.title,
    body: record.body,
    code: record.code,
    imageUrl: record.imageUrl,
    tags: record.tags.map(({ tag }) => tag.name).sort(),
    author: { id: normalizeUuid(record.author.id), name: record.author.name },
    likesCount: record._count.likes,
    commentsCount: record._count.comments,
    likedByMe: record.likes.length > 0,
    createdAt: record.createdAt,
  };
}

function toComment(record: {
  id: string;
  postId: string;
  body: string;
  createdAt: Date;
  author: { id: string; name: string };
}): Comment {
  return {
    id: normalizeUuid(record.id),
    postId: normalizeUuid(record.postId),
    body: record.body,
    author: { id: normalizeUuid(record.author.id), name: record.author.name },
    createdAt: record.createdAt,
  };
}
