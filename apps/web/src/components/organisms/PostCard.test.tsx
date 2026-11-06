import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import { makePost } from '../../test/posts'
import PostCard from './PostCard'

it('no feed, resume o post com link para o detalhe, tags e ações', async () => {
  const post = makePost({ title: 'Hooks no React', tags: ['React', 'CSS'], likesCount: 3, commentsCount: 2 })
  const onLike = vi.fn()
  const onShare = vi.fn()
  const onTagClick = vi.fn()
  render(
    <MemoryRouter>
      <PostCard post={post} isAuthenticated onLike={onLike} onShare={onShare} onTagClick={onTagClick} />
    </MemoryRouter>,
  )

  const card = screen.getByRole('article', { name: 'Hooks no React' })
  expect(within(card).getByRole('heading', { level: 2, name: 'Hooks no React' })).toBeInTheDocument()
  expect(within(card).getByRole('link', { name: 'Hooks no React' })).toHaveAttribute('href', `/posts/${post.id}`)
  expect(within(card).getByText('@julio.lima')).toBeInTheDocument()

  await userEvent.click(within(card).getByRole('button', { name: 'Filtrar por CSS' }))
  expect(onTagClick).toHaveBeenCalledWith('CSS')
  await userEvent.click(within(card).getByRole('button', { name: 'Curtir (3 curtidas)' }))
  expect(onLike).toHaveBeenCalledWith(post)
  await userEvent.click(within(card).getByRole('button', { name: 'Compartilhar' }))
  expect(onShare).toHaveBeenCalledWith(post)
})

it('no detalhe, destaca o título e usa o fallback sem imagem', () => {
  const post = makePost({ title: 'Projeto sem capa', imageUrl: null })
  render(
    <MemoryRouter>
      <PostCard post={post} variant="detail" isAuthenticated={false} onLike={vi.fn()} onShare={vi.fn()} />
    </MemoryRouter>,
  )

  expect(screen.getByRole('heading', { level: 1, name: 'Projeto sem capa' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Projeto sem capa' })).not.toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Projeto sem capa (imagem indisponível)' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /^Faça login para curtir/ })).toBeInTheDocument()
})
