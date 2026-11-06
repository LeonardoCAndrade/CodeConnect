import { useLocation, useNavigate } from 'react-router'
import { login } from '../../api/auth'
import { redirectTarget } from '../../auth/redirect'
import { useAuth } from '../../auth/useAuth'
import LoginForm from '../organisms/LoginForm'
import type { LoginValues } from '../organisms/LoginForm'
import { AuthTemplate } from '../templates/AuthTemplate'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()

  async function handleLogin({ email, password, remember }: LoginValues) {
    const token = await login({ email, password })
    signIn(token.accessToken, token.expiresIn, remember)
    navigate(redirectTarget(location.state), { replace: true })
    return 'Login realizado com sucesso!'
  }

  return (
    <AuthTemplate bannerSrc="/banner-login.png">
      <title>Login | CodeConnect</title>
      <LoginForm onSubmit={handleLogin} />
    </AuthTemplate>
  )
}

export default LoginPage
