type AvatarProps = {
  name: string
  className?: string
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts
  return letters.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?'
}

/** Avatar com as iniciais do nome; os usuários ainda não têm foto. */
export default function Avatar({ name, className = 'h-8 w-8 text-[13px]' }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-subtle font-semibold text-surface select-none ${className}`}
    >
      {initials(name)}
    </span>
  )
}
