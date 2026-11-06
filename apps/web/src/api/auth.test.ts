import { expect, it } from 'vitest'
import { jsonResponse, mockFetch, tokenResponse } from '../test/fetch'
import { ApiError, login, signup } from './auth'

const credentials = { email: 'ana@example.com', password: 'senha123' }

it('faz login com POST /auth/tokens e devolve o token', async () => {
  const fetchMock = mockFetch(jsonResponse(201, tokenResponse))
  await expect(login(credentials)).resolves.toEqual(tokenResponse)
  const request = fetchMock.mock.calls[0][0]
  expect(request.method).toBe('POST')
  expect(request.url).toBe(`${window.location.origin}/api/auth/tokens`)
  expect(await request.json()).toEqual(credentials)
})

it.each([
  [401, { statusCode: 401, message: 'Email ou senha inválidos' }, 'Email ou senha inválidos.'],
  [400, { statusCode: 400, message: ['email must be an email'] }, 'email must be an email'],
  [500, { statusCode: 500, message: 'Internal server error' }, 'Erro inesperado. Tente novamente.'],
])('traduz a resposta %i em ApiError', async (status, body, message) => {
  mockFetch(jsonResponse(status, body))
  await expect(login(credentials)).rejects.toEqual(new ApiError(message, status))
})

it('informa falha de conexão', async () => {
  mockFetch(new TypeError('fetch failed'))
  await expect(login(credentials)).rejects.toThrow('Não foi possível conectar ao servidor.')
})

it('cadastra com POST /users e em seguida faz login', async () => {
  const fetchMock = mockFetch(
    jsonResponse(201, { id: '1', name: 'Ana', email: credentials.email, createdAt: '2026-11-05T12:00:00.000Z' }),
    jsonResponse(201, tokenResponse),
  )
  await expect(signup({ name: 'Ana', ...credentials })).resolves.toEqual(tokenResponse)
  const [[createUser], [createToken]] = fetchMock.mock.calls
  expect(createUser.url).toBe(`${window.location.origin}/api/users`)
  expect(await createUser.json()).toEqual({ name: 'Ana', ...credentials })
  expect(createToken.url).toBe(`${window.location.origin}/api/auth/tokens`)
  expect(await createToken.json()).toEqual(credentials)
})

it('não faz login quando o email já está cadastrado', async () => {
  const fetchMock = mockFetch(jsonResponse(409, { statusCode: 409, message: 'Email já cadastrado' }))
  await expect(signup({ name: 'Ana', ...credentials })).rejects.toThrow('Este email já está cadastrado.')
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
