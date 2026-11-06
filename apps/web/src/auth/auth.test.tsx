import { act, render, renderHook, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, it } from 'vitest'
import { saveSession } from '../api/session'
import { redirectTarget } from './redirect'
import RequireAuth from './RequireAuth'
import { useAuth } from './useAuth'

it('useAuth acompanha login e logout', () => {
  const { result } = renderHook(() => useAuth())
  expect(result.current.isAuthenticated).toBe(false)

  act(() => result.current.signIn('jwt-token', 3600, true))
  expect(result.current.isAuthenticated).toBe(true)
  expect(localStorage.length).toBe(1)

  act(() => result.current.signOut())
  expect(result.current.isAuthenticated).toBe(false)
})

function renderProtected() {
  render(
    <MemoryRouter initialEntries={['/publicar']}>
      <Routes>
        <Route
          path="/publicar"
          element={
            <RequireAuth>
              <h1>Publicar</h1>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<h1>Login</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

it('RequireAuth envia ao login quem não está autenticado', () => {
  renderProtected()
  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
})

it('RequireAuth mostra a página para quem está autenticado', () => {
  saveSession('jwt-token', 3600, false)
  renderProtected()
  expect(screen.getByRole('heading', { name: 'Publicar' })).toBeInTheDocument()
})

it('redirectTarget volta para a origem, exceto telas de autenticação', () => {
  expect(redirectTarget({ from: { pathname: '/posts/1', search: '', hash: '#comentarios' } })).toBe('/posts/1#comentarios')
  expect(redirectTarget({ from: { pathname: '/cadastro' } })).toBe('/')
  expect(redirectTarget(null)).toBe('/')
})
