import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import FeedFilters from './FeedFilters'

function renderFilters(props: Partial<Parameters<typeof FeedFilters>[0]> = {}) {
  const handlers = {
    onQueryChange: vi.fn(),
    onAddTag: vi.fn(),
    onRemoveTag: vi.fn(),
    onClear: vi.fn(),
    onSortChange: vi.fn(),
  }
  render(
    <FeedFilters query="" selectedTags={[]} suggestedTags={['React', 'CSS']} sort="recent" {...handlers} {...props} />,
  )
  return handlers
}

it('busca, aplica tags sugeridas e troca a ordenação', async () => {
  const { onQueryChange, onAddTag, onSortChange } = renderFilters()

  await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar posts' }), 'r')
  expect(onQueryChange).toHaveBeenCalledWith('r')
  await userEvent.click(screen.getByRole('button', { name: 'Filtrar por CSS' }))
  expect(onAddTag).toHaveBeenCalledWith('CSS')
  await userEvent.click(screen.getByRole('button', { name: 'Populares' }))
  expect(onSortChange).toHaveBeenCalledWith('popular')
  expect(screen.queryByRole('button', { name: 'Limpar tudo' })).not.toBeInTheDocument()
})

it('mostra as tags aplicadas, sem repeti-las nas sugestões, e limpa os filtros', async () => {
  const { onRemoveTag, onClear } = renderFilters({ selectedTags: ['react'] })
  const tags = screen.getByRole('list', { name: 'Filtrar por tags' })

  expect(within(tags).queryByRole('button', { name: 'Filtrar por React' })).not.toBeInTheDocument()
  await userEvent.click(within(tags).getByRole('button', { name: 'Remover filtro react' }))
  expect(onRemoveTag).toHaveBeenCalledWith('react')
  await userEvent.click(screen.getByRole('button', { name: 'Limpar tudo' }))
  expect(onClear).toHaveBeenCalledOnce()
})
