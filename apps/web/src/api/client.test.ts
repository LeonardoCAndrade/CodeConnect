import { expect, it } from 'vitest'
import { jsonResponse, mockFetch } from '../test/fetch'
import { api } from './client'
import { saveSession } from './session'

const user = { id: '3f1c2b4e-8a1d-4c6e-9f2a-1b2c3d4e5f60', name: 'Ana', email: 'ana@example.com', createdAt: '2026-11-05T12:00:00.000Z' }

it('envia o token Bearer quando há sessão', async () => {
  saveSession('jwt-token', 3600, true)
  const fetchMock = mockFetch(jsonResponse(200, user))
  await api.GET('/users/me')
  const request = fetchMock.mock.calls[0][0]
  expect(request.url).toBe(`${window.location.origin}/api/users/me`)
  expect(request.headers.get('Authorization')).toBe('Bearer jwt-token')
})

it('não envia Authorization sem sessão', async () => {
  const fetchMock = mockFetch(jsonResponse(401, { statusCode: 401, message: 'Unauthorized' }))
  await api.GET('/users/me')
  expect(fetchMock.mock.calls[0][0].headers.has('Authorization')).toBe(false)
})
