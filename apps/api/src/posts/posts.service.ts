import { Injectable, NotFoundException } from '@nestjs/common';
import { toHandle } from './author-handle.js';
import { CreateCommentDto, CreatePostDto } from './dto/create-post.dto.js';
import { ListPostsQueryDto } from './dto/list-posts-query.dto.js';
import {
  AuthorDto,
  CommentResponseDto,
  PostDetailResponseDto,
  PostPageResponseDto,
  PostResponseDto,
  TagResponseDto,
} from './dto/post-response.dto.js';
import { toFullTextQuery } from './full-text-query.js';
import { Comment, Post, PostAuthor } from './post.entity.js';
import { PostNotFoundError, PostsRepository } from './posts.repository.js';

const DEFAULT_PAGE_SIZE = 6;
const DEFAULT_TAGS_LIMIT = 10;

@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}

  async list(
    query: ListPostsQueryDto,
    viewerId?: string,
  ): Promise<PostPageResponseDto> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
    const result = await this.postsRepository.list({
      search: toFullTextQuery(query.q),
      tags: (query.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
      sort: query.sort ?? 'recent',
      page,
      pageSize,
      viewerId,
    });
    return {
      items: result.items.map(toPostResponse),
      page,
      pageSize,
      total: result.total,
    };
  }

  async findById(
    id: string,
    viewerId?: string,
  ): Promise<PostDetailResponseDto> {
    const post = await this.postsRepository.findById(id, viewerId);
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }
    return toPostDetailResponse(post);
  }

  async create(
    dto: CreatePostDto,
    authorId: string,
  ): Promise<PostDetailResponseDto> {
    const post = await this.postsRepository.create({
      title: dto.title,
      body: dto.body,
      code: dto.code?.trim() ? dto.code : null,
      imageUrl: dto.imageUrl ?? null,
      tags: dto.tags ?? [],
      authorId,
    });
    return toPostDetailResponse(post);
  }

  like(postId: string, userId: string): Promise<void> {
    return translateNotFound(this.postsRepository.like(postId, userId));
  }

  unlike(postId: string, userId: string): Promise<void> {
    return translateNotFound(this.postsRepository.unlike(postId, userId));
  }

  async listComments(postId: string): Promise<CommentResponseDto[]> {
    const comments = await translateNotFound(
      this.postsRepository.listComments(postId),
    );
    return comments.map(toCommentResponse);
  }

  async createComment(
    postId: string,
    dto: CreateCommentDto,
    authorId: string,
  ): Promise<CommentResponseDto> {
    const comment = await translateNotFound(
      this.postsRepository.createComment({ postId, authorId, body: dto.body }),
    );
    return toCommentResponse(comment);
  }

  listTags(limit = DEFAULT_TAGS_LIMIT): Promise<TagResponseDto[]> {
    return this.postsRepository.listTags(limit);
  }
}

async function translateNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof PostNotFoundError) {
      throw new NotFoundException(error.message);
    }
    throw error;
  }
}

function toAuthor(author: PostAuthor): AuthorDto {
  return { id: author.id, name: author.name, handle: toHandle(author.name) };
}

function toPostResponse(post: Post): PostResponseDto {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    imageUrl: post.imageUrl,
    tags: post.tags,
    author: toAuthor(post.author),
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    likedByMe: post.likedByMe,
    createdAt: post.createdAt,
  };
}

function toPostDetailResponse(post: Post): PostDetailResponseDto {
  return Object.assign(toPostResponse(post), { code: post.code });
}

function toCommentResponse(comment: Comment): CommentResponseDto {
  return {
    id: comment.id,
    body: comment.body,
    author: toAuthor(comment.author),
    createdAt: comment.createdAt,
  };
}
