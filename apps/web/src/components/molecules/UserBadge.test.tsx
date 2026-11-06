import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import UserBadge from './UserBadge'

it('mostra o identificador do autor com o nome completo como dica', () => {
  render(<UserBadge name="Julio Lima" handle="julio.lima" />)
  expect(screen.getByText('@julio.lima')).toHaveAttribute('title', 'Julio Lima')
  expect(screen.getByText('JL')).toBeInTheDocument()
})
