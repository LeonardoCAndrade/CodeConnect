import { Link } from 'react-router'
import Icon from '../atoms/Icon'

type PostStatsProps = {
  likesCount: number
  commentsCount: number
  likedByMe: boolean
  onLike: () => void
  onShare: () => void
  /** Link para os comentários; sem ele, o contador é só informativo. */
  commentsHref?: string
  /** Rótulo do botão de curtir quando a pessoa não está logada. */
  likeLabel?: string
}

const item =
  'flex flex-col items-center justify-center rounded text-[15px] leading-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

export default function PostStats({ likesCount, commentsCount, likedByMe, onLike, onShare, commentsHref, likeLabel }: PostStatsProps) {
  const comments = (
    <>
      <Icon name="chat" />
      <span aria-hidden="true">{commentsCount}</span>
      <span className="sr-only">{plural(commentsCount, 'comentário', 'comentários')}</span>
    </>
  )

  return (
    <div className="flex items-center gap-4 text-muted">
      <button
        type="button"
        onClick={onLike}
        aria-pressed={likedByMe}
        aria-label={`${likeLabel ?? (likedByMe ? 'Remover curtida' : 'Curtir')} (${plural(likesCount, 'curtida', 'curtidas')})`}
        className={`${item} cursor-pointer ${likedByMe ? 'text-primary' : 'hover:text-foreground'}`}
      >
        <Icon name="code" />
        <span aria-hidden="true">{likesCount}</span>
      </button>
      <button type="button" onClick={onShare} aria-label="Compartilhar" className={`${item} cursor-pointer hover:text-foreground`}>
        <Icon name="share" />
      </button>
      {commentsHref ? (
        <Link to={commentsHref} className={`${item} hover:text-foreground`}>
          {comments}
        </Link>
      ) : (
        <span className={item}>{comments}</span>
      )}
    </div>
  )
}
