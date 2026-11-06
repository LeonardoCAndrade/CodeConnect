import { api } from './client'
import type { components } from './schema'

export type LoginInput = components['schemas']['CreateTokenDto']
export type SignupInput = components['schemas']['CreateUserDto']
export type TokenResponse = components['schemas']['TokenResponseDto']

export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const statusMessages: Record<number, string> = {
  401: 'Email ou senha inválidos.',
  409: 'Este email já está cadastrado.',
}

function validationMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object' || !('message' in body)) return undefined
  const { message } = body as { message: unknown }
  const first = Array.isArray(message) ? message[0] : message
  return typeof first === 'string' ? first : undefined
}

function toApiError(response: Response, body: unknown): ApiError {
  const message =
    statusMessages[response.status] ??
    (response.status === 400 ? validationMessage(body) ?? 'Dados inválidos.' : 'Erro inesperado. Tente novamente.')
  return new ApiError(message, response.status)
}

async function request<T>(call: () => Promise<{ data?: T; error?: unknown; response: Response }>): Promise<T> {
  let result: Awaited<ReturnType<typeof call>>
  try {
    result = await call()
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor.')
  }
  if (!result.response.ok || result.data === undefined) throw toApiError(result.response, result.error)
  return result.data
}

export function login(input: LoginInput): Promise<TokenResponse> {
  return request(() => api.POST('/auth/tokens', { body: input }))
}

export async function signup(input: SignupInput): Promise<TokenResponse> {
  await request(() => api.POST('/users', { body: input }))
  return login({ email: input.email, password: input.password })
}
