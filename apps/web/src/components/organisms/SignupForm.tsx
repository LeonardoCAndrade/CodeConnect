import { useState } from 'react'
import type { FormEvent } from 'react'
import Checkbox from '../atoms/Checkbox'
import Icon from '../atoms/Icon'
import PrimaryButton from '../atoms/PrimaryButton'
import AuthHeader from '../molecules/AuthHeader'
import AuthSwitchLink from '../molecules/AuthSwitchLink'
import FormField from '../molecules/FormField'
import SocialLogin from '../molecules/SocialLogin'

type SignupErrors = { name?: string; email?: string; password?: string }

export type SignupValues = { name: string; email: string; password: string; remember: boolean }

type SignupFormProps = {
  /** Envia o cadastro. Resolve com a mensagem de sucesso ou rejeita com um erro cuja mensagem é exibida. */
  onSubmit: (values: SignupValues) => Promise<string>
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validatePassword(password: string) {
  if (!password) return 'Informe uma senha.'
  if (password.length < 6 || password.length > 72) return 'A senha deve ter entre 6 e 72 caracteres.'
  return undefined
}

export default function SignupForm({ onSubmit }: SignupFormProps) {
  const [errors, setErrors] = useState<SignupErrors>({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    const nextErrors: SignupErrors = {
      name: name ? undefined : 'Informe seu nome.',
      email: emailPattern.test(email) ? undefined : 'Informe um email válido.',
      password: validatePassword(password),
    }
    setErrors(nextErrors)
    setMessage('')
    if (Object.values(nextErrors).some(Boolean)) return

    setSubmitting(true)
    try {
      setMessage(await onSubmit({ name, email, password, remember: data.get('remember') !== null }))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[346px] flex-col gap-6">
      <div className="flex flex-col gap-8">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit} noValidate>
          <AuthHeader title="Cadastro" subtitle="Olá! Preencha seus dados." />
          <div className="flex flex-col gap-4">
            <FormField id="name" name="name" label="Nome" placeholder="Nome completo" autoComplete="name" required error={errors.name} />
            <FormField id="email" name="email" label="Email" type="email" placeholder="Digite seu email" autoComplete="email" required error={errors.email} />
            <FormField id="password" name="password" label="Senha" type="password" placeholder="******" autoComplete="new-password" required error={errors.password}>
              <Checkbox name="remember" label="Lembrar-me" className="self-start" />
            </FormField>
          </div>
          <PrimaryButton type="submit" disabled={submitting} className="disabled:cursor-wait disabled:opacity-70">
            {submitting ? 'Cadastrando…' : <>Cadastrar <Icon name="arrowForward" className="h-[18px] w-[18px]" /></>}
          </PrimaryButton>
        </form>
        <SocialLogin onSelect={(provider) => setMessage(`O cadastro com ${provider} ainda não está disponível.`)} />
      </div>
      <AuthSwitchLink question="Já tem conta?" actionLabel="Faça seu login!" icon="login" layout="inline" to="/login" />
      <p role="status" aria-live="polite" className="text-center text-sm text-foreground empty:-mt-6">{message}</p>
    </div>
  )
}
