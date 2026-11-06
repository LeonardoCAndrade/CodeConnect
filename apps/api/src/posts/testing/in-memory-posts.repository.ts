import { randomUUID } from 'node:crypto';
import { Comment, Post, PostAuthor, TagUsage } from '../post.entity.js';
import {
  ListPostsQuery,
  NewComment,
  NewPost,
  PostNotFoundError,
  PostPage,
  PostsRepository,
} from '../posts.repository.js';

type StoredPost = Omit<
  Post,
  'author' | 'likesCount' | 'commentsCount' | 'likedByMe'
> & { authorId: string };

// Implementação em memória para testes unitários, sem banco de dados. A busca
// imita o full-text do SQL Server: todos os termos, por prefixo, sem acento.
export class InMemoryPostsRepository extends PostsRepository {
  private readonly posts = new Map<string, StoredPost>();
  private readonly likes = new Set<string>();
  private readonly comments: Comment[] = [];
  private readonly authors = new Map<string, string>();
  private clock = 0;

  addAuthor(author: PostAuthor): void {
    this.authors.set(author.id, author.name);
  }

  list(query: ListPostsQuery): Promise<PostPage> {
    // query.search vem no formato do CONTAINSTABLE: "termo1*" AND "termo2*".
    const terms = [...(query.search ?? '').matchAll(/"([^"*]+)\*"/g)].map(
      (match) => fold(match[1]),
    );
    const tags = query.tags.map((tag) => tag.toLowerCase());
    const matches = [...this.posts.values()]
      .filter((post) => {
        const words =
          fold(`${post.title} ${post.body}`).match(/[\p{L}\p{N}]+/gu) ?? [];
        return terms.every((term) =>
          words.some((word) => word.startsWith(term)),
        );
      })
      .filter((post) => {
        const own = post.tags.map((tag) => tag.toLowerCase());
        return tags.every((tag) => own.includes(tag));
      })
      .map((post) => this.toPost(post, query.viewerId))
      .sort((a, b) =>
        query.sort === 'popular' && b.likesCount !== a.likesCount
          ? b.likesCount - a.likesCount
          : b.createdAt.getTime() - a.createdAt.getTime(),
      );
    const start = (query.page - 1) * query.pageSize;
    return Promise.resolve({
      items: matches.slice(start, start + query.pageSize),
      total: matches.length,
    });
  }

  findById(id: string, viewerId?: string): Promise<Post | undefined> {
    const post = this.posts.get(id);
    return Promise.resolve(post && this.toPost(post, viewerId));
  }

  create(data: NewPost): Promise<Post> {
    const post: StoredPost = {
      ...data,
      id: randomUUID(),
      createdAt: this.nextDate(),
    };
    this.posts.set(post.id, post);
    return Promise.resolve(this.toPost(post, data.authorId));
  }

  async like(postId: string, userId: string): Promise<void> {
    await this.ensurePost(postId);
    this.likes.add(`${userId}:${postId}`);
  }

  async unlike(postId: string, userId: string): Promise<void> {
    await this.ensurePost(postId);
    this.likes.delete(`${userId}:${postId}`);
  }

  async listComments(postId: string): Promise<Comment[]> {
    await this.ensurePost(postId);
    return this.comments.filter((c) => c.postId === postId);
  }

  async createComment(data: NewComment): Promise<Comment> {
    await this.ensurePost(data.postId);
    const comment: Comment = {
      id: randomUUID(),
      postId: data.postId,
      body: data.body,
      author: this.author(data.authorId),
      createdAt: this.nextDate(),
    };
    this.comments.push(comment);
    return comment;
  }

  listTags(limit: number): Promise<TagUsage[]> {
    const counts = new Map<string, number>();
    for (const post of this.posts.values()) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Promise.resolve(
      [...counts]
        .map(([name, postsCount]) => ({ name, postsCount }))
        .sort(
          (a, b) => b.postsCount - a.postsCount || a.name.localeCompare(b.name),
        )
        .slice(0, limit),
    );
  }

  private ensurePost(postId: string): Promise<void> {
    return this.posts.has(postId)
      ? Promise.resolve()
      : Promise.reject(new PostNotFoundError());
  }

  private toPost(post: StoredPost, viewerId?: string): Post {
    const { authorId, ...rest } = post;
    return {
      ...rest,
      tags: [...post.tags].sort(),
      author: this.author(authorId),
      likesCount: [...this.likes].filter((key) => key.endsWith(`:${post.id}`))
        .length,
      commentsCount: this.comments.filter((c) => c.postId === post.id).length,
      likedByMe: viewerId ? this.likes.has(`${viewerId}:${post.id}`) : false,
    };
  }

  private author(id: string): PostAuthor {
    return { id, name: this.authors.get(id) ?? 'Autor' };
  }

  // Datas sempre crescentes, para a ordenação "recentes" ser determinística.
  private nextDate(): Date {
    this.clock += 1;
    return new Date(Date.UTC(2026, 0, 1) + this.clock * 1000);
  }
}

function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}
