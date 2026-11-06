import type { Location } from 'react-router'

/** Página para onde voltar após o login: a de origem (RequireAuth, curtir, comentar) ou o feed. */
export function redirectTarget(state: unknown): string {
  const from = (state as { from?: Partial<Location> } | null)?.from
  if (!from?.pathname || from.pathname === '/login' || from.pathname === '/cadastro') return '/'
  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
}
