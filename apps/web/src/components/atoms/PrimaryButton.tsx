import type { ButtonHTMLAttributes } from 'react'

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export default function PrimaryButton({ children, className = '', ...props }: PrimaryButtonProps) {
  return (
    <button
      className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#81fe88] px-4 py-3 text-lg leading-normal font-semibold text-[#132e35] transition-colors hover:bg-[#a3ffa8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#81fe88] ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
