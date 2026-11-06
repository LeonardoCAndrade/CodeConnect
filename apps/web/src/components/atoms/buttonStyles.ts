export type ButtonVariant = 'solid' | 'outline'
export type ButtonSize = 'md' | 'lg'

const base =
  'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 leading-normal transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-70'

const variants: Record<ButtonVariant, string> = {
  solid: 'bg-primary font-semibold text-on-primary hover:bg-primary-hover',
  outline: 'border border-primary text-primary hover:bg-primary/10',
}

const sizes: Record<ButtonSize, string> = {
  md: 'text-lg',
  lg: 'text-[22px]',
}

/** Classes do botão principal, também usadas em links com aparência de botão. */
export function buttonClasses(variant: ButtonVariant = 'solid', size: ButtonSize = 'md', className = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`
}
