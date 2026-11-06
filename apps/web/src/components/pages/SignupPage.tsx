import { signup } from '../../api/auth'
import { saveSession } from '../../api/session'
import SignupForm from '../organisms/SignupForm'
import type { SignupValues } from '../organisms/SignupForm'
import { AuthTemplate } from '../templates/AuthTemplate'

async function handleSignup({ name, email, password, remember }: SignupValues) {
  const token = await signup({ name, email, password })
  saveSession(token.accessToken, token.expiresIn, remember)
  return 'Cadastro realizado! Você já está conectado.'
}

function SignupPage() {
  return (
    <AuthTemplate bannerSrc="/banner-cadastro.png">
      <title>Cadastro | CodeConnect</title>
      <SignupForm onSubmit={handleSignup} />
    </AuthTemplate>
  )
}

export default SignupPage
