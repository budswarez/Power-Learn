import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { DurationPicker } from '@/components/ui/DurationPicker'
import { DepartmentPicker } from '@/components/ui/DepartmentPicker'
import { StepEditorModal } from '@/components/ui/StepEditorModal'
import { LabelSelect } from '@/components/ui/LabelSelect'
import { useDepartments } from '@/hooks/useDepartments'
import { supabase } from '@/services/supabase'
import type { CourseLabel } from '@/types'

const DEFAULT_LABEL: CourseLabel = { name: 'Curso', icon: 'play_circle', color: '#7C3AED' }

const CATEGORIES = ['hardware', 'software'] as const
type Category = typeof CATEGORIES[number]

interface StepDraft {
  id: string
  title: string
  content: string
}

export function NovoCurso() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('hardware')
  const [duration, setDuration] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [steps, setSteps] = useState<StepDraft[]>([])
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [status, setStatus] = useState<'published' | 'draft'>('published')
  const [departmentIds, setDepartmentIds] = useState<string[]>([])
  const [label, setLabel] = useState<CourseLabel>(DEFAULT_LABEL)
  const { departments } = useDepartments()

  function addStep() {
    const newStep = { id: `s-${Date.now()}`, title: '', content: '' }
    setSteps(prev => [...prev, newStep])
    setEditingStepId(newStep.id)
  }

  function removeStep(id: string) {
    setSteps(prev => prev.filter(s => s.id !== id))
  }

  function saveStep(id: string, title: string, content: string) {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, title, content } : s))
    setEditingStepId(null)
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const courseId = `curso-${Date.now()}`
    const { error: courseErr } = await supabase
      .from('courses')
      .insert({ id: courseId, title, description, category, duration, thumbnail, status, label })

    if (courseErr) {
      setError(courseErr.message)
      setLoading(false)
      return
    }

    const validSteps = steps.filter(s => s.title.trim())
    if (validSteps.length > 0) {
      await supabase.from('course_steps').insert(
        validSteps.map((s, idx) => ({
          id: `s${idx + 1}`,
          course_id: courseId,
          title: s.title.trim(),
          content: s.content.trim() || null,
          position: idx + 1,
        }))
      )
    }

    if (departmentIds.length > 0) {
      await supabase.from('course_departments').insert(
        departmentIds.map(department_id => ({ course_id: courseId, department_id }))
      )
    }

    setLoading(false)
    setSaved(true)
    setTimeout(() => navigate('/admin/base-conhecimento'), 1500)
  }



  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] transition-colors">
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <div>
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-[var(--color-on-surface)]">Novo Conhecimento</h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] mt-0.5">Preencha os dados e adicione as etapas de conteúdo</p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-700/20 border border-green-700/30 text-green-400 text-sm">
          <span className="material-symbols-rounded text-base">check_circle</span>
          Conhecimento criado com sucesso! Redirecionando para a Base de Conhecimento...
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <span className="material-symbols-rounded text-base">error</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* ── Left: Form (col-7) ── */}
          <div className="xl:col-span-7 space-y-6">

            {/* Basic info */}
            <div className="bg-[var(--color-surface-container)] rounded-xl p-6 space-y-5">
              <h2 className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-2">
                <span className="material-symbols-rounded text-[var(--color-primary)] text-base">info</span>
                Informações Básicas
              </h2>

              <CField label="Título do curso" required>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Montagem de PC Gamer" className="input-field" required />
              </CField>

              <CField label="Descrição">
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Descreva os objetivos e o público-alvo do curso..."
                  rows={3} className="input-field resize-none" />
              </CField>

              <div className="grid grid-cols-2 gap-4">
                <CField label="Categoria" required>
                  <div className="flex gap-2">
                    {CATEGORIES.map(c => (
                      <button key={c} type="button" onClick={() => setCategory(c)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                          category === c
                            ? 'bg-[var(--color-primary)] text-white shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]'
                            : 'bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-high)]'
                        }`}>{c}</button>
                    ))}
                  </div>
                </CField>
                <CField label="Duração estimada">
                  <DurationPicker value={duration} onChange={setDuration} />
                </CField>
              </div>

              <CField label="Departamentos">
                <DepartmentPicker
                  departments={departments}
                  selected={departmentIds}
                  onChange={setDepartmentIds}
                />
              </CField>
            </div>

            {/* Label / Badge */}
            <div className="bg-[var(--color-surface-container)] rounded-xl p-6 space-y-4">
              <h2 className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-2">
                <span className="material-symbols-rounded text-[var(--color-primary)] text-base">label</span>
                Etiqueta do Conteúdo
              </h2>
              <LabelSelect value={label} onChange={setLabel} />
            </div>

            {/* Thumbnail */}
            <div className="bg-[var(--color-surface-container)] rounded-xl p-6 space-y-4">
              <h2 className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-2">
                <span className="material-symbols-rounded text-[var(--color-primary)] text-base">image</span>
                Imagem de Capa
              </h2>
              <CField label="URL da imagem">
                <input value={thumbnail} onChange={e => setThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/..." className="input-field" />
              </CField>
              {/* Upload zone (visual only) */}
              <div className="border-2 border-dashed border-[var(--color-surface-highest)] rounded-xl p-8 flex flex-col items-center gap-3 text-center hover:border-[var(--color-primary)]/50 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-highest)] flex items-center justify-center group-hover:bg-[var(--color-primary)]/15 transition-colors">
                  <span className="material-symbols-rounded text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)] transition-colors">upload_file</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-on-surface)]">Arraste uma imagem ou clique</p>
                  <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">PNG, JPG, WEBP — máx 4 MB</p>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="bg-[var(--color-surface-container)] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-2">
                  <span className="material-symbols-rounded text-[var(--color-primary)] text-base">format_list_numbered</span>
                  Etapas do Curso
                </h2>
                <button type="button" onClick={addStep}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] text-xs font-medium hover:bg-[var(--color-primary)] hover:text-white transition-all">
                  <span className="material-symbols-rounded text-sm">add</span>
                  Adicionar Etapa
                </button>
              </div>

              {steps.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-[var(--color-on-surface-variant)]">
                  <span className="material-symbols-rounded text-3xl">format_list_numbered</span>
                  <p className="text-sm">Nenhuma etapa ainda. Clique em "Adicionar Etapa" para começar.</p>
                </div>
              )}
              <div className="space-y-2">
                {steps.map((step, idx) => (
                  <div key={step.id} className="flex gap-3 group">
                    <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-2">
                      <span className="w-7 h-7 rounded-lg bg-[var(--color-surface-highest)] flex items-center justify-center text-xs font-bold text-[var(--color-on-surface-variant)]">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      {idx < steps.length - 1 && (
                        <div className="w-px flex-1 bg-[var(--color-surface-highest)] min-h-[1rem]" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingStepId(step.id)}
                      className="flex-1 text-left p-3 rounded-lg bg-[var(--color-surface-highest)] hover:bg-[var(--color-surface-high)] transition-colors pb-4"
                    >
                      {step.title
                        ? <p className="text-sm font-medium text-[var(--color-on-surface)]">{step.title}</p>
                        : <p className="text-sm text-[var(--color-on-surface-variant)] italic">Clique para editar a etapa...</p>
                      }
                    </button>
                    {steps.length > 1 && (
                      <button type="button" onClick={() => removeStep(step.id)}
                        className="p-1.5 rounded-lg text-[var(--color-on-surface-variant)] hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all self-start mt-2">
                        <span className="material-symbols-rounded text-base">close</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] text-sm font-medium hover:bg-[var(--color-surface-high)] transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={loading} onClick={() => setStatus('draft')}
                className="px-6 py-3 rounded-xl bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] text-sm font-medium hover:bg-[var(--color-surface-high)] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading && status === 'draft' && <span className="material-symbols-rounded text-base animate-spin">progress_activity</span>}
                <span className="material-symbols-rounded text-base">draft</span>
                Rascunho
              </button>
              <button type="submit" disabled={loading} onClick={() => setStatus('published')}
                className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_16px_color-mix(in_srgb,var(--color-primary)_40%,transparent)] flex items-center justify-center gap-2">
                {loading && status === 'published' && <span className="material-symbols-rounded text-base animate-spin">progress_activity</span>}
                <span className="material-symbols-rounded text-base">publish</span>
                {loading && status === 'published' ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>

          {/* ── Right: Live Preview (col-5) ── */}
          <div className="xl:col-span-5">
            <div className="sticky top-6 space-y-4">
              <p className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-2">
                <span className="material-symbols-rounded text-[var(--color-primary)] text-base">preview</span>
                Pré-visualização
              </p>

              {/* CourseCard preview */}
              <div className="bg-[var(--color-surface-container)] rounded-xl overflow-hidden shadow-[0_8px_30px_color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
                <div className="relative aspect-video bg-[var(--color-surface-highest)] overflow-hidden">
                  {thumbnail ? (
                    <img src={thumbnail} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-rounded text-[var(--color-on-surface-variant)] text-5xl">image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-lowest)]/60 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <Badge type="curso" label={label} />
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="font-['Space_Grotesk'] font-semibold text-[var(--color-on-surface)] text-sm leading-snug line-clamp-2">
                    {title || <span className="text-[var(--color-on-surface-variant)]">Título do curso...</span>}
                  </h3>
                  {duration && (
                    <p className="text-xs text-[var(--color-on-surface-variant)] flex items-center gap-1">
                      <span className="material-symbols-rounded text-sm">schedule</span>{duration}
                    </p>
                  )}
                </div>
              </div>

              {/* Steps summary */}
              {steps.some(s => s.title.trim()) && (
                <div className="bg-[var(--color-surface-container)] rounded-xl p-4 space-y-2">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-3">
                    {steps.filter(s => s.title.trim()).length} etapa{steps.filter(s => s.title.trim()).length !== 1 ? 's' : ''}
                  </p>
                  {steps.filter(s => s.title.trim()).map((step, idx) => (
                    <div key={step.id} className="flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)]">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-surface-highest)] flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      {step.title}
                    </div>
                  ))}
                </div>
              )}

              {/* Category badge preview */}
              <div className="bg-[var(--color-surface-container)] rounded-xl p-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  category === 'hardware' ? 'bg-orange-500/15' : 'bg-blue-500/15'
                }`}>
                  <span className={`material-symbols-rounded text-base ${
                    category === 'hardware' ? 'text-orange-400' : 'text-blue-400'
                  }`}>{category === 'hardware' ? 'memory' : 'code'}</span>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-on-surface-variant)]">Categoria</p>
                  <p className="text-sm font-semibold text-[var(--color-on-surface)] capitalize">{category}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {editingStepId && (() => {
        const step = steps.find(s => s.id === editingStepId)!
        const idx = steps.findIndex(s => s.id === editingStepId)
        return (
          <StepEditorModal
            stepIndex={idx}
            initialTitle={step.title}
            initialContent={step.content}
            onSave={(title, content) => saveStep(editingStepId, title, content)}
            onClose={() => setEditingStepId(null)}
          />
        )
      })()}
    </div>
  )
}

function CField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
        {label}{required && <span className="text-[var(--color-primary)] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
