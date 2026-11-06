import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import LoginForm from './LoginForm'

function renderForm(onSubmit = vi.fn().mockResolvedValue('Login realizado com sucesso!')) {
  render(<MemoryRouter><LoginForm onSubmit={onSubmit} /></MemoryRouter>)
  return onSubmit
}

it('valida os campos antes de enviar', async () => {
  const user = userEvent.setup()
  const onSubmit = renderForm()
  await user.click(screen.getByRole('button', { name: 'Login' }))
  expect(screen.getByText('Informe um email válido.')).toBeInTheDocument()
  expect(screen.getByText('Informe sua senha.')).toBeInTheDocument()
  await user.type(screen.getByLabelText('Email'), 'pessoa')
  await user.click(screen.getByRole('button', { name: 'Login' }))
  expect(screen.getByText('Informe um email válido.')).toBeInTheDocument()
  expect(onSubmit).not.toHaveBeenCalled()
})

it('envia as credenciais e mostra a mensagem de sucesso', async () => {
  const user = userEvent.setup()
  const onSubmit = renderForm()
  await user.type(screen.getByLabelText('Email'), ' ana@example.com ')
  await user.type(screen.getByLabelText('Senha'), 'senha123')
  await user.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
  await user.click(screen.getByRole('button', { name: 'Login' }))
  expect(onSubmit).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'senha123', remember: true })
  expect(await screen.findByRole('status')).toHaveTextContent('Login realizado com sucesso!')
})

it('desabilita o botão durante o envio e mostra o erro', async () => {
  const user = userEvent.setup()
  let reject!: (error: Error) => void
  renderForm(vi.fn(() => new Promise<string>((_, r) => { reject = r })))
  await user.type(screen.getByLabelText('Email'), 'ana@example.com')
  await user.type(screen.getByLabelText('Senha'), 'errada')
  await user.click(screen.getByRole('button', { name: 'Login' }))
  expect(screen.getByRole('button', { name: 'Entrando…' })).toBeDisabled()
  reject(new Error('Email ou senha inválidos.'))
  expect(await screen.findByText('Email ou senha inválidos.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Login' })).toBeEnabled()
})

it('informa quando os outros fluxos estão indisponíveis', async () => {
  const user = userEvent.setup()
  renderForm()
  for (const [name, message] of [
    ['Esqueci a senha', 'A recuperação de senha ainda não está disponível.'],
    ['Entrar com GitHub', 'O login com GitHub ainda não está disponível.'],
    ['Entrar com Gmail', 'O login com Gmail ainda não está disponível.'],
  ]) {
    await user.click(screen.getByRole('button', { name }))
    expect(screen.getByRole('status')).toHaveTextContent(message)
  }
})

it('leva ao cadastro pelo link', () => {
  renderForm()
  expect(screen.getByRole('link', { name: 'Crie seu cadastro!' })).toHaveAttribute('href', '/cadastro')
})
