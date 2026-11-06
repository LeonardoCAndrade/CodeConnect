import Avatar from '../atoms/Avatar'

type CommentItemProps = {
  authorName: string
  authorHandle: string
  body: string
  createdAt: string
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export default function CommentItem({ authorName, authorHandle, body, createdAt }: CommentItemProps) {
  return (
    <article className="flex items-start gap-2 text-[15px] leading-normal text-surface">
      <Avatar name={authorName} />
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
        <span className="font-semibold" title={authorName}>
          @{authorHandle}
        </span>
        <p className="min-w-0 break-words">{body}</p>
        <time dateTime={createdAt} className="w-full text-[12.5px]">
          {dateFormat.format(new Date(createdAt))}
        </time>
      </div>
    </article>
  )
}
