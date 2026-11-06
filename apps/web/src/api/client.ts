import createClient from 'openapi-fetch'
import type { paths } from './schema'
import { getAccessToken } from './session'

const baseUrl = new URL(import.meta.env.VITE_API_URL ?? '/api', window.location.origin).href.replace(/\/$/, '')

export const api = createClient<paths>({
  baseUrl,
  // Lê o fetch a cada chamada para permitir substituí-lo nos testes.
  fetch: (request) => globalThis.fetch(request),
})

// Rotas públicas não recebem o token, para que uma sessão antiga não interfira no login e no cadastro.
const publicPaths = ['/auth/tokens', '/users']

api.use({
  onRequest({ request }) {
    const { pathname } = new URL(request.url)
    if (request.method === 'POST' && publicPaths.some((path) => pathname.endsWith(path))) return request
    const token = getAccessToken()
    if (token) request.headers.set('Authorization', `Bearer ${token}`)
    return request
  },
})
