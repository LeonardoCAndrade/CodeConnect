import LoginForm from '../organisms/LoginForm'
import { AuthTemplate } from '../templates/AuthTemplate'

function LoginPage() {
  return (
    <AuthTemplate bannerSrc="/banner-login.png">
      <title>Login | CodeConnect</title>
      <LoginForm />
    </AuthTemplate>
  )
}

export default LoginPage
