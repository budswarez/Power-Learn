import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/services/supabase'
import { useTracks } from '@/hooks/useTracks'
import { useCourses } from '@/hooks/useCourses'
import { useDepartments } from '@/hooks/useDepartments'
import { DepartmentPicker } from '@/components/ui/DepartmentPicker'
import type { Course } from '@/types'

const ICONS = ['workspace_premium', 'verified', 'star', 'military_tech', 'emoji_events', 'bolt', 'local_fire_department', 'school']

export function EditarTrilha() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { tracks, loading: tracksLoading } = useTracks()
  const { courses: allCourses } = useCourses()
  const { departments } = useDepartments()

  const [title, setTitle] = useState('')
  const [goal, setGoal] = useState('')
  const [badgeIcon, setBadgeIcon] = useState('workspace_premium')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [departmentIds, setDepartmentIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (tracksLoading || !id) return
    const track = tracks.find(t => t.id === id)
    if (!track) { setNotFound(true); return }
    setTitle(track.title)
    setGoal(track.goal ?? '')
    setBadgeIcon(track.badge_icon ?? 'workspace_premium')
    setVisibility(track.visibility ?? 'public')
    setSelectedIds(track.courseIds ?? [])
    setDepartmentIds(track.departmentIds ?? [])
  }, [tracksLoading, id, tracks])

  function toggleCourse(courseId: string) {
    setSelectedIds(prev =>
      prev.includes(courseId) ? prev.filter(x => x !== courseId) : [...prev, courseId]
    )
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    setSelectedIds(prev => {
      const arr = [...prev]
      ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
      return arr
    })
  }

  function moveDown(idx: number) {
    setSelectedIds(prev => {
      if (idx === prev.length - 1) return prev
      const arr = [...prev]
      ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
      return arr
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setLoading(true)
    setError(null)

    const { error: updateErr } = await supabase
      .from('tracks')
      .update({ title, goal, badge_icon: badgeIcon, visibility })
      .eq('id', id)

    if (updateErr) {
      setError(updateErr.message)
      setLoading(false)
      return
    }

    // Re-insert track_courses
    await supabase.from('track_courses').delete().eq('track_id', id)
    if (selectedIds.length > 0) {
      await supabase.from('track_courses').insert(
        selectedIds.map((courseId, idx) => ({ track_id: id, course_id: courseId, position: idx + 1 }))
      )
    }

    // Re-insert track_departments
    await supabase.from('track_departments').delete().eq('track_id', id)
    if (departmentIds.length > 0) {
      await supabase.from('track_departments').insert(
        departmentIds.map(department_id => ({ track_id: id, department_id }))
      )
    }

    setLoading(false)
    navigate('/admin/trilhas')
  }

  if (tracksLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="material-symbols-rounded text-3xl text-[var(--color-primary)] animate-spin">progress_activity</span>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="material-symbols-rounded text-5xl text-[var(--color-surface-highest)] mb-4">search_off</span>
        <p className="font-['Space_Grotesk'] font-semibold text-[var(--color-on-surface)]">Trilha não encontrada</p>
        <button onClick={() => navigate('/admin/trilhas')}
          className="mt-4 text-sm text-[var(--color-primary)] hover:underline">
          Voltar para Trilhas
        </button>
      </div>
    )
  }

  const sequencedCourses = selectedIds
    .map(sid => allCourses.find(c => c.id === sid))
    .filter(Boolean) as Course[]

  const availableCourses = allCourses.filter(c => !selectedIds.includes(c.id))

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/trilhas')}
          className="p-2 rounded-lg hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] transition-colors">
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <div>
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-[var(--color-on-surface)]">Editar Trilha</h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] mt-0.5">Atualize os dados e a sequência de cursos</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <span className="material-symbols-rounded text-base">error</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* ── Left: Metadata ── */}
          <div className="xl:col-span-5 space-y-6">
            <div className="bg-[var(--color-surface-container)] rounded-xl p-6 space-y-5">
              <h2 className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-2">
                <span className="material-symbols-rounded text-[var(--color-primary)] text-base">account_tree</span>
                Metadados da Trilha
              </h2>

              <TField label="Nome da trilha" required>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Especialista em Hardware" className="input-field" required />
              </TField>

              <TField label="Objetivo">
                <textarea value={goal} onChange={e => setGoal(e.target.value)}
                  placeholder="Descreva o que o colaborador aprenderá ao concluir esta trilha..."
                  rows={3} className="input-field resize-none" />
              </TField>

              <TField label="Visibilidade">
                <div className="flex gap-2">
                  {(['public', 'private'] as const).map(v => (
                    <button key={v} type="button" onClick={() => setVisibility(v)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                        visibility === v
                          ? 'bg-[var(--color-primary)] text-white shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]'
                          : 'bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-high)]'
                      }`}>
                      <span className="material-symbols-rounded text-base">
                        {v === 'public' ? 'public' : 'lock'}
                      </span>
                      {v === 'public' ? 'Pública' : 'Privada'}
                    </button>
                  ))}
                </div>
              </TField>

              <TField label="Ícone do badge">
                <div className="grid grid-cols-4 gap-2">
                  {ICONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setBadgeIcon(icon)}
                      className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                        badgeIcon === icon
                          ? 'bg-[var(--color-primary)] shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary)_40%,transparent)]'
                          : 'bg-[var(--color-surface-highest)] hover:bg-[var(--color-surface-high)]'
                      }`}>
                      <span className={`material-symbols-rounded ${badgeIcon === icon ? 'text-white' : 'text-[var(--color-on-surface-variant)]'}`}>
                        {icon}
                      </span>
                    </button>
                  ))}
                </div>
              </TField>

              <TField label="Departamentos">
                <DepartmentPicker
                  departments={departments}
                  selected={departmentIds}
                  onChange={setDepartmentIds}
                />
              </TField>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => navigate('/admin/trilhas')}
                className="px-6 py-3 rounded-xl bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] text-sm font-medium hover:bg-[var(--color-surface-high)] transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={!title.trim() || loading}
                className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_16px_color-mix(in_srgb,var(--color-primary)_40%,transparent)] flex items-center justify-center gap-2">
                {loading && <span className="material-symbols-rounded text-base animate-spin">progress_activity</span>}
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>

          {/* ── Right: Course Sequencer ── */}
          <div className="xl:col-span-7 space-y-6">

            {/* Sequenced timeline */}
            <div className="bg-[var(--color-surface-container)] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-2">
                  <span className="material-symbols-rounded text-[var(--color-primary)] text-base">format_list_numbered</span>
                  Sequência da Trilha
                </h2>
                {selectedIds.length > 0 && (
                  <span className="text-xs text-[var(--color-on-surface-variant)] bg-[var(--color-surface-highest)] px-2 py-1 rounded-lg">
                    {selectedIds.length} curso{selectedIds.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {sequencedCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-[var(--color-surface-highest)] rounded-xl">
                  <span className="material-symbols-rounded text-4xl text-[var(--color-surface-highest)] mb-3">playlist_add</span>
                  <p className="text-sm text-[var(--color-on-surface-variant)]">Selecione cursos abaixo para montar a sequência</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sequencedCourses.map((course, idx) => (
                    <div key={course.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-highest)] group">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-sm flex-shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      {course.thumbnail && (
                        <img src={course.thumbnail} alt={course.title}
                          className="w-12 h-8 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-on-surface)] truncate">{course.title}</p>
                        <p className="text-xs text-[var(--color-on-surface-variant)] capitalize">{course.category} · {course.duration}</p>
                      </div>
                      <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => moveUp(idx)} disabled={idx === 0}
                          className="p-1 rounded text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-high)] disabled:opacity-30 transition-colors">
                          <span className="material-symbols-rounded text-sm">expand_less</span>
                        </button>
                        <button type="button" onClick={() => moveDown(idx)} disabled={idx === sequencedCourses.length - 1}
                          className="p-1 rounded text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-high)] disabled:opacity-30 transition-colors">
                          <span className="material-symbols-rounded text-sm">expand_more</span>
                        </button>
                      </div>
                      <button type="button" onClick={() => toggleCourse(course.id)}
                        className="p-1.5 rounded-lg text-[var(--color-on-surface-variant)] hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all">
                        <span className="material-symbols-rounded text-base">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available courses */}
            <div className="bg-[var(--color-surface-container)] rounded-xl p-6 space-y-4">
              <h2 className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-2">
                <span className="material-symbols-rounded text-[var(--color-primary)] text-base">add_circle</span>
                Cursos Disponíveis
              </h2>

              {availableCourses.length === 0 ? (
                <p className="text-sm text-[var(--color-on-surface-variant)] text-center py-6">
                  Todos os cursos já foram adicionados à trilha.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableCourses.map(course => (
                    <button key={course.id} type="button" onClick={() => toggleCourse(course.id)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-highest)] hover:bg-[var(--color-surface-high)] hover:shadow-[0_0_0_1px_var(--color-primary)] transition-all text-left group">
                      {course.thumbnail && (
                        <img src={course.thumbnail} alt={course.title}
                          className="w-12 h-9 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-on-surface)] truncate">{course.title}</p>
                        <p className="text-xs text-[var(--color-on-surface-variant)] capitalize">{course.category} · {course.duration}</p>
                      </div>
                      <span className="material-symbols-rounded text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)] transition-colors text-base flex-shrink-0">add</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

function TField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
        {label}{required && <span className="text-[var(--color-primary)] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
