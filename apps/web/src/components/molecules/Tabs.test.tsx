import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import Tabs from './Tabs'

it('indica a opção ativa e troca ao clicar', async () => {
  const onChange = vi.fn()
  render(
    <Tabs
      label="Ordenar posts"
      options={[
        { value: 'recent', label: 'Recentes' },
        { value: 'popular', label: 'Populares' },
      ]}
      value="recent"
      onChange={onChange}
    />,
  )

  expect(screen.getByRole('group', { name: 'Ordenar posts' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Recentes' })).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(screen.getByRole('button', { name: 'Populares' }))
  expect(onChange).toHaveBeenCalledWith('popular')
})
