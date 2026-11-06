import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppTemplate } from './AppTemplate'

describe('AppTemplate', () => {
  it('compõe o menu lateral e o conteúdo principal da página', () => {
    render(
      <MemoryRouter>
        <AppTemplate>
          <h1>Feed</h1>
        </AppTemplate>
      </MemoryRouter>,
    )

    expect(screen.getByRole('navigation', { name: 'Menu principal' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { name: 'Feed' }))
  })
})
