import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, test } from 'vitest'
import { getAccessToken } from '../../api/session'
import { jsonResponse, mockFetch, tokenResponse } from '../../test/fetch'
import LoginPage from './LoginPage'

test('apresenta a página de login com o banner', () => {
  render(<MemoryRouter><LoginPage /></MemoryRouter>)

  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
  expect(screen.getByLabelText('Email')).toBeInTheDocument()
  expect(document.querySelector('img[src="/banner-login.png"]')).toBeInTheDocument()
})

function renderWithRoutes(state?: unknown) {
  render(
    <MemoryRouter initialEntries={[{ pathname: '/login', state }]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<h1>Feed</h1>} />
        <Route path="/publicar" element={<h1>Publicar</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

test('faz login na API, guarda a sessão e vai para o feed', async () => {
  const user = userEvent.setup()
  const fetchMock = mockFetch(jsonResponse(201, tokenResponse))
  renderWithRoutes()

  await user.type(screen.getByLabelText('Email'), 'ana@example.com')
  await user.type(screen.getByLabelText('Senha'), 'senha123')
  await user.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
  await user.click(screen.getByRole('button', { name: 'Login' }))

  expect(await screen.findByRole('heading', { name: 'Feed' })).toBeInTheDocument()
  expect(fetchMock.mock.calls[0][0].url).toMatch(/\/api\/auth\/tokens$/)
  expect(getAccessToken()).toBe('jwt-token')
  expect(localStorage.length).toBe(1)
})

test('volta para a página que pediu o login', async () => {
  const user = userEvent.setup()
  mockFetch(jsonResponse(201, tokenResponse))
  renderWithRoutes({ from: { pathname: '/publicar' } })

  await user.type(screen.getByLabelText('Email'), 'ana@example.com')
  await user.type(screen.getByLabelText('Senha'), 'senha123')
  await user.click(screen.getByRole('button', { name: 'Login' }))

  expect(await screen.findByRole('heading', { name: 'Publicar' })).toBeInTheDocument()
})

test('mostra o erro de credenciais inválidas', async () => {
  const user = userEvent.setup()
  mockFetch(jsonResponse(401, { statusCode: 401, message: 'Email ou senha inválidos' }))
  render(<MemoryRouter><LoginPage /></MemoryRouter>)

  await user.type(screen.getByLabelText('Email'), 'ana@example.com')
  await user.type(screen.getByLabelText('Senha'), 'errada')
  await user.click(screen.getByRole('button', { name: 'Login' }))

  expect(await screen.findByText('Email ou senha inválidos.')).toBeInTheDocument()
  expect(getAccessToken()).toBeNull()
})
