import type { InputHTMLAttributes } from 'react'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
}

export default function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 text-base leading-normal text-muted ${className}`}>
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          className="peer absolute inset-0 m-0 cursor-pointer appearance-none rounded border-2 border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          {...props}
        />
        <img src="/check.svg" alt="" width={16} height={16} className="pointer-events-none invisible relative peer-checked:visible" />
      </span>
      {label}
    </label>
  )
}
