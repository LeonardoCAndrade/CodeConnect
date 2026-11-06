import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import { makeComment } from '../../test/posts'
import CommentSection from './CommentSection'

it('lista os comentários e convida a fazer login para comentar', () => {
  render(
    <MemoryRouter>
      <CommentSection comments={[makeComment({ body: 'Achei ótimo!' })]} isAuthenticated={false} onSubmit={vi.fn()} />
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { name: 'Comentários' })).toBeInTheDocument()
  expect(screen.getByText('Achei ótimo!')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Faça login para comentar' })).toHaveAttribute('href', '/login')
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
})

it('envia o comentário de quem está logado e limpa o campo', async () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  render(
    <MemoryRouter>
      <CommentSection comments={[]} isAuthenticated onSubmit={onSubmit} />
    </MemoryRouter>,
  )
  expect(screen.getByText(/Ainda não há comentários/)).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))
  expect(screen.getByRole('textbox', { name: 'Escreva um comentário' })).toHaveAccessibleDescription('Escreva um comentário.')
  expect(onSubmit).not.toHaveBeenCalled()

  await userEvent.type(screen.getByRole('textbox', { name: 'Escreva um comentário' }), '  Muito bom!  ')
  await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))
  expect(onSubmit).toHaveBeenCalledWith('Muito bom!')
  expect(screen.getByRole('textbox', { name: 'Escreva um comentário' })).toHaveValue('')
})

it('mantém o texto e mostra o erro quando o envio falha', async () => {
  const onSubmit = vi.fn().mockRejectedValue(new Error('Sua sessão expirou. Faça login novamente.'))
  render(
    <MemoryRouter>
      <CommentSection comments={[]} isAuthenticated onSubmit={onSubmit} />
    </MemoryRouter>,
  )
  await userEvent.type(screen.getByRole('textbox', { name: 'Escreva um comentário' }), 'Oi')
  await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))
  expect(await screen.findByText('Sua sessão expirou. Faça login novamente.')).toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: 'Escreva um comentário' })).toHaveValue('Oi')
})
