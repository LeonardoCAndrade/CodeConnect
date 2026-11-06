import { useState } from 'react'

type ThumbnailProps = {
  src: string | null
  alt: string
  className?: string
}

/**
 * Imagem do post com fallback: sem URL ou com URL que falha ao carregar, mostra o
 * símbolo do CodeConnect no lugar, mantendo o mesmo tamanho e o layout do card.
 */
export default function Thumbnail({ src, alt, className = '' }: ThumbnailProps) {
  // Guarda qual URL falhou: se o post trocar de imagem, a nova é tentada de novo.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = src !== null && src !== '' && failedSrc !== src

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-editor ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div role="img" aria-label={`${alt} (imagem indisponível)`} className="absolute inset-0 flex items-center justify-center bg-surface">
          <img src="/symbol.svg" alt="" width={407} height={486} className="h-1/2 w-auto opacity-70" />
        </div>
      )}
    </div>
  )
}
