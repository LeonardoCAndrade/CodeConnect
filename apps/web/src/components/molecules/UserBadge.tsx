import Avatar from '../atoms/Avatar'

type UserBadgeProps = {
  name: string
  handle: string
  /** muted: sobre fundo escuro (cards); dark: sobre fundo claro (comentários). */
  tone?: 'muted' | 'dark'
}

export default function UserBadge({ name, handle, tone = 'muted' }: UserBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-2 text-[15px] leading-normal font-semibold ${tone === 'muted' ? 'text-muted' : 'text-surface'}`}>
      <Avatar name={name} />
      <span title={name}>@{handle}</span>
    </span>
  )
}
