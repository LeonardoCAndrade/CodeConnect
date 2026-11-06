import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, it } from 'vitest'
import App from './App'
import { jsonResponse, routeFetch } from './test/fetch'
import { page } from './test/posts'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

function mockFeed() {
  routeFetch({
    'GET /api/tags': () => jsonResponse(200, []),
    'GET /api/posts': () => jsonResponse(200, page([])),
  })
}

it('abre o feed na página inicial, dentro do layout com o menu', async () => {
  mockFeed()
  renderAt('/')
  expect(screen.getByRole('heading', { name: 'Feed de projetos' })).toBeInTheDocument()
  expect(screen.getByRole('navigation', { name: 'Menu principal' })).toBeInTheDocument()
  expect(await screen.findByText(/Nenhum post encontrado/)).toBeInTheDocument()
})

it('redireciona rotas desconhecidas para o feed', () => {
  mockFeed()
  renderAt('/nao-existe')
  expect(screen.getByRole('heading', { name: 'Feed de projetos' })).toBeInTheDocument()
})

it('exige login para publicar', () => {
  renderAt('/publicar')
  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
})

it('navega entre login e cadastro', async () => {
  const user = userEvent.setup()
  renderAt('/login')

  await user.click(screen.getByRole('link', { name: 'Crie seu cadastro!' }))
  expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeInTheDocument()

  await user.click(screen.getByRole('link', { name: 'Faça seu login!' }))
  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
})
