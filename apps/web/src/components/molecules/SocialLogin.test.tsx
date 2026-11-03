import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import SocialLogin from './SocialLogin'

it('permite escolher uma conta social', async () => {
  const onSelect = vi.fn()
  render(<SocialLogin onSelect={onSelect} />)
  await userEvent.click(screen.getByRole('button', { name: 'Entrar com GitHub' }))
  expect(onSelect).toHaveBeenCalledWith('GitHub')
  await userEvent.click(screen.getByRole('button', { name: 'Entrar com Gmail' }))
  expect(onSelect).toHaveBeenCalledWith('Gmail')
})
