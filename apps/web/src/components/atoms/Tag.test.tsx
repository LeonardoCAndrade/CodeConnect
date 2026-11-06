import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import Tag from './Tag'

it('exibe a tag como texto quando não há ação', () => {
  render(<Tag label="React" />)
  expect(screen.getByText('React')).toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

it('aplica a tag ao clicar', async () => {
  const onClick = vi.fn()
  render(<Tag label="React" onClick={onClick} actionLabel="Filtrar por React" />)
  await userEvent.click(screen.getByRole('button', { name: 'Filtrar por React' }))
  expect(onClick).toHaveBeenCalledOnce()
})

it('remove a tag pelo botão de fechar', async () => {
  const onRemove = vi.fn()
  render(<Tag label="React" variant="selected" onRemove={onRemove} />)
  expect(screen.getByText('React')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Remover React' }))
  expect(onRemove).toHaveBeenCalledOnce()
})
