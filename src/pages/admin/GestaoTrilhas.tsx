import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTracks } from '@/hooks/useTracks'
import { useDepartments } from '@/hooks/useDepartments'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/services/supabase'
import type { Track } from '@/types'

export function GestaoTrilhas() {
  const navigate = useNavigate()
  const { tracks, setTracks, loading } = useTracks()
  const { departments } = useDepartments()
  const { userRole } = useAuth()
  const canEdit = userRole === 'admin' || userRole === 'gerente'
  const canDelete = userRole === 'admin'
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(id: string) {
    setDeleting(true)
    await supabase.from('track_courses').delete().eq('track_id', id)
    await supabase.from('track_departments').delete().eq('track_id', id)
    await supabase.from('tracks').delete().eq('id', id)
    setTracks(prev => prev.filter(t => t.id !== id))
    setConfirmId(null)
    setDeleting(false)
  }

  const filtered = useMemo(() => tracks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.goal?.toLowerCase().includes(search.toLowerCase())
    const matchDept = filterDept === null
      ? true
      : filterDept === '__none__'
        ? (t.departmentIds ?? []).length === 0
        : (t.departmentIds ?? []).includes(filterDept)
    return matchSearch && matchDept
  }), [tracks, search, filterDept])

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-[var(--color-on-surface)]">
            Trilhas
          </h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
            {filtered.length} {filtered.length === 1 ? 'trilha' : 'trilhas'} cadastradas
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => navigate('/admin/trilhas/nova')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-[0_0_16px_color-mix(in_srgb,var(--color-primary)_40%,transparent)]"
          >
            <span className="material-symbols-rounded text-base">add</span>
            Nova Trilha
          </button>
        )}
      </div>

      {/* Search + Department filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-xs">
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] text-lg pointer-events-none">search</span>
          <input
            type="text" placeholder="Buscar por título ou objetivo..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full rounded-lg text-sm bg-[var(--color-surface-container)] text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)] outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
          />
        </div>
        {departments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterDept(null)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterDept === null
                  ? 'bg-[var(--color-primary)] text-white shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]'
                  : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-high)]'
              }`}
            >
              <span className="material-symbols-rounded text-sm">apps</span>
              Todos
            </button>
            {departments.map(dept => (
              <button
                key={dept.id}
                onClick={() => setFilterDept(filterDept === dept.id ? null : dept.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterDept === dept.id
                    ? 'bg-[var(--color-primary)] text-white shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]'
                    : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-high)]'
                }`}
              >
                <span className="material-symbols-rounded text-sm">corporate_fare</span>
                {dept.name}
              </button>
            ))}
            <button
              onClick={() => setFilterDept(filterDept === '__none__' ? null : '__none__')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterDept === '__none__'
                  ? 'bg-[var(--color-primary)] text-white shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]'
                  : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-high)]'
              }`}
            >
              <span className="material-symbols-rounded text-sm">public</span>
              Sem restrição
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="bg-[var(--color-surface-container)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-[var(--color-surface-highest)]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-11 h-11 rounded-xl bg-[var(--color-surface-highest)] flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-[var(--color-surface-highest)] rounded w-1/3" />
                  <div className="h-2.5 bg-[var(--color-surface-highest)] rounded w-1/2" />
                </div>
                <div className="hidden md:block w-16 h-5 bg-[var(--color-surface-highest)] rounded" />
                <div className="hidden sm:block w-16 h-6 bg-[var(--color-surface-highest)] rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-rounded text-5xl text-[var(--color-surface-highest)] mb-4">search_off</span>
            <p className="font-['Space_Grotesk'] font-semibold text-[var(--color-on-surface)]">
              {search ? `Nenhum resultado para "${search}"` : 'Nenhuma trilha cadastrada'}
            </p>
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
              Clique em <strong>Nova Trilha</strong> para criar a primeira.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-surface-highest)]">
            {filtered.map(track => (
              <TrackRow
                key={track.id}
                track={track}
                departments={departments}
                canEdit={canEdit}
                canDelete={canDelete}
                confirmingDelete={confirmId === track.id}
                deleting={deleting && confirmId === track.id}
                onView={() => navigate(`/trilha/${track.id}`)}
                onEdit={() => navigate(`/admin/trilhas/${track.id}/editar`)}
                onDeleteRequest={e => { e.stopPropagation(); setConfirmId(track.id) }}
                onDeleteConfirm={e => { e.stopPropagation(); handleDelete(track.id) }}
                onDeleteCancel={e => { e.stopPropagation(); setConfirmId(null) }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TrackRow({ track, departments, canEdit, canDelete, confirmingDelete, deleting, onView, onEdit, onDeleteRequest, onDeleteConfirm, onDeleteCancel }: {
  track: Track
  departments: { id: string; name: string }[]
  canEdit: boolean
  canDelete: boolean
  confirmingDelete: boolean
  deleting: boolean
  onView: () => void
  onEdit: () => void
  onDeleteRequest: (e: React.MouseEvent) => void
  onDeleteConfirm: (e: React.MouseEvent) => void
  onDeleteCancel: (e: React.MouseEvent) => void
}) {
  const trackDepts = departments.filter(d => (track.departmentIds ?? []).includes(d.id))

  return (
    <div
      onClick={onView}
      className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--color-surface-high)] transition-colors cursor-pointer group"
    >
      {/* Badge icon */}
      <div className="w-11 h-11 rounded-xl bg-[var(--color-primary)]/15 flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-rounded text-[var(--color-primary)] text-xl">
          {track.badge_icon ?? 'account_tree'}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--color-on-surface)] truncate group-hover:text-white transition-colors">
          {track.title}
        </p>
        {track.goal && (
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5 truncate">{track.goal}</p>
        )}
        {/* Department labels */}
        {trackDepts.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {trackDepts.map(d => (
              <span key={d.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <span className="material-symbols-rounded text-[10px]">corporate_fare</span>
                {d.name}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-1.5">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)]">
              <span className="material-symbols-rounded text-[10px]">public</span>
              Todos os departamentos
            </span>
          </div>
        )}
      </div>

      {/* Courses count */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-[var(--color-on-surface-variant)] flex-shrink-0 w-24">
        <span className="material-symbols-rounded text-sm">play_circle</span>
        {track.courseIds?.length ?? 0} {(track.courseIds?.length ?? 0) === 1 ? 'curso' : 'cursos'}
      </div>

      {/* Visibility badge */}
      <div className="hidden sm:block flex-shrink-0">
        {track.visibility === 'private' ? (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] text-xs font-medium">
            <span className="material-symbols-rounded text-sm">lock</span>
            Privada
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-xs font-semibold">
            <span className="material-symbols-rounded text-sm">public</span>
            Pública
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {canEdit && !confirmingDelete && (
          <button
            onClick={e => { e.stopPropagation(); onEdit() }}
            className="p-2 rounded-lg text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all"
            title="Editar"
          >
            <span className="material-symbols-rounded text-base">edit</span>
          </button>
        )}

        {canDelete && !confirmingDelete && (
          <button
            onClick={onDeleteRequest}
            className="p-2 rounded-lg text-[var(--color-on-surface-variant)] hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Remover"
          >
            <span className="material-symbols-rounded text-base">delete</span>
          </button>
        )}

        {confirmingDelete && (
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-[var(--color-on-surface-variant)]">Remover?</span>
            <button
              onClick={onDeleteConfirm}
              disabled={deleting}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 text-xs font-semibold hover:bg-red-500/25 transition-colors disabled:opacity-50"
            >
              {deleting
                ? <span className="material-symbols-rounded text-sm animate-spin">progress_activity</span>
                : <span className="material-symbols-rounded text-sm">delete_forever</span>
              }
              Confirmar
            </button>
            <button
              onClick={onDeleteCancel}
              className="px-2.5 py-1 rounded-lg bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] text-xs font-medium hover:bg-[var(--color-surface-high)] transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}

        {!confirmingDelete && (
          <span className="material-symbols-rounded text-[var(--color-on-surface-variant)] text-base">arrow_forward</span>
        )}
      </div>
    </div>
  )
}
