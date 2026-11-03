import { useState } from 'react'
import type { FormEvent } from 'react'
import PrimaryButton from '../atoms/PrimaryButton'
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
    <div className="mx-auto w-full max-w-[318px] text-[#e1e1e1]">
      <h1 className="text-[32px] leading-tight font-bold">Login</h1>
      <p className="mt-7 text-xl leading-snug">Boas-vindas! Faça seu login.</p>

      <form className="mt-11" onSubmit={handleSubmit} noValidate>
        <div className="space-y-5">
          <FormField id="username" name="username" label="Email ou usuário" placeholder="usuario123" autoComplete="username" required error={errors.username} />
          <FormField id="password" name="password" label="Senha" type="password" placeholder="******" autoComplete="current-password" required error={errors.password} />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-[#aaa]">
            <input type="checkbox" name="remember" className="h-5 w-5 cursor-pointer accent-[#81fe88] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#81fe88]" />
            Lembrar-me
          </label>
          <button type="button" onClick={() => setMessage('A recuperação de senha ainda não está disponível.')} className="cursor-pointer underline underline-offset-2 hover:text-[#81fe88] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#81fe88]">
            Esqueci a senha
          </button>
        </div>
        <PrimaryButton type="submit" className="mt-8 cursor-pointer">
          Login <span aria-hidden="true">→</span>
        </PrimaryButton>
      </form>

      <SocialLogin onSelect={(provider) => setMessage(`O login com ${provider} ainda não está disponível.`)} />
      <div className="mt-7 text-center">
        <p className="text-sm">Ainda não tem conta?</p>
        <button type="button" onClick={() => setMessage('O cadastro ainda não está disponível.')} className="mt-3 cursor-pointer text-base font-medium text-[#81fe88] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#81fe88]">
          Crie seu cadastro! <span aria-hidden="true">▤</span>
        </button>
      </div>
      <p role="status" aria-live="polite" className="mt-4 text-center text-sm text-[#e1e1e1]">{message}</p>
    </div>
  )
}
