import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import NavItem from './NavItem'

it('navega e destaca a rota ativa', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <NavItem icon="feed" label="Feed" to="/" />
      <NavItem icon="login" label="Login" to="/login" />
    </MemoryRouter>,
  )
  expect(screen.getByRole('link', { name: 'Feed' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login')
  expect(screen.getByRole('link', { name: 'Login' })).not.toHaveAttribute('aria-current')
})

it('executa a ação quando é um botão', async () => {
  const onClick = vi.fn()
  render(<NavItem icon="logout" label="Sair" onClick={onClick} />)
  await userEvent.click(screen.getByRole('button', { name: 'Sair' }))
  expect(onClick).toHaveBeenCalledOnce()
})

it('mostra itens ainda indisponíveis sem ação', () => {
  render(<NavItem icon="info" label="Sobre nós" disabled />)
  expect(screen.getByText('Sobre nós').closest('[aria-disabled="true"]')).toHaveTextContent('Sobre nós(em breve)')
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
