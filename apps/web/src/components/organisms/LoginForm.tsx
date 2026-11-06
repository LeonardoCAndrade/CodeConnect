import { useState } from 'react'
import type { FormEvent } from 'react'
import Checkbox from '../atoms/Checkbox'
import Icon from '../atoms/Icon'
import PrimaryButton from '../atoms/PrimaryButton'
import AuthHeader from '../molecules/AuthHeader'
import AuthSwitchLink from '../molecules/AuthSwitchLink'
import FormField from '../molecules/FormField'
import SocialLogin from '../molecules/SocialLogin'

export type LoginValues = { email: string; password: string; remember: boolean }

type LoginFormProps = {
  /** Envia as credenciais. Resolve com a mensagem de sucesso ou rejeita com um erro cuja mensagem é exibida. */
  onSubmit: (values: LoginValues) => Promise<string>
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    const nextErrors = {
      email: emailPattern.test(email) ? undefined : 'Informe um email válido.',
      password: password ? undefined : 'Informe sua senha.',
    }
    setErrors(nextErrors)
    setMessage('')
    if (nextErrors.email || nextErrors.password) return

    setSubmitting(true)
    try {
      setMessage(await onSubmit({ email, password, remember: data.get('remember') !== null }))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[318px] flex-col gap-6">
      <div className="flex flex-col gap-8">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-10">
            <AuthHeader title="Login" subtitle="Boas-vindas! Faça seu login." />
            <div className="flex flex-col gap-4">
              <FormField id="email" name="email" label="Email" type="email" placeholder="Digite seu email" autoComplete="email" required error={errors.email} />
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
          <PrimaryButton type="submit" disabled={submitting} className="disabled:cursor-wait disabled:opacity-70">
            {submitting ? 'Entrando…' : <>Login <Icon name="arrowForward" className="h-[18px] w-[18px]" /></>}
          </PrimaryButton>
        </form>
        <SocialLogin onSelect={(provider) => setMessage(`O login com ${provider} ainda não está disponível.`)} />
      </div>
      <AuthSwitchLink question="Ainda não tem conta?" actionLabel="Crie seu cadastro!" icon="assignment" to="/cadastro" />
      <p role="status" aria-live="polite" className="text-center text-sm text-foreground empty:-mt-6">{message}</p>
    </div>
  )
}
