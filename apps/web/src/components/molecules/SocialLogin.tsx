export type SocialProvider = 'GitHub' | 'Gmail'

type SocialLoginProps = {
  onSelect: (provider: SocialProvider) => void
}

const providers = [
  { name: 'GitHub', label: 'Github', icon: '/github.svg', width: 32.5424, height: 32 },
  { name: 'Gmail', label: 'Gmail', icon: '/gmail.svg', width: 28, height: 28 },
] as const

export default function SocialLogin({ onSelect }: SocialLoginProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 text-center text-[15px] leading-normal text-[#e1e1e1]">
        <span className="h-px flex-1 bg-[#e1e1e1]" aria-hidden="true" />
        <span>ou entre com outras contas</span>
        <span className="h-px flex-1 bg-[#e1e1e1]" aria-hidden="true" />
      </div>
      <div className="flex justify-center gap-6">
        {providers.map((provider) => (
          <button
            key={provider.name}
            type="button"
            onClick={() => onSelect(provider.name)}
            className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded text-[12.5px] leading-normal text-[#e1e1e1] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#81fe88]"
            aria-label={`Entrar com ${provider.name}`}
          >
            <span className="flex h-8 items-center">
              <img src={provider.icon} alt="" width={provider.width} height={provider.height} />
            </span>
            {provider.label}
          </button>
        ))}
      </div>
    </div>
  )
}
