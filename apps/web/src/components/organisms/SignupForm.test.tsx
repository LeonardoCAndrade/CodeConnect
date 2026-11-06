import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import SignupForm from './SignupForm'

function renderForm(onSubmit = vi.fn().mockResolvedValue('Cadastro realizado! Você já está conectado.')) {
  render(<MemoryRouter><SignupForm onSubmit={onSubmit} /></MemoryRouter>)
  return onSubmit
}

it('valida os campos antes de enviar', async () => {
  const user = userEvent.setup()
  const onSubmit = renderForm()
  await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
  expect(screen.getByText('Informe seu nome.')).toBeInTheDocument()
  expect(screen.getByText('Informe um email válido.')).toBeInTheDocument()
  expect(screen.getByText('Informe uma senha.')).toBeInTheDocument()

  await user.type(screen.getByLabelText('Nome'), 'Pessoa Dev')
  await user.type(screen.getByLabelText('Email'), 'pessoa@email')
  await user.type(screen.getByLabelText('Senha'), '12345')
  await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
  expect(screen.getByText('Informe um email válido.')).toBeInTheDocument()
  expect(screen.getByText('A senha deve ter entre 6 e 72 caracteres.')).toBeInTheDocument()
  expect(onSubmit).not.toHaveBeenCalled()
})

it('envia os dados e mostra a mensagem de sucesso', async () => {
  const user = userEvent.setup()
  const onSubmit = renderForm()
  await user.type(screen.getByLabelText('Nome'), ' Pessoa Dev ')
  await user.type(screen.getByLabelText('Email'), 'pessoa@email.com')
  await user.type(screen.getByLabelText('Senha'), 'senha123')
  await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
  expect(onSubmit).toHaveBeenCalledWith({ name: 'Pessoa Dev', email: 'pessoa@email.com', password: 'senha123', remember: false })
  expect(await screen.findByRole('status')).toHaveTextContent('Cadastro realizado! Você já está conectado.')
})

it('desabilita o botão durante o envio e mostra o erro', async () => {
  const user = userEvent.setup()
  let reject!: (error: Error) => void
  renderForm(vi.fn(() => new Promise<string>((_, r) => { reject = r })))
  await user.type(screen.getByLabelText('Nome'), 'Pessoa Dev')
  await user.type(screen.getByLabelText('Email'), 'pessoa@email.com')
  await user.type(screen.getByLabelText('Senha'), 'senha123')
  await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
  expect(screen.getByRole('button', { name: 'Cadastrando…' })).toBeDisabled()
  reject(new Error('Este email já está cadastrado.'))
  expect(await screen.findByText('Este email já está cadastrado.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeEnabled()
})

it('informa quando os outros fluxos estão indisponíveis', async () => {
  const user = userEvent.setup()
  renderForm()
  for (const [name, message] of [
    ['Entrar com GitHub', 'O cadastro com GitHub ainda não está disponível.'],
    ['Entrar com Gmail', 'O cadastro com Gmail ainda não está disponível.'],
  ]) {
    await user.click(screen.getByRole('button', { name }))
    expect(screen.getByRole('status')).toHaveTextContent(message)
  }
})

it('leva ao login pelo link', () => {
  renderForm()
  expect(screen.getByRole('link', { name: 'Faça seu login!' })).toHaveAttribute('href', '/login')
})
