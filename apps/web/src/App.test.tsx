import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, it } from 'vitest'
import App from './App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

it('redireciona rotas desconhecidas para o login', () => {
  renderAt('/')
  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
})

it('navega entre login e cadastro', async () => {
  const user = userEvent.setup()
  renderAt('/login')

  await user.click(screen.getByRole('link', { name: 'Crie seu cadastro!' }))
  expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeInTheDocument()

  await user.click(screen.getByRole('link', { name: 'Faça seu login!' }))
  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
})
