import { api } from './client'
import { request, requestNoContent } from './request'
import type { components, operations } from './schema'

export type Post = components['schemas']['PostResponseDto']
export type PostDetail = components['schemas']['PostDetailResponseDto']
export type PostPage = components['schemas']['PostPageResponseDto']
export type Comment = components['schemas']['CommentResponseDto']
export type TagUsage = components['schemas']['TagResponseDto']
export type NewPost = components['schemas']['CreatePostDto']
export type PostSort = NonNullable<NonNullable<operations['PostsController_list']['parameters']['query']>['sort']>
export type ListPostsParams = NonNullable<operations['PostsController_list']['parameters']['query']>

const postMessages = { 404: 'Post não encontrado.' }

export function listPosts(params: ListPostsParams): Promise<PostPage> {
  return request(() => api.GET('/posts', { params: { query: params } }))
}

export function getPost(id: string): Promise<PostDetail> {
  return request(() => api.GET('/posts/{id}', { params: { path: { id } } }), postMessages)
}

export function createPost(input: NewPost): Promise<PostDetail> {
  return request(() => api.POST('/posts', { body: input }))
}

export function likePost(id: string): Promise<void> {
  return requestNoContent(() => api.PUT('/posts/{id}/like', { params: { path: { id } } }), postMessages)
}

export function unlikePost(id: string): Promise<void> {
  return requestNoContent(() => api.DELETE('/posts/{id}/like', { params: { path: { id } } }), postMessages)
}

export function listComments(postId: string): Promise<Comment[]> {
  return request(() => api.GET('/posts/{id}/comments', { params: { path: { id: postId } } }), postMessages)
}

export function createComment(postId: string, body: string): Promise<Comment> {
  return request(
    () => api.POST('/posts/{id}/comments', { params: { path: { id: postId } }, body: { body } }),
    postMessages,
  )
}

export function listTags(limit = 10): Promise<TagUsage[]> {
  return request(() => api.GET('/tags', { params: { query: { limit } } }))
}
