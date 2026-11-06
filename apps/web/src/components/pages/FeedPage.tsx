import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { listPosts, listTags } from '../../api/posts'
import type { Post, PostSort } from '../../api/posts'
import { usePostActions } from '../../posts/usePostActions'
import PrimaryButton from '../atoms/PrimaryButton'
import FeedFilters from '../organisms/FeedFilters'
import PostCard from '../organisms/PostCard'

const PAGE_SIZE = 6
const SEARCH_DELAY = 300

type FeedState = {
  key: string
  posts: Post[]
  total: number
  page: number
  status: 'ready' | 'error'
  error?: string
}

function FeedPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const tags = params.getAll('tags')
  const sort: PostSort = params.get('sort') === 'popular' ? 'popular' : 'recent'
  // Filtros na URL: o feed pode ser compartilhado e o "voltar" do navegador funciona.
  const filterKey = JSON.stringify([q, tags, sort])

  const [query, setQuery] = useState(q)
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [feed, setFeed] = useState<FeedState>({ key: '', posts: [], total: 0, page: 1, status: 'ready' })
  const [loadingMore, setLoadingMore] = useState(false)
  const { isAuthenticated, toggleLike, share, notice } = usePostActions()
  // Enquanto chegam os posts do filtro atual, os anteriores continuam visíveis.
  const status = feed.key === filterKey ? feed.status : 'loading'

  function updateParams(changes: { q?: string; tags?: string[]; sort?: PostSort }) {
    const next = new URLSearchParams(params)
    if (changes.q !== undefined) {
      if (changes.q.trim()) next.set('q', changes.q)
      else next.delete('q')
    }
    if (changes.tags !== undefined) {
      next.delete('tags')
      for (const tag of changes.tags) next.append('tags', tag)
    }
    if (changes.sort !== undefined) {
      if (changes.sort === 'popular') next.set('sort', 'popular')
      else next.delete('sort')
    }
    setParams(next, { replace: changes.q !== undefined && Object.keys(changes).length === 1 })
  }

  // A busca é enviada ao backend depois que a pessoa para de digitar.
  const sentQuery = useRef(q)
  useEffect(() => {
    if (query === sentQuery.current) return
    const timer = setTimeout(() => {
      sentQuery.current = query
      updateParams({ q: query })
    }, SEARCH_DELAY)
    return () => clearTimeout(timer)
  }, [query]) // oxlint-disable-line react/exhaustive-deps -- só reage ao texto digitado

  // A URL mudou por fora (voltar do navegador, "Limpar tudo"): atualiza o campo.
  useEffect(() => {
    if (q !== sentQuery.current) {
      sentQuery.current = q
      setQuery(q)
    }
  }, [q])

  useEffect(() => {
    let active = true
    listTags(8)
      .then((result) => active && setSuggestedTags(result.map((tag) => tag.name)))
      .catch(() => {
        // sem sugestões, os filtros por tag continuam disponíveis pelos cards
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    const [search, filterTags, order] = JSON.parse(filterKey) as [string, string[], PostSort]
    listPosts({ q: search || undefined, tags: filterTags.length ? filterTags : undefined, sort: order, page: 1, pageSize: PAGE_SIZE })
      .then((result) => {
        if (active) setFeed({ key: filterKey, posts: result.items, total: result.total, page: 1, status: 'ready' })
      })
      .catch((error: unknown) => {
        if (active)
          setFeed({
            key: filterKey,
            posts: [],
            total: 0,
            page: 1,
            status: 'error',
            error: error instanceof Error ? error.message : 'Não foi possível carregar o feed.',
          })
      })
    return () => {
      active = false
    }
  }, [filterKey])

  async function loadMore() {
    setLoadingMore(true)
    try {
      const next = feed.page + 1
      const result = await listPosts({ q: q || undefined, tags: tags.length ? tags : undefined, sort, page: next, pageSize: PAGE_SIZE })
      setFeed((current) =>
        current.key === filterKey
          ? { ...current, posts: [...current.posts, ...result.items], total: result.total, page: next }
          : current,
      )
    } catch (error) {
      setFeed((current) => ({ ...current, error: error instanceof Error ? error.message : 'Não foi possível carregar mais posts.' }))
    } finally {
      setLoadingMore(false)
    }
  }

  function replacePost(updated: Post) {
    setFeed((current) => ({ ...current, posts: current.posts.map((post) => (post.id === updated.id ? updated : post)) }))
  }

  function addTag(tag: string) {
    if (!tags.some((current) => current.toLowerCase() === tag.toLowerCase())) updateParams({ tags: [...tags, tag] })
  }

  function clearFilters() {
    sentQuery.current = ''
    setQuery('')
    updateParams({ q: '', tags: [] })
  }

  return (
    <>
      <title>Feed | CodeConnect</title>
      <h1 className="sr-only">Feed de projetos</h1>
      <FeedFilters
        query={query}
        onQueryChange={setQuery}
        selectedTags={tags}
        suggestedTags={suggestedTags}
        onAddTag={addTag}
        onRemoveTag={(tag) => updateParams({ tags: tags.filter((current) => current !== tag) })}
        onClear={clearFilters}
        sort={sort}
        onSortChange={(value) => updateParams({ sort: value })}
      />

      <p role="status" aria-live="polite" className="text-center text-sm text-foreground empty:hidden">
        {status === 'loading' ? 'Carregando posts…' : notice || (status === 'error' ? feed.error : '')}
      </p>

      {status === 'ready' && feed.posts.length === 0 && (
        <p className="text-center text-lg text-muted">Nenhum post encontrado. Tente outros termos ou remova filtros.</p>
      )}

      {feed.posts.length > 0 && (
        <ul aria-label="Posts" aria-busy={status === 'loading'} className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {feed.posts.map((post) => (
            <li key={post.id} className="flex">
              <PostCard
                post={post}
                isAuthenticated={isAuthenticated}
                onLike={(target) => void toggleLike(target, replacePost)}
                onShare={(target) => void share(target)}
                onTagClick={addTag}
              />
            </li>
          ))}
        </ul>
      )}

      {status === 'ready' && feed.posts.length < feed.total && (
        <PrimaryButton type="button" variant="outline" onClick={() => void loadMore()} disabled={loadingMore} className="self-center sm:w-auto">
          {loadingMore ? 'Carregando…' : 'Carregar mais'}
        </PrimaryButton>
      )}
    </>
  )
}

export default FeedPage
