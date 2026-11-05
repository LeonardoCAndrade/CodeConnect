import type { InputHTMLAttributes, ReactNode } from 'react'

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  error?: string
  children?: ReactNode
}

export default function FormField({ id, label, error, children, ...props }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="block text-lg leading-normal text-foreground" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full rounded bg-muted px-4 py-2 text-base leading-normal text-on-muted placeholder:text-on-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        {...props}
      />
      {error && <p id={`${id}-error`} className="text-sm text-error">{error}</p>}
      {children}
    </div>
  )
}
