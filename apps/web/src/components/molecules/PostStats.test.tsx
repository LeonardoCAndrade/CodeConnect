import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import PostStats from './PostStats'

function renderStats(props: Partial<Parameters<typeof PostStats>[0]> = {}) {
  const handlers = { onLike: vi.fn(), onShare: vi.fn() }
  render(
    <MemoryRouter>
      <PostStats likesCount={3} commentsCount={1} likedByMe={false} {...handlers} {...props} />
    </MemoryRouter>,
  )
  return handlers
}

it('curte, compartilha e mostra as contagens', async () => {
  const { onLike, onShare } = renderStats({ commentsHref: '/posts/1#comentarios' })

  const like = screen.getByRole('button', { name: 'Curtir (3 curtidas)' })
  expect(like).toHaveAttribute('aria-pressed', 'false')
  await userEvent.click(like)
  expect(onLike).toHaveBeenCalledOnce()

  await userEvent.click(screen.getByRole('button', { name: 'Compartilhar' }))
  expect(onShare).toHaveBeenCalledOnce()

  expect(screen.getByRole('link', { name: /1 comentário/ })).toHaveAttribute('href', '/posts/1#comentarios')
})

it('indica quando o post já foi curtido', () => {
  renderStats({ likedByMe: true, likesCount: 1 })
  expect(screen.getByRole('button', { name: 'Remover curtida (1 curtida)' })).toHaveAttribute('aria-pressed', 'true')
})

it('orienta a fazer login quando a pessoa não está autenticada', () => {
  renderStats({ likeLabel: 'Faça login para curtir' })
  expect(screen.getByRole('button', { name: 'Faça login para curtir (3 curtidas)' })).toBeInTheDocument()
})
