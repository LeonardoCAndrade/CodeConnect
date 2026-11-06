import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, it } from 'vitest'
import SearchBox from './SearchBox'

function Controlled() {
  const [value, setValue] = useState('')
  return (
    <>
      <SearchBox value={value} onChange={setValue} />
      <output>{value}</output>
    </>
  )
}

it('informa o texto digitado na busca', async () => {
  render(<Controlled />)
  const input = screen.getByRole('searchbox', { name: 'Buscar posts' })
  expect(input).toHaveAttribute('placeholder', 'Digite o que você procura')
  await userEvent.type(input, 'react')
  expect(screen.getByRole('status')).toHaveTextContent('react')
})
