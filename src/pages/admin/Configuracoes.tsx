import { useState, useEffect } from 'react'
import { LabelPicker } from '@/components/ui/LabelPicker'
import { useLabels } from '@/hooks/useLabels'
import { useDashboardConfig, toEmbedUrl } from '@/hooks/useDashboardConfig'
import type { CourseLabel, StoredLabel } from '@/types'

const DEFAULT_LABEL: CourseLabel = { name: '', icon: 'play_circle', color: '#7C3AED' }

type FormMode = null | { type: 'create' } | { type: 'edit'; label: StoredLabel }

export function Configuracoes() {
  const { labels, loading, create, update, remove } = useLabels()
  const { config: dashConfig, loading: dashLoading, save: saveDashConfig } = useDashboardConfig()

  // ── Label form state ──
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [draft, setDraft] = useState<CourseLabel>(DEFAULT_LABEL)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // ── Dashboard video state ──
  const [videoUrl, setVideoUrl]         = useState('')
  const [videoTitle, setVideoTitle]     = useState('')
  const [videoDesc, setVideoDesc]       = useState('')
  const [videoSaving, setVideoSaving]   = useState(false)
  const [videoSaved, setVideoSaved]     = useState(false)
  const [videoError, setVideoError]     = useState<string | null>(null)

  useEffect(() => {
    if (!dashLoading) {
      setVideoUrl(dashConfig.featured_video_url)
      setVideoTitle(dashConfig.featured_video_title)
      setVideoDesc(dashConfig.featured_video_description)
    }
  }, [dashLoading, dashConfig])

  async function handleSaveVideo() {
    if (!videoUrl.trim()) { setVideoError('A URL do vídeo é obrigatória.'); return }
    setVideoSaving(true)
    setVideoError(null)
    const result = await saveDashConfig({
      featured_video_url: videoUrl.trim(),
      featured_video_title: videoTitle.trim(),
      featured_video_description: videoDesc.trim(),
    })
    if (result.error) {
      setVideoError(result.error)
    } else {
      setVideoSaved(true)
      setTimeout(() => setVideoSaved(false), 2500)
    }
    setVideoSaving(false)
  }

  function openCreate() {
    setDraft(DEFAULT_LABEL)
    setSaveError(null)
    setFormMode({ type: 'create' })
  }

  function openEdit(lbl: StoredLabel) {
    setDraft({ name: lbl.name, icon: lbl.icon, color: lbl.color })
    setSaveError(null)
    setFormMode({ type: 'edit', label: lbl })
  }

  function closeForm() {
    setFormMode(null)
    setSaveError(null)
  }

  async function handleSave() {
    if (!draft.name.trim()) { setSaveError('O nome da etiqueta é obrigatório.'); return }
    setSaving(true)
    setSaveError(null)
    if (formMode?.type === 'create') {
      const result = await create(draft)
      if (result.error) setSaveError(result.error)
      else closeForm()
    } else if (formMode?.type === 'edit') {
      const result = await update(formMode.label.id, draft)
      if (result.error) setSaveError(result.error)
      else closeForm()
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Page header */}
      <div>
        <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-[var(--color-on-surface)]">
          Configurações
        </h1>
        <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
          Gerencie as configurações globais do sistema.
        </p>
      </div>

      {/* ── Etiquetas ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-['Space_Grotesk'] font-semibold text-[var(--color-on-surface)]">
              Etiquetas de Conteúdo
            </h2>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
              Crie etiquetas personalizadas para classificar os cursos na biblioteca.
            </p>
          </div>
          {formMode === null && (
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]"
            >
              <span className="material-symbols-rounded text-base">add</span>
              Nova Etiqueta
            </button>
          )}
        </div>

        {/* Form (create or edit) */}
        {formMode !== null && (
          <div className="bg-[var(--color-surface-container)] rounded-xl p-6 space-y-5 border border-[var(--color-primary)]/20">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-2">
                <span className="material-symbols-rounded text-[var(--color-primary)] text-base">
                  {formMode.type === 'create' ? 'add_circle' : 'edit'}
                </span>
                {formMode.type === 'create' ? 'Nova Etiqueta' : 'Editar Etiqueta'}
              </h3>
              <button
                onClick={closeForm}
                className="p-1.5 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-highest)] transition-colors"
              >
                <span className="material-symbols-rounded text-base">close</span>
              </button>
            </div>

            <LabelPicker value={draft} onChange={setDraft} />

            {saveError && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <span className="material-symbols-rounded text-sm">error</span>
                {saveError}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={closeForm}
                className="px-5 py-2 rounded-lg bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] text-sm font-medium hover:bg-[var(--color-surface-high)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !draft.name.trim()}
                className="flex-1 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving
                  ? <span className="material-symbols-rounded text-base animate-spin">progress_activity</span>
                  : <span className="material-symbols-rounded text-base">
                      {formMode.type === 'create' ? 'add' : 'save'}
                    </span>
                }
                {formMode.type === 'create' ? 'Criar Etiqueta' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="bg-[var(--color-surface-container)] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--color-surface-highest)] flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-2">
              <span className="material-symbols-rounded text-[var(--color-primary)] text-base">label</span>
              Etiquetas cadastradas
            </h3>
            <span className="text-xs text-[var(--color-on-surface-variant)] bg-[var(--color-surface-highest)] px-2 py-0.5 rounded-full">
              {labels.length}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="material-symbols-rounded text-2xl text-[var(--color-primary)] animate-spin">progress_activity</span>
            </div>
          ) : labels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-rounded text-5xl text-[var(--color-surface-highest)] mb-3">label</span>
              <p className="text-sm text-[var(--color-on-surface-variant)]">Nenhuma etiqueta cadastrada ainda.</p>
              <p className="text-xs text-[var(--color-on-surface-variant)]/60 mt-1">
                Clique em "Nova Etiqueta" para começar.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-surface-highest)]">
              {labels.map(lbl => (
                <div key={lbl.id} className="flex items-center gap-3 px-5 py-3.5 group">

                  {/* Badge preview */}
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider text-white flex-shrink-0"
                    style={{ backgroundColor: lbl.color }}
                  >
                    <span className="material-symbols-rounded text-[11px]">{lbl.icon}</span>
                    {lbl.name}
                  </span>

                  {/* Spacer */}
                  <span className="flex-1" />

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {confirmDeleteId === lbl.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--color-on-surface-variant)]">Remover?</span>
                        <button
                          onClick={() => { remove(lbl.id); setConfirmDeleteId(null) }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 text-xs font-semibold hover:bg-red-500/25 transition-colors"
                        >
                          <span className="material-symbols-rounded text-sm">delete_forever</span>
                          Confirmar
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1 rounded-lg bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] text-xs font-medium hover:bg-[var(--color-surface-high)] transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => openEdit(lbl)}
                          className="p-1.5 rounded-lg text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                          title="Editar"
                        >
                          <span className="material-symbols-rounded text-base">edit</span>
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(lbl.id)}
                          className="p-1.5 rounded-lg text-[var(--color-on-surface-variant)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remover"
                        >
                          <span className="material-symbols-rounded text-base">delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Vídeo em Destaque ── */}
      <section className="space-y-4">
        <div>
          <h2 className="font-['Space_Grotesk'] font-semibold text-[var(--color-on-surface)]">
            Vídeo em Destaque
          </h2>
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
            Configure o vídeo e o texto exibidos no topo da Dashboard.
          </p>
        </div>

        <div className="bg-[var(--color-surface-container)] rounded-xl p-6 space-y-5">

          {/* URL */}
          <CfgField label="URL do Vídeo (YouTube)" required>
            <input
              value={videoUrl}
              onChange={e => { setVideoUrl(e.target.value); setVideoError(null) }}
              placeholder="https://www.youtube.com/watch?v=..."
              className="input-field"
            />
          </CfgField>

          {/* Preview iframe */}
          {videoUrl && toEmbedUrl(videoUrl) && (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-[var(--color-surface-highest)]">
              <iframe
                key={toEmbedUrl(videoUrl)}
                src={toEmbedUrl(videoUrl)}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                allowFullScreen
                title="Preview do vídeo"
              />
            </div>
          )}

          {/* Title */}
          <CfgField label="Título">
            <input
              value={videoTitle}
              onChange={e => setVideoTitle(e.target.value)}
              placeholder="Ex: Montagem de PC Gamer — Guia Completo"
              className="input-field"
              maxLength={100}
            />
          </CfgField>

          {/* Description */}
          <CfgField label="Descrição">
            <textarea
              value={videoDesc}
              onChange={e => setVideoDesc(e.target.value)}
              placeholder="Breve descrição do vídeo em destaque..."
              rows={2}
              className="input-field resize-none"
              maxLength={200}
            />
          </CfgField>

          {/* Feedback */}
          {videoError && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <span className="material-symbols-rounded text-sm">error</span>
              {videoError}
            </p>
          )}
          {videoSaved && (
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="material-symbols-rounded text-sm">check_circle</span>
              Configurações salvas com sucesso!
            </p>
          )}

          {/* Save */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveVideo}
              disabled={videoSaving || !videoUrl.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]"
            >
              {videoSaving
                ? <span className="material-symbols-rounded text-base animate-spin">progress_activity</span>
                : <span className="material-symbols-rounded text-base">save</span>
              }
              {videoSaving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}

function CfgField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
        {label}{required && <span className="text-[var(--color-primary)] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
