import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CourseCard } from '@/components/ui/CourseCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useCourses } from '@/hooks/useCourses'
import { useTracks } from '@/hooks/useTracks'
import type { Track } from '@/types'

type Filter = 'todos' | 'hardware' | 'software' | 'trilhas'

const FILTERS: { key: Filter; label: string; icon: string }[] = [
  { key: 'todos',    label: 'Todos',    icon: 'apps' },
  { key: 'hardware', label: 'Hardware', icon: 'memory' },
  { key: 'software', label: 'Software', icon: 'code' },
  { key: 'trilhas',  label: 'Trilhas',  icon: 'account_tree' },
]

export function Biblioteca() {
  const { courses, loading: coursesLoading } = useCourses()
  const { tracks, loading: tracksLoading } = useTracks()
  const loading = coursesLoading || tracksLoading
  const [searchParams] = useSearchParams()
  const [filter, setFilter] = useState<Filter>('todos')
  const search = searchParams.get('q') ?? ''

  const filteredCourses = useMemo(() => courses.filter(c => {
    const matchFilter = filter === 'todos' || filter === 'trilhas' ? true : c.category === filter
    return matchFilter && c.title.toLowerCase().includes(search.toLowerCase())
  }), [filter, search, courses])

  const filteredTracks = useMemo(() => tracks.filter(t =>
    (filter === 'todos' || filter === 'trilhas') &&
    t.title.toLowerCase().includes(search.toLowerCase())
  ), [filter, search, tracks])

  const showCourses = filter !== 'trilhas'
  const showTracks  = filter === 'todos' || filter === 'trilhas'
  const totalItems  = (showCourses ? filteredCourses.length : 0) + (showTracks ? filteredTracks.length : 0)

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl">
        <div>
          <div className="h-8 w-52 rounded-lg bg-[var(--color-surface-container)] animate-pulse" />
          <div className="h-4 w-32 rounded mt-2 bg-[var(--color-surface-container)] animate-pulse" />
        </div>
        <div className="flex gap-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-9 w-24 rounded-lg bg-[var(--color-surface-container)] animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="rounded-xl overflow-hidden bg-[var(--color-surface-container)] animate-pulse">
              <div className="aspect-video bg-[var(--color-surface-highest)]" />
              <div className="p-4 space-y-3">
                <div className="h-4 rounded bg-[var(--color-surface-highest)]" />
                <div className="h-3 w-2/3 rounded bg-[var(--color-surface-highest)]" />
                <div className="h-2 rounded-full bg-[var(--color-surface-highest)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-[var(--color-on-surface)]">Base do Conhecimento</h1>
        <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">{totalItems} {totalItems === 1 ? 'item' : 'itens'} disponíveis{search && ` para "${search}"`}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              filter === f.key
                ? 'bg-[var(--color-primary)] text-white shadow-[0_0_16px_color-mix(in_srgb,var(--color-primary)_40%,transparent)]'
                : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-high)] hover:text-[var(--color-on-surface)]'
            }`}>
            <span className="material-symbols-rounded text-base">{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>

      {showTracks && filteredTracks.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-2">
            <span className="material-symbols-rounded text-[var(--color-primary)] text-base">account_tree</span>
            Trilhas de Aprendizado
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTracks.map(track => <TrackCard key={track.id} track={track} />)}
          </div>
        </section>
      )}

      {showTracks && filteredTracks.length > 0 && showCourses && filteredCourses.length > 0 && (
        <div className="border-t border-[var(--color-surface-highest)]" />
      )}

      {showCourses && (
        <section className="space-y-4">
          {showTracks && filteredTracks.length > 0 && (
            <h2 className="text-sm uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-2">
              <span className="material-symbols-rounded text-[var(--color-primary)] text-base">play_circle</span>
              Cursos e Processos
            </h2>
          )}
          {filteredCourses.length > 0
            ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCourses.map(course => <CourseCard key={course.id} item={{ ...course, type: 'curso' }} />)}
              </div>
            : <EmptyState search={search} />}
        </section>
      )}

      {totalItems === 0 && <EmptyState search={search} />}
    </div>
  )
}

function TrackCard({ track }: { track: Track }) {
  const navigate = useNavigate()
  return (
    <div onClick={() => navigate(`/trilha/${track.id}`)} className="bg-[var(--color-surface-container)] rounded-xl p-5 hover:bg-[var(--color-surface-high)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_color-mix(in_srgb,var(--color-primary)_12%,transparent)] transition-all duration-200 cursor-pointer group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-highest)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-primary)] transition-colors">
          <span className="material-symbols-rounded text-[var(--color-primary)] text-2xl group-hover:text-white transition-colors">
            {track.badge_icon ?? 'workspace_premium'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] mb-1">
            <span className="material-symbols-rounded text-[10px]">account_tree</span>Trilha
          </span>
          <h3 className="font-['Space_Grotesk'] font-semibold text-[var(--color-on-surface)] leading-snug">{track.title}</h3>
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 line-clamp-2">{track.goal}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <p className="text-xs text-[var(--color-on-surface-variant)] flex items-center gap-1">
          <span className="material-symbols-rounded text-sm">play_circle</span>
          {track.courseIds?.length ?? 0} cursos
        </p>
        <ProgressBar value={track.progress ?? 0} showLabel />
      </div>
    </div>
  )
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="material-symbols-rounded text-5xl text-[var(--color-surface-highest)] mb-4">search_off</span>
      <p className="font-['Space_Grotesk'] font-semibold text-[var(--color-on-surface)]">
        {search ? `Nenhum resultado para "${search}"` : 'Nenhum item nesta categoria'}
      </p>
      <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">Tente outro filtro ou termo de busca.</p>
    </div>
  )
}
