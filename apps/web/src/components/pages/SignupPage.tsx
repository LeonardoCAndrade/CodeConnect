import { useLocation, useNavigate } from 'react-router'
import { signup } from '../../api/auth'
import { redirectTarget } from '../../auth/redirect'
import { useAuth } from '../../auth/useAuth'
import SignupForm from '../organisms/SignupForm'
import type { SignupValues } from '../organisms/SignupForm'
import { AuthTemplate } from '../templates/AuthTemplate'

function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()

  async function handleSignup({ name, email, password, remember }: SignupValues) {
    const token = await signup({ name, email, password })
    signIn(token.accessToken, token.expiresIn, remember)
    navigate(redirectTarget(location.state), { replace: true })
    return 'Cadastro realizado! Você já está conectado.'
  }

  return (
    <AuthTemplate bannerSrc="/banner-cadastro.png">
      <title>Cadastro | CodeConnect</title>
      <SignupForm onSubmit={handleSignup} />
    </AuthTemplate>
  )
}

export default SignupPage
