import Icon from '../atoms/Icon'
import type { IconName } from '../atoms/Icon'

type AuthSwitchLinkProps = {
  question: string
  actionLabel: string
  icon: IconName
  onAction: () => void
  layout?: 'stacked' | 'inline'
}

export default function AuthSwitchLink({ question, actionLabel, icon, onAction, layout = 'stacked' }: AuthSwitchLinkProps) {
  const stacked = layout === 'stacked'

  return (
    <div className={stacked ? 'flex flex-col items-center gap-2 text-center' : 'flex flex-wrap items-center gap-2'}>
      <p className={`leading-normal text-[#e1e1e1] ${stacked ? 'text-[15px]' : 'text-lg'}`}>{question}</p>
      <button
        type="button"
        onClick={onAction}
        className="flex cursor-pointer items-center gap-3 rounded text-lg leading-normal text-[#81fe88] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#81fe88]"
      >
        {actionLabel}
        <Icon name={icon} />
      </button>
    </div>
  )
}
