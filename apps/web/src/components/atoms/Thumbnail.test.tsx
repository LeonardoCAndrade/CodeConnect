import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import Thumbnail from './Thumbnail'

it('exibe a imagem do post', () => {
  render(<Thumbnail src="https://example.com/capa.png" alt="Projeto" />)
  expect(screen.getByRole('img', { name: 'Projeto' })).toHaveAttribute('src', 'https://example.com/capa.png')
})

it('usa o fallback quando o post não tem imagem', () => {
  render(<Thumbnail src={null} alt="Projeto" />)
  expect(screen.getByRole('img', { name: 'Projeto (imagem indisponível)' })).toBeInTheDocument()
})

it('troca para o fallback quando a imagem não carrega e tenta de novo com outra URL', () => {
  const { rerender } = render(<Thumbnail src="https://example.com/quebrada.png" alt="Projeto" />)
  fireEvent.error(screen.getByRole('img', { name: 'Projeto' }))
  expect(screen.getByRole('img', { name: 'Projeto (imagem indisponível)' })).toBeInTheDocument()

  rerender(<Thumbnail src="https://example.com/nova.png" alt="Projeto" />)
  expect(screen.getByRole('img', { name: 'Projeto' })).toHaveAttribute('src', 'https://example.com/nova.png')
})
