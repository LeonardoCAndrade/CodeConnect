import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthTemplate } from './AuthTemplate'

describe('AuthTemplate', () => {
  it('exibe o banner recebido, a marca e o conteúdo da página', () => {
    render(
      <AuthTemplate bannerSrc="/banner-login.png">
        <h1>Login</h1>
      </AuthTemplate>,
    )

    expect(screen.getByRole('img', { name: 'Banner CodeConnect' })).toHaveAttribute('src', '/banner-login.png')
    expect(screen.getByRole('img', { name: 'CodeConnect' })).toHaveAttribute('src', '/logo.svg')
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
  })
})
