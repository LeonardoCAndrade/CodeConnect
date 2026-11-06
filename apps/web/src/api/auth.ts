import { api } from './client'
import { ApiError, request } from './request'
import type { components } from './schema'

export { ApiError } from './request'

export type LoginInput = components['schemas']['CreateTokenDto']
export type SignupInput = components['schemas']['CreateUserDto']
export type TokenResponse = components['schemas']['TokenResponseDto']

const authMessages = {
  401: 'Email ou senha inválidos.',
  409: 'Este email já está cadastrado.',
}

export function login(input: LoginInput): Promise<TokenResponse> {
  return request(() => api.POST('/auth/tokens', { body: input }), authMessages)
}

export async function signup(input: SignupInput): Promise<TokenResponse> {
  await request(() => api.POST('/users', { body: input }), authMessages)
  try {
    return await login({ email: input.email, password: input.password })
  } catch {
    // A conta já existe: repetir o cadastro resultaria em 409, então orientamos a entrar.
    throw new ApiError('Cadastro realizado, mas não foi possível entrar automaticamente. Faça seu login.')
  }
}
