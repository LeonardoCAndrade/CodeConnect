import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import FormField from './FormField'

it('associa o campo ao rótulo e apresenta erro acessível', async () => {
  render(<FormField id="username" label="Usuário" error="Informe seu usuário." />)
  const input = screen.getByRole('textbox', { name: 'Usuário' })
  await userEvent.type(input, 'pessoa')
  expect(input).toHaveValue('pessoa')
  expect(input).toHaveAttribute('aria-invalid', 'true')
  expect(input).toHaveAccessibleDescription('Informe seu usuário.')
})
