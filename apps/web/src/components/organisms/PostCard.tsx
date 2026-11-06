import { Link } from 'react-router'
import type { Post } from '../../api/posts'
import Tag from '../atoms/Tag'
import Thumbnail from '../atoms/Thumbnail'
import PostStats from '../molecules/PostStats'
import UserBadge from '../molecules/UserBadge'

type PostCardProps = {
  post: Post
  /** feed: card resumido com link para o detalhe; detail: card em destaque da página do post. */
  variant?: 'feed' | 'detail'
  isAuthenticated: boolean
  onLike: (post: Post) => void
  onShare: (post: Post) => void
  /** Clique em uma tag (no feed, aplica a tag como filtro). */
  onTagClick?: (tag: string) => void
}

export default function PostCard({ post, variant = 'feed', isAuthenticated, onLike, onShare, onTagClick }: PostCardProps) {
  const isFeed = variant === 'feed'
  const href = `/posts/${post.id}`
  const Title = isFeed ? 'h2' : 'h1'

  return (
    <article aria-labelledby={`post-${post.id}-title`} className="flex w-full min-w-0 flex-col">
      <div className={`rounded-t-lg bg-muted ${isFeed ? 'p-6' : 'px-4 py-6'}`}>
        {isFeed ? (
          <Link to={href} tabIndex={-1} aria-hidden="true">
            <Thumbnail src={post.imageUrl} alt={post.title} className="h-48 sm:h-[192px]" />
          </Link>
        ) : (
          <Thumbnail src={post.imageUrl} alt={post.title} className="h-56 sm:h-80" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 rounded-b-lg bg-surface p-4">
        <div className="flex flex-col gap-2 text-subtle">
          <Title id={`post-${post.id}-title`} className={`leading-normal font-semibold ${isFeed ? 'text-lg' : 'text-[22px]'}`}>
            {isFeed ? (
              <Link to={href} className="rounded hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                {post.title}
              </Link>
            ) : (
              post.title
            )}
          </Title>
          <p className={`text-[15px] leading-normal ${isFeed ? 'line-clamp-3' : 'whitespace-pre-line'}`}>{post.body}</p>
        </div>
        {post.tags.length > 0 && (
          <ul aria-label="Tags" className="flex flex-wrap gap-2.5">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Tag
                  label={tag}
                  onClick={onTagClick && (() => onTagClick(tag))}
                  actionLabel={onTagClick && `Filtrar por ${tag}`}
                />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex items-center justify-between gap-4">
          <PostStats
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
            likedByMe={post.likedByMe}
            onLike={() => onLike(post)}
            onShare={() => onShare(post)}
            commentsHref={isFeed ? `${href}#comentarios` : undefined}
            likeLabel={isAuthenticated ? undefined : 'Faça login para curtir'}
          />
          <UserBadge name={post.author.name} handle={post.author.handle} />
        </div>
      </div>
    </article>
  )
}
