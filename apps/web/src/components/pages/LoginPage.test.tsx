import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
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

test('faz login na API e guarda a sessão', async () => {
  const user = userEvent.setup()
  const fetchMock = mockFetch(jsonResponse(201, tokenResponse))
  render(<MemoryRouter><LoginPage /></MemoryRouter>)

  await user.type(screen.getByLabelText('Email'), 'ana@example.com')
  await user.type(screen.getByLabelText('Senha'), 'senha123')
  await user.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
  await user.click(screen.getByRole('button', { name: 'Login' }))

  expect(await screen.findByText('Login realizado com sucesso!')).toBeInTheDocument()
  expect(fetchMock.mock.calls[0][0].url).toMatch(/\/api\/auth\/tokens$/)
  expect(getAccessToken()).toBe('jwt-token')
  expect(localStorage.length).toBe(1)
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
