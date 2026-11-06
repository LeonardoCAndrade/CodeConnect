import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, it } from 'vitest'
import { getAccessToken, saveSession } from '../../api/session'
import SideMenu from './SideMenu'

function renderMenu() {
  render(
    <MemoryRouter>
      <SideMenu />
    </MemoryRouter>,
  )
}

it('mostra a marca, o botão de publicar e o link de login para quem não está logado', () => {
  renderMenu()
  expect(screen.getByRole('img', { name: 'CodeConnect' })).toHaveAttribute('src', '/logo.svg')
  expect(screen.getByRole('link', { name: 'Publicar' })).toHaveAttribute('href', '/publicar')
  const nav = screen.getByRole('navigation', { name: 'Menu principal' })
  expect(nav).toHaveTextContent('Feed')
  expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login')
  expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
})

it('troca o login por sair quando há sessão e encerra a sessão ao clicar', async () => {
  saveSession('jwt-token', 3600, false)
  renderMenu()

  await userEvent.click(screen.getByRole('button', { name: 'Sair' }))
  expect(getAccessToken()).toBeNull()
  expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
})
