import type { ReactNode } from 'react'
import SideMenu from '../organisms/SideMenu'

type AppTemplateProps = {
  children: ReactNode
}

/** Layout das páginas internas (feed, detalhe e publicação): menu lateral e conteúdo. */
export function AppTemplate({ children }: AppTemplateProps) {
  return (
    <div className="min-h-screen bg-background px-4 pt-4 pb-28 text-foreground sm:px-8 lg:py-14 lg:pb-14">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <SideMenu />
        <main className="flex w-full min-w-0 flex-col gap-10 lg:max-w-[996px]">{children}</main>
      </div>
    </div>
  )
}
