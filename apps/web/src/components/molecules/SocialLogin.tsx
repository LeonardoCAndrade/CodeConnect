type SocialLoginProps = {
  onSelect: (provider: 'GitHub' | 'Gmail') => void
}

export default function SocialLogin({ onSelect }: SocialLoginProps) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-4 text-center text-sm text-[#e1e1e1]">
        <span className="h-px flex-1 bg-[#888]" aria-hidden="true" />
        <span>ou entre com outras contas</span>
        <span className="h-px flex-1 bg-[#888]" aria-hidden="true" />
      </div>
      <div className="mt-3 flex justify-center gap-6">
        {(['GitHub', 'Gmail'] as const).map((provider) => (
          <button
            key={provider}
            type="button"
            onClick={() => onSelect(provider)}
            className="flex min-w-10 flex-col items-center gap-1 rounded text-xs text-[#e1e1e1] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#81fe88]"
            aria-label={`Entrar com ${provider}`}
          >
            <img src={provider === 'GitHub' ? '/github.png' : '/gmail.png'} alt="" className="h-8 w-8 object-contain" />
            {provider}
          </button>
        ))}
      </div>
    </div>
  )
}
