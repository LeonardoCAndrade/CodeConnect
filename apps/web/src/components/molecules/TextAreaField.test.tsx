import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import TextAreaField from './TextAreaField'

it('associa o campo ao rótulo e apresenta erro acessível', async () => {
  render(<TextAreaField id="descricao" label="Descrição" error="Informe a descrição." />)
  const field = screen.getByRole('textbox', { name: 'Descrição' })
  await userEvent.type(field, 'Linha 1{enter}Linha 2')
  expect(field).toHaveValue('Linha 1\nLinha 2')
  expect(field).toHaveAttribute('aria-invalid', 'true')
  expect(field).toHaveAccessibleDescription('Informe a descrição.')
})

it('pode esconder o rótulo visualmente sem perder o nome acessível', () => {
  render(<TextAreaField id="comentario" label="Escreva um comentário" hideLabel />)
  expect(screen.getByRole('textbox', { name: 'Escreva um comentário' })).toBeInTheDocument()
  expect(screen.getByText('Escreva um comentário')).toHaveClass('sr-only')
})
