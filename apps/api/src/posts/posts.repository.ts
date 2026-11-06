import { Comment, Post, TagUsage } from './post.entity.js';

export const POST_SORTS = ['recent', 'popular'] as const;
export type PostSort = (typeof POST_SORTS)[number];

export interface ListPostsQuery {
  /** Consulta full-text já sanitizada (veja toFullTextQuery). */
  search?: string;
  /** Todas as tags precisam estar no post. */
  tags: string[];
  sort: PostSort;
  page: number;
  pageSize: number;
  /** Usuário autenticado, para calcular likedByMe. */
  viewerId?: string;
}

export interface PostPage {
  items: Post[];
  total: number;
}

export interface NewPost {
  title: string;
  body: string;
  code: string | null;
  imageUrl: string | null;
  tags: string[];
  authorId: string;
}

export interface NewComment {
  postId: string;
  authorId: string;
  body: string;
}

export class PostNotFoundError extends Error {
  constructor() {
    super('Post não encontrado');
    this.name = 'PostNotFoundError';
  }
}

// Classe abstrata usada como token de injeção: o módulo escolhe a implementação.
export abstract class PostsRepository {
  abstract list(query: ListPostsQuery): Promise<PostPage>;

  abstract findById(id: string, viewerId?: string): Promise<Post | undefined>;

  abstract create(data: NewPost): Promise<Post>;

  /** Idempotente. @throws {PostNotFoundError} */
  abstract like(postId: string, userId: string): Promise<void>;

  /** Idempotente. @throws {PostNotFoundError} */
  abstract unlike(postId: string, userId: string): Promise<void>;

  /** @throws {PostNotFoundError} */
  abstract listComments(postId: string): Promise<Comment[]>;

  /** @throws {PostNotFoundError} */
  abstract createComment(data: NewComment): Promise<Comment>;

  /** Tags com pelo menos um post, das mais usadas para as menos usadas. */
  abstract listTags(limit: number): Promise<TagUsage[]>;
}
