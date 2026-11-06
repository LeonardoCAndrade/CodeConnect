import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { likePost, unlikePost } from '../api/posts'
import type { Post } from '../api/posts'
import { useAuth } from '../auth/useAuth'

/** Curtir (com atualização otimista) e compartilhar, comuns ao feed e ao detalhe. */
export function usePostActions() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [notice, setNotice] = useState('')

  const toggleLike = useCallback(
    async <T extends Post>(post: T, update: (post: T) => void) => {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: location } })
        return
      }
      const liked = !post.likedByMe
      setNotice('')
      update({ ...post, likedByMe: liked, likesCount: post.likesCount + (liked ? 1 : -1) })
      try {
        await (liked ? likePost(post.id) : unlikePost(post.id))
      } catch (error) {
        update(post)
        setNotice(error instanceof Error ? error.message : 'Não foi possível atualizar a curtida.')
      }
    },
    [isAuthenticated, location, navigate],
  )

  const share = useCallback(async (post: Post) => {
    const url = new URL(`/posts/${post.id}`, window.location.origin).href
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: post.title, url })
      } catch {
        // compartilhamento cancelado pela pessoa usuária
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setNotice('Link copiado para a área de transferência.')
    } catch {
      setNotice(`Copie o link: ${url}`)
    }
  }, [])

  return { isAuthenticated, toggleLike, share, notice }
}
