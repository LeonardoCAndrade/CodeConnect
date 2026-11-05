import { useState } from 'react'
import type { FormEvent } from 'react'
import Checkbox from '../atoms/Checkbox'
import Icon from '../atoms/Icon'
import PrimaryButton from '../atoms/PrimaryButton'
import AuthHeader from '../molecules/AuthHeader'
import AuthSwitchLink from '../molecules/AuthSwitchLink'
import FormField from '../molecules/FormField'
import SocialLogin from '../molecules/SocialLogin'

export default function LoginForm() {
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({})
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const nextErrors = {
      username: String(data.get('username') ?? '').trim() ? undefined : 'Informe seu email ou usuário.',
      password: String(data.get('password') ?? '') ? undefined : 'Informe sua senha.',
    }
    setErrors(nextErrors)
    setMessage(nextErrors.username || nextErrors.password ? '' : 'O login ainda não está disponível.')
  }

  return (
    <div className="mx-auto flex w-full max-w-[318px] flex-col gap-6">
      <div className="flex flex-col gap-8">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-10">
            <AuthHeader title="Login" subtitle="Boas-vindas! Faça seu login." />
            <div className="flex flex-col gap-4">
              <FormField id="username" name="username" label="Email ou usuário" placeholder="usuario123" autoComplete="username" required error={errors.username} />
              <FormField id="password" name="password" label="Senha" type="password" placeholder="******" autoComplete="current-password" required error={errors.password}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Checkbox name="remember" label="Lembrar-me" />
                  <button type="button" onClick={() => setMessage('A recuperação de senha ainda não está disponível.')} className="cursor-pointer rounded text-base leading-normal text-foreground underline underline-offset-2 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                    Esqueci a senha
                  </button>
                </div>
              </FormField>
            </div>
          </div>
          <PrimaryButton type="submit">
            Login <Icon name="arrowForward" className="h-[18px] w-[18px]" />
          </PrimaryButton>
        </form>
        <SocialLogin onSelect={(provider) => setMessage(`O login com ${provider} ainda não está disponível.`)} />
      </div>
      <AuthSwitchLink question="Ainda não tem conta?" actionLabel="Crie seu cadastro!" icon="assignment" to="/cadastro" />
      <p role="status" aria-live="polite" className="text-center text-sm text-foreground empty:-mt-6">{message}</p>
    </div>
  )
}
