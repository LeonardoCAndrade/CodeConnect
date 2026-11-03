import type { InputHTMLAttributes } from 'react'

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  error?: string
}

export default function FormField({ id, label, error, ...props }: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-base font-medium text-[#e1e1e1]" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-10 w-full rounded bg-[#929292] px-4 text-sm text-[#101719] placeholder:text-[#303638] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#81fe88]"
        {...props}
      />
      {error && <p id={`${id}-error`} className="mt-1 text-sm text-[#ffb4ab]">{error}</p>}
    </div>
  )
}
