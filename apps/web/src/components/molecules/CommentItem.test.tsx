import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import CommentItem from './CommentItem'

it('mostra o autor, o comentário e a data', () => {
  render(<CommentItem authorName="Marcia Alves" authorHandle="marcia.alves" body="Muito bom!" createdAt="2026-11-06T12:30:00.000Z" />)
  const comment = screen.getByRole('article')
  expect(comment).toHaveTextContent('@marcia.alves')
  expect(comment).toHaveTextContent('Muito bom!')
  expect(comment.querySelector('time')).toHaveAttribute('datetime', '2026-11-06T12:30:00.000Z')
})
