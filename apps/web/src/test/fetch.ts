import { vi } from 'vitest'

export function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

/** Substitui o fetch global por um mock que responde, em ordem, com as respostas informadas. */
export function mockFetch(...responses: Array<Response | Error>) {
  const fetchMock = vi.fn<(request: Request) => Promise<Response>>()
  for (const response of responses) {
    if (response instanceof Error) fetchMock.mockRejectedValueOnce(response)
    else fetchMock.mockResolvedValueOnce(response)
  }
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

export const tokenResponse = { accessToken: 'jwt-token', tokenType: 'Bearer', expiresIn: 3600 }

export function noContent() {
  return new Response(null, { status: 204 })
}

type Route = (request: Request) => Response | Promise<Response>

/**
 * Substitui o fetch global por um mock que responde conforme o método e o caminho,
 * útil para páginas que fazem várias requisições em paralelo.
 * Chaves no formato "GET /api/posts" ou "PUT /api/posts/:id/like" (":param" casa um segmento).
 */
export function routeFetch(routes: Record<string, Route>) {
  const compiled = Object.entries(routes).map(([key, handler]) => {
    const [method, path] = key.split(' ')
    const pattern = new RegExp(`^${path.replace(/:[^/]+/g, '[^/]+')}$`)
    return { method, pattern, handler }
  })
  const fetchMock = vi.fn<(request: Request) => Promise<Response>>(async (request) => {
    const { pathname } = new URL(request.url)
    const route = compiled.find((r) => r.method === request.method && r.pattern.test(pathname))
    if (!route) throw new Error(`Rota não simulada: ${request.method} ${pathname}`)
    return route.handler(request)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** Requisições feitas ao mock, no formato "MÉTODO /caminho?query". */
export function calls(fetchMock: ReturnType<typeof routeFetch>) {
  return fetchMock.mock.calls.map(([request]) => {
    const url = new URL(request.url)
    return `${request.method} ${url.pathname}${url.search}`
  })
}
