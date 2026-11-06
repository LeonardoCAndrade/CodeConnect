import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import { getAccessToken } from '../../api/session'
import { jsonResponse, mockFetch, tokenResponse } from '../../test/fetch'
import SignupPage from './SignupPage'

test('apresenta a página de cadastro com o banner', () => {
  render(<MemoryRouter><SignupPage /></MemoryRouter>)

  expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeInTheDocument()
  expect(screen.getByLabelText('Nome')).toBeInTheDocument()
  expect(screen.getByLabelText('Email')).toBeInTheDocument()
  expect(screen.getByLabelText('Senha')).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Banner CodeConnect' })).toHaveAttribute('src', '/banner-cadastro.png')
})

async function fillAndSubmit() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
  await user.type(screen.getByLabelText('Email'), 'ana@example.com')
  await user.type(screen.getByLabelText('Senha'), 'senha123')
  await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
}

test('cadastra na API, faz login automático e guarda a sessão', async () => {
  const fetchMock = mockFetch(
    jsonResponse(201, { id: '1', name: 'Ana Souza', email: 'ana@example.com', createdAt: '2026-11-05T12:00:00.000Z' }),
    jsonResponse(201, tokenResponse),
  )
  render(<MemoryRouter><SignupPage /></MemoryRouter>)
  await fillAndSubmit()

  expect(await screen.findByText('Cadastro realizado! Você já está conectado.')).toBeInTheDocument()
  expect(fetchMock.mock.calls.map(([request]) => new URL(request.url).pathname)).toEqual(['/api/users', '/api/auth/tokens'])
  expect(getAccessToken()).toBe('jwt-token')
  expect(sessionStorage.length).toBe(1)
})

test('mostra o erro de email já cadastrado', async () => {
  mockFetch(jsonResponse(409, { statusCode: 409, message: 'Email já cadastrado' }))
  render(<MemoryRouter><SignupPage /></MemoryRouter>)
  await fillAndSubmit()

  expect(await screen.findByText('Este email já está cadastrado.')).toBeInTheDocument()
  expect(getAccessToken()).toBeNull()
})
