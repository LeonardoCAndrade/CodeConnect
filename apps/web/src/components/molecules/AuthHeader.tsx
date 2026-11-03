type AuthHeaderProps = {
  title: string
  subtitle: string
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <header className="flex flex-col gap-6 leading-normal text-[#e1e1e1]">
      <h1 className="text-[31px] font-semibold">{title}</h1>
      <p className="text-[22px]">{subtitle}</p>
    </header>
  )
}
