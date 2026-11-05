import type { ReactNode } from 'react'

type AuthTemplateProps = {
  bannerSrc: string
  children: ReactNode
}

export function AuthTemplate({ bannerSrc, children }: AuthTemplateProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 text-foreground sm:px-8 lg:py-24">
      <img
        src="/symbol.svg"
        alt=""
        width={407}
        height={486}
        className="pointer-events-none absolute -top-2 -left-24 w-[260px] opacity-30 select-none sm:left-[7.4%] sm:w-[407px]"
      />
      <img
        src="/symbol.svg"
        alt=""
        width={407}
        height={486}
        className="pointer-events-none absolute -right-24 bottom-0 w-[260px] opacity-30 select-none sm:right-[7.4%] sm:w-[407px]"
      />

      <div className="relative grid w-full max-w-[996px] gap-8 rounded-[32px] border border-background bg-surface p-6 sm:p-10 lg:grid-cols-[407px_minmax(0,410px)] lg:justify-between lg:gap-0 lg:px-[78px] lg:py-[56px]">
        <div className="relative h-56 overflow-hidden sm:h-72 lg:h-auto lg:min-h-[628px]">
          <img src={bannerSrc} alt="Banner CodeConnect" className="absolute inset-0 h-full w-full object-cover" />
          <img src="/logo.svg" alt="CodeConnect" width={127.258} height={40} className="absolute bottom-8 left-1/2 -translate-x-1/2" />
        </div>
        <div className="flex min-w-0 items-center lg:px-8">{children}</div>
      </div>
    </main>
  )
}
