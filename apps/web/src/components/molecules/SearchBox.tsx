import Icon from '../atoms/Icon'

type SearchBoxProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBox({ value, onChange, placeholder = 'Digite o que você procura' }: SearchBoxProps) {
  return (
    <label className="flex w-full items-center gap-4 rounded bg-surface px-4 py-2 text-subtle focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
      <Icon name="search" className="h-8 w-8" />
      <span className="sr-only">Buscar posts</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-lg leading-normal text-foreground outline-none placeholder:text-subtle sm:text-[22px]"
      />
    </label>
  )
}
