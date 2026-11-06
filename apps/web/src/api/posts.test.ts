import { expect, it } from 'vitest'
import { calls, jsonResponse, noContent, routeFetch } from '../test/fetch'
import { makeComment, makePost, page } from '../test/posts'
import { createComment, createPost, getPost, likePost, listComments, listPosts, listTags, unlikePost } from './posts'
import { saveSession } from './session'

it('lista posts enviando busca, tags repetidas, ordenação e página', async () => {
  const fetchMock = routeFetch({ 'GET /api/posts': () => jsonResponse(200, page([makePost()])) })
  await expect(listPosts({ q: 'react hooks', tags: ['React', 'CSS'], sort: 'popular', page: 2, pageSize: 6 })).resolves.toMatchObject({ total: 1 })
  expect(calls(fetchMock)).toEqual(['GET /api/posts?q=react%20hooks&tags=React&tags=CSS&sort=popular&page=2&pageSize=6'])
})

it('traduz o 404 do detalhe em mensagem em português', async () => {
  routeFetch({ 'GET /api/posts/:id': () => jsonResponse(404, { statusCode: 404, message: 'Post não encontrado' }) })
  await expect(getPost('x')).rejects.toThrow('Post não encontrado.')
})

it('publica, curte, descurte e comenta com o token da sessão', async () => {
  saveSession('jwt-token', 3600, false)
  const post = makePost()
  const fetchMock = routeFetch({
    'POST /api/posts': () => jsonResponse(201, post),
    'PUT /api/posts/:id/like': () => noContent(),
    'DELETE /api/posts/:id/like': () => noContent(),
    'POST /api/posts/:id/comments': () => jsonResponse(201, makeComment()),
  })

  await expect(createPost({ title: 'T', body: 'B' })).resolves.toEqual(post)
  await expect(likePost(post.id)).resolves.toBeUndefined()
  await expect(unlikePost(post.id)).resolves.toBeUndefined()
  await expect(createComment(post.id, 'Oi')).resolves.toMatchObject({ body: 'Muito bom!' })

  expect(calls(fetchMock)).toEqual([
    'POST /api/posts',
    `PUT /api/posts/${post.id}/like`,
    `DELETE /api/posts/${post.id}/like`,
    `POST /api/posts/${post.id}/comments`,
  ])
  for (const [request] of fetchMock.mock.calls) expect(request.headers.get('Authorization')).toBe('Bearer jwt-token')
})

it('encerra a sessão quando a API recusa o token', async () => {
  saveSession('expirado', 3600, false)
  routeFetch({ 'PUT /api/posts/:id/like': () => jsonResponse(401, { statusCode: 401, message: 'Unauthorized' }) })
  await expect(likePost('1')).rejects.toThrow('Sua sessão expirou. Faça login novamente.')
  expect(sessionStorage.length).toBe(0)
})

it('lista comentários e tags', async () => {
  routeFetch({
    'GET /api/posts/:id/comments': () => jsonResponse(200, [makeComment()]),
    'GET /api/tags': () => jsonResponse(200, [{ name: 'React', postsCount: 2 }]),
  })
  await expect(listComments('1')).resolves.toHaveLength(1)
  await expect(listTags(5)).resolves.toEqual([{ name: 'React', postsCount: 2 }])
})
