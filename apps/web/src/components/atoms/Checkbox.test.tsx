import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import Checkbox from './Checkbox'

it('marca e desmarca a opção pelo rótulo', async () => {
  const user = userEvent.setup()
  render(<Checkbox name="remember" label="Lembrar-me" />)
  const checkbox = screen.getByRole('checkbox', { name: 'Lembrar-me' })
  expect(checkbox).not.toBeChecked()
  await user.click(screen.getByText('Lembrar-me'))
  expect(checkbox).toBeChecked()
  await user.click(checkbox)
  expect(checkbox).not.toBeChecked()
})
