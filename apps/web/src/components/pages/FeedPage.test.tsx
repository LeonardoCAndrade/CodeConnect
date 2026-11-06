import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { expect, it } from 'vitest'
import { saveSession } from '../../api/session'
import { calls, jsonResponse, noContent, routeFetch } from '../../test/fetch'
import { makePost, page } from '../../test/posts'
import FeedPage from './FeedPage'

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>
}

function renderFeed(path = '/') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/login" element={<h1>Login</h1>} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  )
}

const tags = [
  { name: 'React', postsCount: 2 },
  { name: 'CSS', postsCount: 1 },
]

it('lista os posts para quem não está logado, com as tags sugeridas', async () => {
  const fetchMock = routeFetch({
    'GET /api/tags': () => jsonResponse(200, tags),
    'GET /api/posts': () => jsonResponse(200, page([makePost({ title: 'Hooks no React' }), makePost({ title: 'Sem capa', imageUrl: null })])),
  })
  renderFeed()

  const list = await screen.findByRole('list', { name: 'Posts' })
  expect(within(list).getAllByRole('article')).toHaveLength(2)
  // No feed, a imagem fica num link oculto das tecnologias assistivas (o título já é o link).
  expect(screen.getByRole('img', { name: 'Sem capa (imagem indisponível)', hidden: true })).toBeInTheDocument()
  const filters = screen.getByRole('list', { name: 'Filtrar por tags' })
  expect(await within(filters).findByRole('button', { name: 'Filtrar por CSS' })).toBeInTheDocument()
  expect(calls(fetchMock)).toContain('GET /api/posts?sort=recent&page=1&pageSize=6')
})

it('envia a busca, as tags e a ordenação para o backend e mantém os filtros na URL', async () => {
  const user = userEvent.setup()
  const fetchMock = routeFetch({
    'GET /api/tags': () => jsonResponse(200, tags),
    'GET /api/posts': () => jsonResponse(200, page([makePost()])),
  })
  renderFeed()
  await screen.findByRole('list', { name: 'Posts' })

  await user.type(screen.getByRole('searchbox', { name: 'Buscar posts' }), 'hooks')
  await screen.findByText('/?q=hooks', { selector: 'output' })
  const filters = screen.getByRole('list', { name: 'Filtrar por tags' })
  await user.click(await within(filters).findByRole('button', { name: 'Filtrar por React' }))
  await user.click(screen.getByRole('button', { name: 'Populares' }))

  expect(screen.getByTestId('location')).toHaveTextContent('/?q=hooks&tags=React&sort=popular')
  await screen.findByRole('list', { name: 'Posts' })
  expect(calls(fetchMock)).toContain('GET /api/posts?q=hooks&tags=React&sort=popular&page=1&pageSize=6')

  await user.click(screen.getByRole('button', { name: 'Limpar tudo' }))
  expect(screen.getByTestId('location')).toHaveTextContent(/^\/\?sort=popular$/)
  expect(screen.getByRole('searchbox', { name: 'Buscar posts' })).toHaveValue('')
})

it('informa quando nenhum post atende aos filtros', async () => {
  routeFetch({
    'GET /api/tags': () => jsonResponse(200, []),
    'GET /api/posts': () => jsonResponse(200, page([])),
  })
  renderFeed('/?q=inexistente')
  expect(await screen.findByText(/Nenhum post encontrado/)).toBeInTheDocument()
  expect(screen.getByRole('searchbox', { name: 'Buscar posts' })).toHaveValue('inexistente')
})

it('carrega mais posts quando há outra página', async () => {
  const user = userEvent.setup()
  routeFetch({
    'GET /api/tags': () => jsonResponse(200, []),
    'GET /api/posts': (request) =>
      new URL(request.url).searchParams.get('page') === '2'
        ? jsonResponse(200, page([makePost({ title: 'Da página 2' })], 2, 2))
        : jsonResponse(200, page([makePost({ title: 'Da página 1' })], 2)),
  })
  renderFeed()

  await user.click(await screen.findByRole('button', { name: 'Carregar mais' }))
  expect(await screen.findByRole('heading', { name: 'Da página 2' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Da página 1' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Carregar mais' })).not.toBeInTheDocument()
})

it('leva ao login ao tentar curtir sem estar logado', async () => {
  const user = userEvent.setup()
  routeFetch({
    'GET /api/tags': () => jsonResponse(200, []),
    'GET /api/posts': () => jsonResponse(200, page([makePost()])),
  })
  renderFeed()

  await user.click(await screen.findByRole('button', { name: /^Faça login para curtir/ }))
  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
})

it('curte e descurte com a sessão ativa', async () => {
  const user = userEvent.setup()
  saveSession('jwt-token', 3600, false)
  const fetchMock = routeFetch({
    'GET /api/tags': () => jsonResponse(200, []),
    'GET /api/posts': () => jsonResponse(200, page([makePost({ likesCount: 2 })])),
    'PUT /api/posts/:id/like': () => noContent(),
    'DELETE /api/posts/:id/like': () => noContent(),
  })
  renderFeed()

  await user.click(await screen.findByRole('button', { name: 'Curtir (2 curtidas)' }))
  const liked = await screen.findByRole('button', { name: 'Remover curtida (3 curtidas)' })
  expect(liked).toHaveAttribute('aria-pressed', 'true')
  await user.click(liked)
  expect(await screen.findByRole('button', { name: 'Curtir (2 curtidas)' })).toBeInTheDocument()

  const likeCalls = fetchMock.mock.calls.map(([request]) => request).filter((request) => request.url.endsWith('/like'))
  expect(likeCalls.map((request) => request.method)).toEqual(['PUT', 'DELETE'])
  expect(likeCalls[0].headers.get('Authorization')).toBe('Bearer jwt-token')
})

it('desfaz a curtida e avisa quando a API recusa', async () => {
  const user = userEvent.setup()
  saveSession('jwt-token', 3600, false)
  routeFetch({
    'GET /api/tags': () => jsonResponse(200, []),
    'GET /api/posts': () => jsonResponse(200, page([makePost({ likesCount: 2 })])),
    'PUT /api/posts/:id/like': () => jsonResponse(404, { statusCode: 404, message: 'Post não encontrado' }),
  })
  renderFeed()

  await user.click(await screen.findByRole('button', { name: 'Curtir (2 curtidas)' }))
  expect(await screen.findByText('Post não encontrado.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Curtir (2 curtidas)' })).toHaveAttribute('aria-pressed', 'false')
})

it('mostra o erro quando o feed não carrega', async () => {
  routeFetch({
    'GET /api/tags': () => jsonResponse(200, []),
    'GET /api/posts': () => Promise.reject(new TypeError('fetch failed')),
  })
  renderFeed()
  expect(await screen.findByText('Não foi possível conectar ao servidor.')).toBeInTheDocument()
})
