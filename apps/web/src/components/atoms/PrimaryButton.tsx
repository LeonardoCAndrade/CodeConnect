import type { ButtonHTMLAttributes } from 'react'

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export default function PrimaryButton({ children, className = '', ...props }: PrimaryButtonProps) {
  return (
    <button
      className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-lg leading-normal font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
