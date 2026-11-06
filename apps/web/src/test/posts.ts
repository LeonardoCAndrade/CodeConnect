import type { Comment, PostDetail } from '../api/posts'

let sequence = 0

export function makePost(overrides: Partial<PostDetail> = {}): PostDetail {
  sequence += 1
  return {
    id: `00000000-0000-4000-8000-${String(sequence).padStart(12, '0')}`,
    title: `Post ${sequence}`,
    body: 'Descrição do projeto',
    imageUrl: 'https://example.com/capa.png',
    tags: ['React'],
    author: { id: 'a1', name: 'Julio Lima', handle: 'julio.lima' },
    likesCount: 2,
    commentsCount: 1,
    likedByMe: false,
    createdAt: '2026-11-06T12:00:00.000Z',
    code: null,
    ...overrides,
  }
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
  sequence += 1
  return {
    id: `c-${sequence}`,
    body: 'Muito bom!',
    author: { id: 'a2', name: 'Marcia Alves', handle: 'marcia.alves' },
    createdAt: '2026-11-06T12:30:00.000Z',
    ...overrides,
  }
}

export function page(items: PostDetail[], total = items.length, pageNumber = 1) {
  return { items, page: pageNumber, pageSize: 6, total }
}
