import type { TextareaHTMLAttributes } from 'react'

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string
  label: string
  error?: string
  /** Rótulo visível (padrão) ou só para tecnologias assistivas. */
  hideLabel?: boolean
}

/** Campo de texto longo com o mesmo visual do FormField. */
export default function TextAreaField({ id, label, error, hideLabel, className = 'min-h-40', ...props }: TextAreaFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className={hideLabel ? 'sr-only' : 'block text-lg leading-normal text-foreground'} htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full resize-y rounded bg-muted px-4 py-2 text-base leading-normal text-on-muted placeholder:text-on-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
        {...props}
      />
      {error && <p id={`${id}-error`} className="text-sm text-error">{error}</p>}
    </div>
  )
}
