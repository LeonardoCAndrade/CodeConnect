import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import Avatar from './Avatar'

it('mostra as iniciais do primeiro e do último nome', () => {
  const { container, rerender } = render(<Avatar name="Ana Maria Souza" />)
  expect(container).toHaveTextContent('AS')
  rerender(<Avatar name="Julio" />)
  expect(container).toHaveTextContent('J')
})

it('é decorativo, pois o nome aparece ao lado', () => {
  const { container } = render(<Avatar name="Ana" />)
  expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
})
