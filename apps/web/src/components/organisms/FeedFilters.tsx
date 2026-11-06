import type { PostSort } from '../../api/posts'
import Tag from '../atoms/Tag'
import SearchBox from '../molecules/SearchBox'
import Tabs from '../molecules/Tabs'

type FeedFiltersProps = {
  query: string
  onQueryChange: (query: string) => void
  selectedTags: string[]
  suggestedTags: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  onClear: () => void
  sort: PostSort
  onSortChange: (sort: PostSort) => void
}

const sortOptions: { value: PostSort; label: string }[] = [
  { value: 'recent', label: 'Recentes' },
  { value: 'popular', label: 'Populares' },
]

export default function FeedFilters({
  query,
  onQueryChange,
  selectedTags,
  suggestedTags,
  onAddTag,
  onRemoveTag,
  onClear,
  sort,
  onSortChange,
}: FeedFiltersProps) {
  const selected = new Set(selectedTags.map((tag) => tag.toLowerCase()))
  const suggestions = suggestedTags.filter((tag) => !selected.has(tag.toLowerCase()))
  const hasFilters = query.trim() !== '' || selectedTags.length > 0

  return (
    <div className="flex flex-col gap-10 lg:gap-14">
      <search className="flex flex-col gap-4">
        <SearchBox value={query} onChange={onQueryChange} />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ul aria-label="Filtrar por tags" className="flex flex-wrap items-center gap-3 sm:gap-6">
            {selectedTags.map((tag) => (
              <li key={tag}>
                <Tag label={tag} variant="selected" onRemove={() => onRemoveTag(tag)} actionLabel={`Remover filtro ${tag}`} />
              </li>
            ))}
            {suggestions.map((tag) => (
              <li key={tag}>
                <Tag label={tag} onClick={() => onAddTag(tag)} actionLabel={`Filtrar por ${tag}`} />
              </li>
            ))}
          </ul>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="cursor-pointer rounded text-lg leading-normal text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Limpar tudo
            </button>
          )}
        </div>
      </search>
      <Tabs label="Ordenar posts" options={sortOptions} value={sort} onChange={onSortChange} />
    </div>
  )
}
