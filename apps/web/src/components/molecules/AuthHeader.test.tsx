import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import AuthHeader from './AuthHeader'

it('apresenta o título e o subtítulo da tela', () => {
  render(<AuthHeader title="Cadastro" subtitle="Olá! Preencha seus dados." />)
  expect(screen.getByRole('heading', { level: 1, name: 'Cadastro' })).toBeInTheDocument()
  expect(screen.getByText('Olá! Preencha seus dados.')).toBeInTheDocument()
})
