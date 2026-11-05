type AuthHeaderProps = {
  title: string
  subtitle: string
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <header className="flex flex-col gap-6 leading-normal text-foreground">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="text-xl">{subtitle}</p>
    </header>
  )
}
