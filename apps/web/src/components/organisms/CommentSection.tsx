import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import type { Comment } from '../../api/posts'
import PrimaryButton from '../atoms/PrimaryButton'
import CommentItem from '../molecules/CommentItem'
import TextAreaField from '../molecules/TextAreaField'

type CommentSectionProps = {
  comments: Comment[]
  isAuthenticated: boolean
  /** Envia o comentário; rejeita com um erro cuja mensagem é exibida. */
  onSubmit: (body: string) => Promise<void>
}

export default function CommentSection({ comments, isAuthenticated, onSubmit }: CommentSectionProps) {
  const location = useLocation()
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = body.trim()
    if (!text) {
      setError('Escreva um comentário.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onSubmit(text)
      setBody('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="comentarios" aria-labelledby="comentarios-titulo" className="flex flex-col gap-6 bg-muted px-4 py-8 sm:px-8">
      <h2 id="comentarios-titulo" className="text-[22px] leading-normal font-semibold text-surface">
        Comentários
      </h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          <TextAreaField
            id="novo-comentario"
            label="Escreva um comentário"
            hideLabel
            placeholder="Escreva um comentário"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={1000}
            error={error}
            className="min-h-24 bg-subtle"
          />
          <PrimaryButton type="submit" disabled={submitting} className="sm:w-auto sm:self-end">
            {submitting ? 'Enviando…' : 'Comentar'}
          </PrimaryButton>
        </form>
      ) : (
        <p className="text-[15px] leading-normal text-surface">
          <Link to="/login" state={{ from: location }} className="font-semibold underline">
            Faça login para comentar
          </Link>
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-[15px] leading-normal text-surface">Ainda não há comentários. Seja a primeira pessoa a comentar!</p>
      ) : (
        <ul className="flex flex-col divide-y divide-surface/40">
          {comments.map((comment) => (
            <li key={comment.id} className="py-4 first:pt-0 last:pb-0">
              <CommentItem
                authorName={comment.author.name}
                authorHandle={comment.author.handle}
                body={comment.body}
                createdAt={comment.createdAt}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
