export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export type StatusMessages = Partial<Record<number, string>>

const defaultMessages: StatusMessages = {
  401: 'Sua sessão expirou. Faça login novamente.',
  404: 'Conteúdo não encontrado.',
}

type ApiResult<T> = { data?: T; error?: unknown; response: Response }

function validationMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object' || !('message' in body)) return undefined
  const { message } = body as { message: unknown }
  const first = Array.isArray(message) ? message[0] : message
  return typeof first === 'string' ? first : undefined
}

function toApiError(response: Response, body: unknown, messages: StatusMessages): ApiError {
  const message =
    messages[response.status] ??
    defaultMessages[response.status] ??
    (response.status === 400 ? validationMessage(body) ?? 'Dados inválidos.' : 'Erro inesperado. Tente novamente.')
  return new ApiError(message, response.status)
}

async function send<T>(call: () => Promise<ApiResult<T>>, messages: StatusMessages): Promise<ApiResult<T>> {
  let result: ApiResult<T>
  try {
    result = await call()
  } catch (error) {
    if (error instanceof TypeError) throw new ApiError('Não foi possível conectar ao servidor.')
    throw error
  }
  if (!result.response.ok) throw toApiError(result.response, result.error, messages)
  return result
}

/** Executa a chamada e devolve o corpo, ou lança ApiError com mensagem em português. */
export async function request<T>(call: () => Promise<ApiResult<T>>, messages: StatusMessages = {}): Promise<T> {
  const result = await send(call, messages)
  if (result.data === undefined) throw toApiError(result.response, result.error, messages)
  return result.data
}

/** Para respostas sem corpo (204). */
export async function requestNoContent(call: () => Promise<ApiResult<unknown>>, messages: StatusMessages = {}): Promise<void> {
  await send(call, messages)
}
