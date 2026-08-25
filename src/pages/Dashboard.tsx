import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { CourseCard } from '@/components/ui/CourseCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useCourses } from '@/hooks/useCourses'
import { useTracks } from '@/hooks/useTracks'
import { useDashboardConfig, toEmbedUrl } from '@/hooks/useDashboardConfig'
import { useDepartments } from '@/hooks/useDepartments'

export function Dashboard() {
  const { user, userRole, userDepartment } = useAuth()
  const navigate = useNavigate()
  const { courses } = useCourses()
  const { tracks } = useTracks()
  const { config: dashConfig, loading: dashLoading } = useDashboardConfig()
  const { departments } = useDepartments()

  const firstName = (user?.user_metadata?.name as string | undefined)?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'Colaborador'

  const recentCourses = courses
    .filter(c => (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100)
    .slice(0, 4)

  // Resolve user's department ID from the department name stored in users table
  const userDeptId = useMemo(
    () => departments.find(d => d.name === userDepartment)?.id ?? null,
    [departments, userDepartment]
  )

  // Determine if a content item is accessible to the current user
  const canAccess = useMemo(() => (deptIds: string[]) => {
    if (userRole === 'admin' || userRole === 'gerente') return true
    if (deptIds.length === 0) return true
    return userDeptId ? deptIds.includes(userDeptId) : false
  }, [userRole, userDeptId])

  // Novidades: 4 most recently created courses + tracks accessible to the user
  const novidades = useMemo(() => {
    type Item = {
      id: string
      type: 'curso' | 'trilha'
      title: string
      sub: string
      icon: string
      created_at: string
    }

    const items: Item[] = [
      ...courses
        .filter(c => canAccess(c.departmentIds ?? []))
        .map(c => ({
          id: c.id,
          type: 'curso' as const,
          title: c.title,
          sub: [c.duration, c.category].filter(Boolean).join(' · ') || 'Curso',
          icon: 'menu_book',
          created_at: c.created_at ?? '',
        })),
      ...tracks
        .filter(t => canAccess(t.departmentIds ?? []))
        .map(t => ({
          id: t.id,
          type: 'trilha' as const,
          title: t.title,
          sub: `Trilha · ${t.courseIds?.length ?? 0} curso${(t.courseIds?.length ?? 0) !== 1 ? 's' : ''}`,
          icon: 'account_tree',
          created_at: t.created_at ?? '',
        })),
    ]

    return items
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 4)
  }, [courses, tracks, canAccess])

  return (
    <div className="space-y-8 max-w-7xl">

      {/* Saudação */}
      <div>
        <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-[var(--color-on-surface)]">
          Olá, {firstName} 👋
        </h1>
        <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
          Continue de onde parou — seu aprendizado importa.
        </p>
      </div>

      {/* Video hero — largura total */}
      {dashLoading ? (
        <div className="bg-[var(--color-surface-container)] rounded-xl overflow-hidden animate-pulse">
          <div className="aspect-video bg-[var(--color-surface-highest)]" />
          <div className="p-5 space-y-2">
            <div className="h-5 w-2/3 rounded bg-[var(--color-surface-highest)]" />
            <div className="h-3 w-1/2 rounded bg-[var(--color-surface-highest)]" />
          </div>
        </div>
      ) : (
        <div className="bg-[var(--color-surface-container)] rounded-xl overflow-hidden">
          <div className="relative aspect-video bg-[var(--color-surface-lowest)]">
            <iframe
              src={toEmbedUrl(dashConfig.featured_video_url)}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              allowFullScreen
              title="Vídeo de destaque"
            />
          </div>
          <div className="p-5">
            {dashConfig.featured_video_title && (
              <h2 className="font-['Space_Grotesk'] font-bold text-[var(--color-on-surface)] mt-1">
                {dashConfig.featured_video_title}
              </h2>
            )}
            {dashConfig.featured_video_description && (
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
                {dashConfig.featured_video_description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Novidades */}
      {novidades.length > 0 && (
        <div>
          <h2 className="font-['Space_Grotesk'] font-semibold text-[var(--color-on-surface)] mb-4 flex items-center gap-2">
            <span className="material-symbols-rounded text-[var(--color-primary)]">new_releases</span>
            Novidades
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {novidades.map(item => (
              <div
                key={item.id}
                onClick={() => navigate(item.type === 'trilha' ? `/trilha/${item.id}` : `/leitura/${item.id}`)}
                className="bg-[var(--color-surface-container)] rounded-xl p-4 flex items-start gap-3 hover:bg-[var(--color-surface-high)] transition-colors cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--color-surface-highest)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-primary)] transition-colors">
                  <span className="material-symbols-rounded text-[var(--color-primary)] text-lg group-hover:text-white transition-colors">
                    {item.icon}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-on-surface)] leading-snug line-clamp-2">{item.title}</p>
                  <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5 leading-snug">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continue lendo */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Space_Grotesk'] font-semibold text-[var(--color-on-surface)] flex items-center gap-2">
            <span className="material-symbols-rounded text-[var(--color-primary)]">history</span>
            Continue de Onde Parou
          </h2>
          <a href="/biblioteca" className="text-xs text-[var(--color-tertiary)] hover:underline flex items-center gap-1">
            Ver todos <span className="material-symbols-rounded text-sm">chevron_right</span>
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recentCourses.map(course => (
            <CourseCard key={course.id} item={{ ...course, type: 'curso' }} />
          ))}
        </div>
      </div>

      {/* Trilhas */}
      <div>
        <h2 className="font-['Space_Grotesk'] font-semibold text-[var(--color-on-surface)] mb-4 flex items-center gap-2">
          <span className="material-symbols-rounded text-[var(--color-primary)]">account_tree</span>
          Trilhas em Andamento
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map(track => (
            <div key={track.id} onClick={() => navigate(`/trilha/${track.id}`)}
              className="bg-[var(--color-surface-container)] rounded-xl p-5 hover:bg-[var(--color-surface-high)] transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-highest)] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-rounded text-[var(--color-primary)]">{track.badge_icon ?? 'workspace_premium'}</span>
                </div>
                <div>
                  <p className="font-['Space_Grotesk'] font-semibold text-[var(--color-on-surface)] text-sm">{track.title}</p>
                  <p className="text-xs text-[var(--color-on-surface-variant)]">{track.courseIds?.length ?? 0} cursos</p>
                </div>
              </div>
              <p className="text-xs text-[var(--color-on-surface-variant)] mb-3 line-clamp-2">{track.goal}</p>
              <ProgressBar value={track.progress ?? 0} showLabel />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
