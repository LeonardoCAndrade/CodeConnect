import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import Icon from './Icon'

it('renderiza o ícone decorativo oculto das tecnologias assistivas', () => {
  const { container } = render(<Icon name="login" />)
  const svg = container.querySelector('svg[data-icon="login"]')
  expect(svg).toBeInTheDocument()
  expect(svg).toHaveAttribute('aria-hidden', 'true')
})
