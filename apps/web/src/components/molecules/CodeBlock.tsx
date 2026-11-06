type CodeBlockProps = {
  code: string
  title?: string
}

export default function CodeBlock({ code, title = 'Código:' }: CodeBlockProps) {
  return (
    <section aria-label="Código do projeto" className="flex flex-col gap-2">
      <h2 className="text-[22px] leading-normal font-semibold text-muted">{title}</h2>
      <pre className="overflow-x-auto rounded-lg bg-surface p-4 font-mono text-[15px] text-subtle shadow-[0_8px_12px_rgb(0_0_0/0.24)]">
        <code>{code}</code>
      </pre>
    </section>
  )
}
