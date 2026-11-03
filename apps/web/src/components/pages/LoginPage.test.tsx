import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import LoginPage from './LoginPage'

test('apresenta a página de login com o banner', () => {
  render(<MemoryRouter><LoginPage /></MemoryRouter>)

  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
  expect(screen.getByLabelText('Email ou usuário')).toBeInTheDocument()
  expect(document.querySelector('img[src="/banner-login.png"]')).toBeInTheDocument()
})
