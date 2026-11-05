import { Link } from 'react-router'
import Icon from '../atoms/Icon'
import type { IconName } from '../atoms/Icon'

type AuthSwitchLinkProps = {
  question: string
  actionLabel: string
  icon: IconName
  to: string
  layout?: 'stacked' | 'inline'
}

export default function AuthSwitchLink({ question, actionLabel, icon, to, layout = 'stacked' }: AuthSwitchLinkProps) {
  const stacked = layout === 'stacked'

  return (
    <div className={stacked ? 'flex flex-col items-center gap-2 text-center' : 'flex flex-wrap items-center gap-2'}>
      <p className={`leading-normal text-foreground ${stacked ? 'text-base' : 'text-lg'}`}>{question}</p>
      <Link
        to={to}
        className="flex items-center gap-3 rounded text-lg leading-normal text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        {actionLabel}
        <Icon name={icon} />
      </Link>
    </div>
  )
}
