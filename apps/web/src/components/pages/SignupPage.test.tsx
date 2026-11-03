import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import SignupPage from './SignupPage'

test('apresenta a página de cadastro com o banner', () => {
  render(<MemoryRouter><SignupPage /></MemoryRouter>)

  expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeInTheDocument()
  expect(screen.getByLabelText('Nome')).toBeInTheDocument()
  expect(screen.getByLabelText('Email')).toBeInTheDocument()
  expect(screen.getByLabelText('Senha')).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Banner CodeConnect' })).toHaveAttribute('src', '/banner-cadastro.png')
})
