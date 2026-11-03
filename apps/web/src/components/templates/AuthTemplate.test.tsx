import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthTemplate } from './AuthTemplate'

describe('AuthTemplate', () => {
  it('exibe o banner recebido e o conteúdo da página', () => {
    render(
      <AuthTemplate bannerSrc="/banner-login.png">
        <h1>Login</h1>
      </AuthTemplate>,
    )

    expect(screen.getByRole('img', { name: 'Banner CodeConnect' }).getAttribute('src')).toBe('/banner-login.png')
    expect(screen.getByRole('heading', { name: 'Login' })).toBeTruthy()
    expect(screen.getByLabelText('CodeConnect')).toBeTruthy()
  })
})
