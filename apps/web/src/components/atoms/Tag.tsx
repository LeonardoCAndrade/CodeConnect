import Icon from './Icon'

type TagVariant = 'selected' | 'suggestion'

type TagProps = {
  label: string
  /** selected: tag aplicada (cinza médio); suggestion: tag disponível (cinza claro). */
  variant?: TagVariant
  /** Torna a tag clicável (por exemplo, para aplicar como filtro). */
  onClick?: () => void
  /** Mostra o botão de remover. */
  onRemove?: () => void
  /** Texto acessível do botão de ação. */
  actionLabel?: string
}

const variants: Record<TagVariant, string> = {
  selected: 'bg-muted',
  suggestion: 'bg-subtle',
}

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

export default function Tag({ label, variant = 'suggestion', onClick, onRemove, actionLabel }: TagProps) {
  const classes = `inline-flex items-center gap-2.5 rounded px-2 py-1 text-lg leading-normal whitespace-nowrap text-surface ${variants[variant]}`

  if (onRemove) {
    return (
      <span className={classes}>
        {label}
        <button
          type="button"
          onClick={onRemove}
          aria-label={actionLabel ?? `Remover ${label}`}
          className={`cursor-pointer rounded-sm hover:text-background ${focus}`}
        >
          <Icon name="close" className="h-[15px] w-[15px]" />
        </button>
      </span>
    )
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={actionLabel}
        className={`${classes} cursor-pointer hover:bg-foreground ${focus}`}
      >
        {label}
      </button>
    )
  }

  return <span className={classes}>{label}</span>
}
