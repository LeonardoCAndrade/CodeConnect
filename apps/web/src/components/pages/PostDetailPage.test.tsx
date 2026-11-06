import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, it } from 'vitest'
import { saveSession } from '../../api/session'
import { jsonResponse, routeFetch } from '../../test/fetch'
import { makeComment, makePost } from '../../test/posts'
import PostDetailPage from './PostDetailPage'

const post = makePost({ title: 'Hooks no React', code: 'const a = 1', commentsCount: 1 })

function renderDetail() {
  render(
    <MemoryRouter initialEntries={[`/posts/${post.id}`]}>
      <Routes>
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/login" element={<h1>Login</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

it('mostra o post, o código e os comentários para quem não está logado', async () => {
  routeFetch({
    'GET /api/posts/:id': () => jsonResponse(200, post),
    'GET /api/posts/:id/comments': () => jsonResponse(200, [makeComment({ body: 'Achei ótimo!' })]),
  })
  renderDetail()

  expect(await screen.findByRole('heading', { level: 1, name: 'Hooks no React' })).toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Código do projeto' })).toHaveTextContent('const a = 1')
  const comments = screen.getByRole('region', { name: 'Comentários' })
  expect(within(comments).getByText('Achei ótimo!')).toBeInTheDocument()
  expect(within(comments).getByRole('link', { name: 'Faça login para comentar' })).toBeInTheDocument()
})

it('comenta com a sessão ativa e atualiza a lista e a contagem', async () => {
  const user = userEvent.setup()
  saveSession('jwt-token', 3600, false)
  const fetchMock = routeFetch({
    'GET /api/posts/:id': () => jsonResponse(200, post),
    'GET /api/posts/:id/comments': () => jsonResponse(200, []),
    'POST /api/posts/:id/comments': async (request) => {
      const { body } = (await request.json()) as { body: string }
      return jsonResponse(201, makeComment({ body }))
    },
  })
  renderDetail()

  await user.type(await screen.findByRole('textbox', { name: 'Escreva um comentário' }), 'Parabéns!')
  await user.click(screen.getByRole('button', { name: 'Comentar' }))

  const comments = screen.getByRole('region', { name: 'Comentários' })
  expect(await within(comments).findByText('Parabéns!')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /^Compartilhar$/ })).toBeInTheDocument()
  expect(screen.getByText('2 comentários')).toBeInTheDocument()
  const request = fetchMock.mock.calls.map(([r]) => r).find((r) => r.method === 'POST')
  expect(request?.headers.get('Authorization')).toBe('Bearer jwt-token')
})

it('informa quando o post não existe', async () => {
  routeFetch({
    'GET /api/posts/:id': () => jsonResponse(404, { statusCode: 404, message: 'Post não encontrado' }),
    'GET /api/posts/:id/comments': () => jsonResponse(404, { statusCode: 404, message: 'Post não encontrado' }),
  })
  renderDetail()
  expect(await screen.findByText('Post não encontrado.')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Voltar para o feed' })).toHaveAttribute('href', '/')
})
