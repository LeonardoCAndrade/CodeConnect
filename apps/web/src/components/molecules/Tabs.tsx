type TabsProps<T extends string> = {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

/** Alternância entre visões da mesma lista (por exemplo, recentes e populares). */
export default function Tabs<T extends string>({ label, options, value, onChange }: TabsProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex items-start justify-center gap-6">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`cursor-pointer rounded px-1 text-[22px] leading-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              active ? 'font-semibold text-primary underline' : 'text-muted hover:text-foreground'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
