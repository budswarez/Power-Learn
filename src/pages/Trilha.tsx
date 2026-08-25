import { useParams, useNavigate } from 'react-router-dom'
import { useTracks } from '@/hooks/useTracks'
import { useCourses } from '@/hooks/useCourses'
import type { Course } from '@/types'

export function Trilha() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tracks, loading: tracksLoading } = useTracks()
  const { courses, loading: coursesLoading } = useCourses()

  const track = tracks.find(t => t.id === id)

  if (tracksLoading || coursesLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="material-symbols-rounded text-4xl text-[var(--color-primary)] animate-spin">progress_activity</span>
      </div>
    )
  }

  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="material-symbols-rounded text-5xl text-[var(--color-surface-highest)] mb-4">search_off</span>
        <p className="font-['Space_Grotesk'] font-semibold text-[var(--color-on-surface)]">Trilha não encontrada</p>
        <button onClick={() => navigate('/biblioteca')}
          className="mt-4 text-sm text-[var(--color-primary)] hover:underline">
          Voltar para a Biblioteca
        </button>
      </div>
    )
  }

  const trackCourses = (track.courseIds ?? [])
    .map(cid => courses.find(c => c.id === cid))
    .filter(Boolean) as typeof courses

  const completedCount = trackCourses.filter(c => (c.progress ?? 0) === 100).length
  const overallProgress = trackCourses.length
    ? Math.round(trackCourses.reduce((acc, c) => acc + (c.progress ?? 0), 0) / trackCourses.length)
    : 0

  // First course not yet completed = next to do
  const nextIdx = trackCourses.findIndex(c => (c.progress ?? 0) < 100)

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] transition-colors mt-0.5 flex-shrink-0"
        >
          <span className="material-symbols-rounded">arrow_back</span>
        </button>

        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] mb-2">
            <span className="material-symbols-rounded text-[10px]">account_tree</span>Trilha
          </span>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-rounded text-[var(--color-primary)] text-2xl">
                {track.badge_icon ?? 'workspace_premium'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[var(--color-on-surface)] leading-tight">
                {track.title}
              </h1>
              {track.goal && (
                <p className="text-sm text-[var(--color-on-surface-variant)] mt-1 line-clamp-2">{track.goal}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress summary — compact strip */}
      <div className="bg-[var(--color-surface-container)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Progress ring */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `conic-gradient(var(--color-primary) ${overallProgress * 3.6}deg, color-mix(in srgb, var(--color-primary) 15%, transparent) 0deg)`,
            }}
          >
            <div className="w-9 h-9 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center">
              <span className="text-xs font-bold text-[var(--color-primary)]">{overallProgress}%</span>
            </div>
          </div>
          <div>
            <p className="font-['Space_Grotesk'] font-bold text-[var(--color-on-surface)] text-lg leading-none">{overallProgress}%</p>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">Progresso geral</p>
          </div>
        </div>

        <div className="hidden sm:block w-px h-8 bg-[var(--color-surface-highest)]" />
        <div className="sm:hidden h-px bg-[var(--color-surface-highest)]" />

        {/* Stats */}
        <div className="flex items-center gap-5 flex-1">
          <div className="text-center">
            <p className="font-['Space_Grotesk'] font-bold text-[var(--color-on-surface)] text-lg leading-none">{trackCourses.length}</p>
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-0.5">Cursos</p>
          </div>
          <div className="text-center">
            <p className="font-['Space_Grotesk'] font-bold text-green-400 text-lg leading-none">{completedCount}</p>
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-0.5">Concluídos</p>
          </div>
          <div className="text-center">
            <p className="font-['Space_Grotesk'] font-bold text-[var(--color-on-surface)] text-lg leading-none">
              {trackCourses.length - completedCount}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-0.5">Restantes</p>
          </div>
        </div>

        {/* CTA — continue */}
        {nextIdx >= 0 && (
          <button
            onClick={() => navigate(`/leitura/${trackCourses[nextIdx].id}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <span className="material-symbols-rounded text-base">play_arrow</span>
            <span className="hidden sm:inline">Continuar</span>
          </button>
        )}
      </div>

      {/* Course list */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]/60 mb-4 flex items-center gap-2">
          <span className="material-symbols-rounded text-sm text-[var(--color-primary)]">format_list_numbered</span>
          {trackCourses.length} curso{trackCourses.length !== 1 ? 's' : ''} nesta trilha
        </p>

        {trackCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-[var(--color-surface-highest)] rounded-xl">
            <span className="material-symbols-rounded text-4xl text-[var(--color-surface-highest)] mb-3">playlist_add</span>
            <p className="text-sm text-[var(--color-on-surface-variant)]">Esta trilha ainda não possui cursos.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {trackCourses.map((course, idx) => (
              <TrackCourseRow
                key={course.id}
                course={course}
                index={idx}
                isLast={idx === trackCourses.length - 1}
                isNext={idx === nextIdx}
                onClick={() => navigate(`/leitura/${course.id}`)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

interface TrackCourseRowProps {
  course: Course
  index: number
  isLast: boolean
  isNext: boolean
  onClick: () => void
}

function TrackCourseRow({ course, index, isLast, isNext, onClick }: TrackCourseRowProps) {
  const progress = course.progress ?? 0
  const isDone = progress === 100
  const inProgress = progress > 0 && progress < 100

  return (
    <div className="flex items-stretch gap-0">

      {/* Timeline column */}
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        {/* Step badge */}
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10
          text-[11px] font-bold font-['Space_Grotesk'] border-2 transition-colors
          ${isDone
            ? 'bg-green-600 border-green-600 text-white'
            : inProgress
              ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
              : isNext
                ? 'bg-[var(--color-surface-container)] border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'bg-[var(--color-surface-container)] border-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)]'
          }
        `}>
          {isDone
            ? <span className="material-symbols-rounded text-sm">check</span>
            : String(index + 1).padStart(2, '0')
          }
        </div>
        {/* Connector */}
        {!isLast && (
          <div className={`w-px flex-1 mt-0.5 mb-0.5 ${isDone ? 'bg-green-700/50' : 'bg-[var(--color-surface-highest)]'}`} />
        )}
      </div>

      {/* Card */}
      <div
        onClick={onClick}
        className={`
          flex-1 ml-3 mb-2 rounded-xl cursor-pointer transition-all duration-200 group overflow-hidden
          border hover:shadow-[0_4px_20px_color-mix(in_srgb,var(--color-primary)_12%,transparent)]
          ${isNext
            ? 'bg-[var(--color-surface-container)] border-[var(--color-primary)]/30 hover:border-[var(--color-primary)]/60'
            : 'bg-[var(--color-surface-container)] border-[var(--color-surface-highest)] hover:border-[var(--color-surface-high)]'
          }
          ${isDone ? 'opacity-75 hover:opacity-100' : ''}
        `}
      >
        <div className="flex items-center gap-3 p-3">

          {/* Thumbnail — small square */}
          {course.thumbnail ? (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--color-surface-highest)]">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex-shrink-0 bg-[var(--color-surface-highest)] flex items-center justify-center">
              <span className="material-symbols-rounded text-[var(--color-on-surface-variant)] text-2xl">menu_book</span>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-start gap-2">
              <h3 className={`
                font-['Space_Grotesk'] font-semibold text-sm leading-snug line-clamp-2 flex-1
                transition-colors group-hover:text-[var(--color-on-surface)]
                ${isDone ? 'text-[var(--color-on-surface-variant)]' : 'text-[var(--color-on-surface)]'}
              `}>
                {course.title}
              </h3>
              {isNext && (
                <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-primary)]/15 text-[var(--color-primary)] mt-0.5">
                  Próximo
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {course.duration && (
                <span className="text-[11px] text-[var(--color-on-surface-variant)] flex items-center gap-1">
                  <span className="material-symbols-rounded text-[12px]">schedule</span>
                  {course.duration}
                </span>
              )}
              {course.category && (
                <span className="text-[11px] text-[var(--color-on-surface-variant)] truncate">{course.category}</span>
              )}
            </div>

            {/* Progress bar */}
            {progress > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-[var(--color-surface-highest)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isDone ? 'bg-green-500' : 'bg-[var(--color-primary)]'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className={`text-[10px] font-semibold flex-shrink-0 ${isDone ? 'text-green-400' : 'text-[var(--color-primary)]'}`}>
                  {progress}%
                </span>
              </div>
            )}
          </div>

          {/* Action */}
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all
            ${isDone
              ? 'text-green-400 bg-green-500/10 group-hover:bg-green-500/20'
              : 'text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)] group-hover:bg-[var(--color-primary)]/10'
            }
          `}>
            <span className="material-symbols-rounded text-lg">
              {isDone ? 'replay' : 'chevron_right'}
            </span>
          </div>

        </div>

        {/* "Próximo" highlight bar */}
        {isNext && (
          <div className="h-0.5 bg-gradient-to-r from-[var(--color-primary)] to-transparent" />
        )}
      </div>

    </div>
  )
}
