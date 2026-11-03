import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import LoginForm from './LoginForm'

it('valida os campos e informa que o login ainda não está disponível', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)
  await user.click(screen.getByRole('button', { name: 'Login' }))
  expect(screen.getByText('Informe seu email ou usuário.')).toBeInTheDocument()
  expect(screen.getByText('Informe sua senha.')).toBeInTheDocument()
  await user.type(screen.getByLabelText('Email ou usuário'), 'pessoa')
  await user.type(screen.getByLabelText('Senha'), 'senha')
  await user.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
  expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).toBeChecked()
  await user.click(screen.getByRole('button', { name: 'Login' }))
  expect(screen.getByRole('status')).toHaveTextContent('O login ainda não está disponível.')
})

it('informa quando os outros fluxos estão indisponíveis', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)
  for (const [name, message] of [
    ['Esqueci a senha', 'A recuperação de senha ainda não está disponível.'],
    ['Entrar com GitHub', 'O login com GitHub ainda não está disponível.'],
    ['Entrar com Gmail', 'O login com Gmail ainda não está disponível.'],
    ['Crie seu cadastro!', 'O cadastro ainda não está disponível.'],
  ]) {
    await user.click(screen.getByRole('button', { name }))
    expect(screen.getByRole('status')).toHaveTextContent(message)
  }
})
