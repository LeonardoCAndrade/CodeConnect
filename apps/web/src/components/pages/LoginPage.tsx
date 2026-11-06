import { login } from '../../api/auth'
import { saveSession } from '../../api/session'
import LoginForm from '../organisms/LoginForm'
import type { LoginValues } from '../organisms/LoginForm'
import { AuthTemplate } from '../templates/AuthTemplate'

async function handleLogin({ email, password, remember }: LoginValues) {
  const token = await login({ email, password })
  saveSession(token.accessToken, token.expiresIn, remember)
  return 'Login realizado com sucesso!'
}

function LoginPage() {
  return (
    <AuthTemplate bannerSrc="/banner-login.png">
      <title>Login | CodeConnect</title>
      <LoginForm onSubmit={handleLogin} />
    </AuthTemplate>
  )
}

export default LoginPage
