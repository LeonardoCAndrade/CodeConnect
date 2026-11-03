import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import SignupForm from './SignupForm'

it('valida os campos e informa que o cadastro ainda não está disponível', async () => {
  const user = userEvent.setup()
  render(<SignupForm />)
  await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
  expect(screen.getByText('Informe seu nome.')).toBeInTheDocument()
  expect(screen.getByText('Informe um email válido.')).toBeInTheDocument()
  expect(screen.getByText('Informe uma senha.')).toBeInTheDocument()

  await user.type(screen.getByLabelText('Nome'), 'Pessoa Dev')
  await user.type(screen.getByLabelText('Email'), 'pessoa@email')
  await user.type(screen.getByLabelText('Senha'), 'senha')
  await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
  expect(screen.getByText('Informe um email válido.')).toBeInTheDocument()

  await user.type(screen.getByLabelText('Email'), '.com')
  await user.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
  await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
  expect(screen.queryByText('Informe um email válido.')).not.toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('O cadastro ainda não está disponível.')
})

it('informa quando os outros fluxos estão indisponíveis', async () => {
  const user = userEvent.setup()
  render(<SignupForm />)
  for (const [name, message] of [
    ['Entrar com GitHub', 'O cadastro com GitHub ainda não está disponível.'],
    ['Entrar com Gmail', 'O cadastro com Gmail ainda não está disponível.'],
    ['Faça seu login!', 'A navegação para o login ainda não está disponível.'],
  ]) {
    await user.click(screen.getByRole('button', { name }))
    expect(screen.getByRole('status')).toHaveTextContent(message)
  }
})
