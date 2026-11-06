import { afterEach, expect, it, vi } from 'vitest'
import { clearSession, getAccessToken, saveSession } from './session'

afterEach(() => {
  vi.useRealTimers()
})

it('guarda no localStorage quando "Lembrar-me" está marcado', () => {
  saveSession('token', 3600, true)
  expect(localStorage.length).toBe(1)
  expect(sessionStorage.length).toBe(0)
  expect(getAccessToken()).toBe('token')
})

it('guarda no sessionStorage quando "Lembrar-me" não está marcado', () => {
  saveSession('token', 3600, false)
  expect(localStorage.length).toBe(0)
  expect(sessionStorage.length).toBe(1)
  expect(getAccessToken()).toBe('token')
})

it('substitui a sessão anterior ao salvar uma nova', () => {
  saveSession('antigo', 3600, true)
  saveSession('novo', 3600, false)
  expect(localStorage.length).toBe(0)
  expect(getAccessToken()).toBe('novo')
})

it('descarta o token expirado', () => {
  vi.useFakeTimers()
  saveSession('token', 60, true)
  vi.advanceTimersByTime(61_000)
  expect(getAccessToken()).toBeNull()
  expect(localStorage.length).toBe(0)
})

it('limpa a sessão', () => {
  saveSession('token', 3600, true)
  clearSession()
  expect(getAccessToken()).toBeNull()
})
