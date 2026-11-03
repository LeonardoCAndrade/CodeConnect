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
      <label className="block text-lg leading-normal text-[#e1e1e1]" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full rounded bg-[#888] px-4 py-2 text-[15px] leading-normal text-[#171d1f] placeholder:text-[#171d1f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#81fe88]"
        {...props}
      />
      {error && <p id={`${id}-error`} className="text-sm text-[#ffb4ab]">{error}</p>}
      {children}
    </div>
  )
}
