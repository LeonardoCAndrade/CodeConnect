import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import PrimaryButton from './PrimaryButton'

it('renderiza e executa a ação principal', async () => {
  const onClick = vi.fn()
  render(<PrimaryButton onClick={onClick}>Continuar</PrimaryButton>)

  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))
  expect(onClick).toHaveBeenCalledOnce()
})

it('oferece a variante com contorno, usada em ações secundárias', () => {
  render(<PrimaryButton variant="outline">Descartar</PrimaryButton>)
  expect(screen.getByRole('button', { name: 'Descartar' })).toHaveClass('border-primary')
})
