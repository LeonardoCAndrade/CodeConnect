import { useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import Icon from '../atoms/Icon'
import PrimaryButton from '../atoms/PrimaryButton'
import Tag from '../atoms/Tag'
import Thumbnail from '../atoms/Thumbnail'
import FormField from '../molecules/FormField'
import TextAreaField from '../molecules/TextAreaField'

export type PostFormValues = {
  title: string
  body: string
  code?: string
  imageUrl?: string
  tags: string[]
}

type PostFormProps = {
  /** Publica o post; rejeita com um erro cuja mensagem é exibida. */
  onSubmit: (values: PostFormValues) => Promise<void>
  onDiscard: () => void
}

type Errors = Partial<Record<'title' | 'body' | 'imageUrl' | 'tags', string>>

const MAX_TAGS = 5

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default function PostForm({ onSubmit, onDiscard }: PostFormProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const previewUrl = isHttpUrl(imageUrl.trim()) ? imageUrl.trim() : null

  function addTag() {
    const tag = tagInput.trim()
    if (!tag) return
    if (tag.length > 30) {
      setErrors((current) => ({ ...current, tags: 'Cada tag pode ter até 30 caracteres.' }))
      return
    }
    if (tags.length >= MAX_TAGS) {
      setErrors((current) => ({ ...current, tags: `Use até ${MAX_TAGS} tags.` }))
      return
    }
    if (!tags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) setTags([...tags, tag])
    setTagInput('')
    setErrors((current) => ({ ...current, tags: undefined }))
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag()
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const title = String(data.get('title') ?? '').trim()
    const body = String(data.get('body') ?? '').trim()
    const code = String(data.get('code') ?? '')
    const url = imageUrl.trim()
    const nextErrors: Errors = {
      title: title ? undefined : 'Informe o nome do projeto.',
      body: body ? undefined : 'Informe a descrição.',
      imageUrl: !url || isHttpUrl(url) ? undefined : 'Informe uma URL http ou https.',
    }
    setErrors(nextErrors)
    setMessage('')
    if (Object.values(nextErrors).some(Boolean)) return

    setSubmitting(true)
    try {
      await onSubmit({
        title,
        body,
        code: code.trim() ? code : undefined,
        imageUrl: url || undefined,
        tags,
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro inesperado. Tente novamente.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 rounded-lg bg-surface p-4 sm:p-8 lg:flex-row lg:items-start">
      <div className="flex w-full flex-col gap-4 lg:w-[486px] lg:shrink-0">
        <div className="rounded-lg bg-muted px-4 py-6">
          <Thumbnail src={previewUrl} alt="Pré-visualização da imagem do projeto" className="h-56 sm:h-80" />
        </div>
        <FormField
          id="imageUrl"
          name="imageUrl"
          label="URL da imagem (opcional)"
          type="url"
          inputMode="url"
          placeholder="https://..."
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          error={errors.imageUrl}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-10">
        <h1 className="text-[26px] leading-normal font-semibold text-foreground">Novo projeto</h1>
        <div className="flex flex-col gap-6">
          <FormField id="title" name="title" label="Nome do projeto" maxLength={120} required error={errors.title} />
          <TextAreaField id="body" name="body" label="Descrição" maxLength={2000} required error={errors.body} />
          <TextAreaField
            id="code"
            name="code"
            label="Código (opcional)"
            maxLength={10000}
            spellCheck={false}
            className="min-h-32 font-mono text-[15px]"
          />
          <div className="flex flex-col gap-4">
            <FormField
              id="tag"
              label="Tags"
              placeholder="Digite uma tag e pressione Enter"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              error={errors.tags}
            />
            {tags.length > 0 && (
              <ul aria-label="Tags do projeto" className="flex flex-wrap gap-4">
                {tags.map((tag) => (
                  <li key={tag}>
                    <Tag label={tag} variant="selected" onRemove={() => setTags(tags.filter((t) => t !== tag))} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <PrimaryButton type="button" variant="outline" onClick={onDiscard} className="font-semibold">
            Descartar <Icon name="delete" />
          </PrimaryButton>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? 'Publicando…' : <>Publicar <Icon name="publish" /></>}
          </PrimaryButton>
        </div>
        <p role="status" aria-live="polite" className="text-sm text-error empty:hidden">
          {message}
        </p>
      </div>
    </form>
  )
}
