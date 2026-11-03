import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import AuthSwitchLink from './AuthSwitchLink'

it('apresenta a pergunta e executa a ação de troca de fluxo', async () => {
  const onAction = vi.fn()
  render(<AuthSwitchLink question="Já tem conta?" actionLabel="Faça seu login!" icon="login" layout="inline" onAction={onAction} />)
  expect(screen.getByText('Já tem conta?')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Faça seu login!' }))
  expect(onAction).toHaveBeenCalledOnce()
})
