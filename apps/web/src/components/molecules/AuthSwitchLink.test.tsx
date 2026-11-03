import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, it } from 'vitest'
import AuthSwitchLink from './AuthSwitchLink'

it('apresenta a pergunta e o link para o outro fluxo', () => {
  render(
    <MemoryRouter>
      <AuthSwitchLink question="Já tem conta?" actionLabel="Faça seu login!" icon="login" layout="inline" to="/login" />
    </MemoryRouter>,
  )
  expect(screen.getByText('Já tem conta?')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Faça seu login!' })).toHaveAttribute('href', '/login')
})
