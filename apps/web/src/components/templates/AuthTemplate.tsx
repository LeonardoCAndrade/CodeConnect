import type { ReactNode } from 'react'

type AuthTemplateProps = {
  bannerSrc: string
  children: ReactNode
}

export function AuthTemplate({ bannerSrc, children }: AuthTemplateProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#000c10] px-4 py-8 text-[#e1e1e1] sm:px-8">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -left-24 h-[340px] w-[340px] text-[#07191e] sm:-top-14 sm:left-[7%] sm:h-[520px] sm:w-[520px]"
        viewBox="0 0 250 250"
        fill="none"
      >
        <path d="M121 70V34c0-18 18-29 44-29s44 11 44 29v99c0 18-18 29-44 29s-44-11-44-29V109" stroke="currentColor" strokeWidth="21" />
        <path d="M121 123v42c0 18-18 29-44 29s-44-11-44-29V66c0-18 18-29 44-29s44 11 44 29v13" stroke="currentColor" strokeWidth="21" />
      </svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-12 h-[340px] w-[340px] text-[#07191e] sm:right-[6%] sm:-bottom-16 sm:h-[520px] sm:w-[520px]"
        viewBox="0 0 250 250"
        fill="none"
      >
        <path d="M121 70V34c0-18 18-29 44-29s44 11 44 29v99c0 18-18 29-44 29s-44-11-44-29V109" stroke="currentColor" strokeWidth="21" />
        <path d="M121 123v42c0 18-18 29-44 29s-44-11-44-29V66c0-18 18-29 44-29s44 11 44 29v13" stroke="currentColor" strokeWidth="21" />
      </svg>

      <div className="relative grid w-full max-w-[994px] gap-8 rounded-[32px] bg-[#171d1f] p-6 sm:p-10 lg:grid-cols-[407px_minmax(0,1fr)] lg:gap-[68px] lg:px-[76px] lg:py-[55px]">
        <div className="relative h-56 overflow-hidden sm:h-72 lg:h-[628px]">
          <img src={bannerSrc} alt="Banner CodeConnect" className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/75 to-transparent px-4 pt-10 pb-7" aria-label="CodeConnect">
            <svg aria-hidden="true" viewBox="0 0 40 40" fill="none" className="h-10 w-10 shrink-0 text-[#81fe88]">
              <path d="M19 12V7c0-3 3-5 7-5s7 2 7 5v15c0 3-3 5-7 5s-7-2-7-5v-3" stroke="currentColor" strokeWidth="3" />
              <path d="M19 22v6c0 3-3 5-7 5s-7-2-7-5V13c0-3 3-5 7-5s7 2 7 5v2" stroke="currentColor" strokeWidth="3" />
            </svg>
            <span aria-hidden="true" className="font-mono text-xl leading-[0.8] tracking-tight text-white">code<br />connect</span>
          </div>
        </div>
        <div className="flex min-w-0 items-center">{children}</div>
      </div>
    </main>
  )
}
