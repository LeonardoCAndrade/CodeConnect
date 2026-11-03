import SignupForm from '../organisms/SignupForm'
import { AuthTemplate } from '../templates/AuthTemplate'

function SignupPage() {
  return (
    <AuthTemplate bannerSrc="/banner-cadastro.png">
      <title>Cadastro | CodeConnect</title>
      <SignupForm />
    </AuthTemplate>
  )
}

export default SignupPage
