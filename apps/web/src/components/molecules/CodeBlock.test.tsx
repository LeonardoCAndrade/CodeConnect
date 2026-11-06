import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import CodeBlock from './CodeBlock'

it('mostra o código do projeto preservando a formatação', () => {
  const code = 'function soma(a, b) {\n  return a + b\n}'
  render(<CodeBlock code={code} />)
  expect(screen.getByRole('heading', { name: 'Código:' })).toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Código do projeto' }).querySelector('code')?.textContent).toBe(code)
})
