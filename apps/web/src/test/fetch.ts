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
