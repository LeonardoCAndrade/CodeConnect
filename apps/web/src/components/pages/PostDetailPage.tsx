import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { createComment, getPost, listComments } from '../../api/posts'
import type { Comment, PostDetail } from '../../api/posts'
import { usePostActions } from '../../posts/usePostActions'
import CodeBlock from '../molecules/CodeBlock'
import CommentSection from '../organisms/CommentSection'
import PostCard from '../organisms/PostCard'

type DetailState =
  | { id: string; status: 'loading' }
  | { id: string; status: 'error'; message: string }
  | { id: string; status: 'ready'; post: PostDetail; comments: Comment[] }

function PostDetailPage() {
  const { id = '' } = useParams()
  const [loaded, setState] = useState<DetailState>({ id, status: 'loading' })
  // Dados de outro post (navegação entre detalhes) contam como carregando.
  const state: DetailState = loaded.id === id ? loaded : { id, status: 'loading' }
  const { isAuthenticated, toggleLike, share, notice } = usePostActions()

  useEffect(() => {
    let active = true
    Promise.all([getPost(id), listComments(id)])
      .then(([post, comments]) => {
        if (active) setState({ id, status: 'ready', post, comments })
      })
      .catch((error: unknown) => {
        if (active) setState({ id, status: 'error', message: error instanceof Error ? error.message : 'Não foi possível carregar o post.' })
      })
    return () => {
      active = false
    }
  }, [id])

  if (state.status !== 'ready') {
    return (
      <>
        <title>Post | CodeConnect</title>
        <p role="status" aria-live="polite" className="text-center text-lg text-foreground">
          {state.status === 'loading' ? 'Carregando post…' : state.message}
        </p>
        {state.status === 'error' && (
          <Link to="/" className="self-center text-lg text-primary underline">
            Voltar para o feed
          </Link>
        )}
      </>
    )
  }

  const { post, comments } = state

  function updatePost(updated: PostDetail) {
    setState((current) => (current.status === 'ready' ? { ...current, post: updated } : current))
  }

  async function addComment(body: string) {
    const comment = await createComment(post.id, body)
    setState((current) =>
      current.status === 'ready'
        ? {
            ...current,
            comments: [...current.comments, comment],
            post: { ...current.post, commentsCount: current.post.commentsCount + 1 },
          }
        : current,
    )
  }

  return (
    <>
      <title>{`${post.title} | CodeConnect`}</title>
      <div className="flex flex-col gap-6">
        <PostCard
          post={post}
          variant="detail"
          isAuthenticated={isAuthenticated}
          onLike={() => void toggleLike(post, updatePost)}
          onShare={() => void share(post)}
        />
        {post.code && <CodeBlock code={post.code} />}
      </div>
      <p role="status" aria-live="polite" className="text-center text-sm text-foreground empty:hidden">
        {notice}
      </p>
      <CommentSection comments={comments} isAuthenticated={isAuthenticated} onSubmit={addComment} />
    </>
  )
}

export default PostDetailPage
