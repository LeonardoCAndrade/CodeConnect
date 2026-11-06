import { NavLink } from 'react-router'
import Icon from '../atoms/Icon'
import type { IconName } from '../atoms/Icon'

type NavItemProps = {
  icon: IconName
  label: string
  /** Link de navegação; o item fica destacado quando a rota está ativa. */
  to?: string
  /** Ação sem navegação (por exemplo, sair). */
  onClick?: () => void
  /** Item ainda não disponível: exibido, mas sem ação. */
  disabled?: boolean
}

const base =
  'flex flex-col items-center justify-center gap-1 rounded px-2 py-1 text-center text-[13px] leading-normal transition-colors lg:gap-2 lg:px-4 lg:py-2 lg:text-[22px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

function Content({ icon, label }: { icon: IconName; label: string }) {
  return (
    <>
      <Icon name={icon} className="h-6 w-6 lg:h-8 lg:w-8" />
      {label}
    </>
  )
}

export default function NavItem({ icon, label, to, onClick, disabled }: NavItemProps) {
  if (disabled || (!to && !onClick)) {
    return (
      <span aria-disabled="true" title="Em breve" className={`${base} cursor-default text-muted opacity-60`}>
        <Content icon={icon} label={label} />
        <span className="sr-only">(em breve)</span>
      </span>
    )
  }

  if (to) {
    return (
      <NavLink to={to} end className={({ isActive }) => `${base} ${isActive ? 'text-white' : 'text-muted hover:text-foreground'}`}>
        <Content icon={icon} label={label} />
      </NavLink>
    )
  }

  return (
    <button type="button" onClick={onClick} className={`${base} cursor-pointer text-muted hover:text-foreground`}>
      <Content icon={icon} label={label} />
    </button>
  )
}
