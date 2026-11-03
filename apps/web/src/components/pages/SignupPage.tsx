import SignupForm from '../organisms/SignupForm'
import { AuthTemplate } from '../templates/AuthTemplate'

function SignupPage() {
  return (
    <AuthTemplate bannerSrc="/banner-cadastro.png">
      <SignupForm />
    </AuthTemplate>
  )
}

export default SignupPage
