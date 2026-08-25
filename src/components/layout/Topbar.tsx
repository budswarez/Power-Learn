import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCourses } from '@/hooks/useCourses'
import { useNavigate } from 'react-router-dom'

interface TopbarProps {
  onMenuToggle: () => void
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { user } = useAuth()
  const { courses } = useCourses()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = search.trim()
    navigate(q ? `/biblioteca?q=${encodeURIComponent(q)}` : '/biblioteca')
    setSearch('')
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'PL'

  const completedCount  = courses.filter(c => (c.progress ?? 0) === 100).length
  const inProgressCount = courses.filter(c => (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100).length
  const totalStarted    = courses.filter(c => (c.progress ?? 0) > 0).length

  const overallProgress = courses.length
    ? Math.round(courses.reduce((acc, c) => acc + (c.progress ?? 0), 0) / courses.length)
    : 0

  const miniStats = [
    { icon: 'emoji_events',  value: String(completedCount),  label: 'Concluídos', color: '#FFB300' },
    { icon: 'play_circle',   value: String(inProgressCount), label: 'Em andamento', color: 'var(--color-primary)' },
    { icon: 'library_books', value: String(totalStarted),    label: 'Iniciados',  color: 'var(--color-tertiary)' },
  ]

  return (
    <header
      className="fixed top-0 right-0 left-0 z-30 h-20 flex items-center px-4 sm:px-6 gap-3"
      style={{ background: 'color-mix(in srgb, var(--color-surface-low) 80%, transparent)', backdropFilter: 'blur(12px)' }}
    >
      {/* Mobile hamburger button */}
      <button
        className="lg:hidden p-2 rounded-lg text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-highest)] transition-colors flex-shrink-0"
        onClick={onMenuToggle}
        aria-label="Abrir menu"
      >
        <span className="material-symbols-rounded">menu</span>
      </button>

      {/* Left spacer (sidebar offset on desktop) */}
      <div className="flex-1" />

      {/* ── Stats — visível apenas em telas xl+ ── */}
      <div className="hidden xl:flex items-center gap-5">

        {/* Progresso geral com anel conic-gradient */}
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `conic-gradient(var(--color-primary) ${overallProgress * 3.6}deg, color-mix(in srgb, var(--color-primary) 15%, transparent) 0deg)`,
            }}
          >
            <div className="w-[26px] h-[26px] rounded-full bg-[var(--color-surface-low)] flex items-center justify-center">
              <span className="text-[8px] font-bold text-[var(--color-primary)]">{overallProgress}</span>
            </div>
          </div>
          <div>
            <p className="text-[13px] font-bold leading-none text-[var(--color-on-surface)]">{overallProgress}%</p>
            <p className="text-[10px] text-[var(--color-on-surface-variant)] leading-none mt-0.5">Progresso</p>
          </div>
        </div>

        <div className="w-px h-7 bg-[var(--color-surface-highest)]" />

        {/* Mini stats — dados reais */}
        {miniStats.map(stat => (
          <div key={stat.label} className="flex items-center gap-1.5">
            <span
              className="material-symbols-rounded text-[18px] flex-shrink-0"
              style={{ color: stat.color }}
            >
              {stat.icon}
            </span>
            <div>
              <p className="text-[13px] font-bold leading-none text-[var(--color-on-surface)]">{stat.value}</p>
              <p className="text-[10px] text-[var(--color-on-surface-variant)] leading-none mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden xl:block w-px h-7 bg-[var(--color-surface-highest)]" />

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:flex items-center">
          <span className="material-symbols-rounded absolute left-3 text-[var(--color-on-surface-variant)] text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg text-sm bg-[var(--color-surface-highest)] text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)] outline-none focus:ring-2 focus:ring-[var(--color-primary)] w-40 sm:w-52 transition-all"
          />
        </form>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-highest)] transition-colors">
          <span className="material-symbols-rounded">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-primary)]" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold cursor-pointer select-none">
          {initials}
        </div>
      </div>
    </header>
  )
}
