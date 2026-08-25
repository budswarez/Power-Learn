import { useState } from 'react'
import { RichEditor } from './RichEditor'

interface StepEditorModalProps {
  stepIndex: number
  initialTitle: string
  initialContent: string
  onSave: (title: string, content: string) => void
  onClose: () => void
}

export function StepEditorModal({ stepIndex, initialTitle, initialContent, onSave, onClose }: StepEditorModalProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)

  function handleSave() {
    if (!title.trim()) return
    onSave(title.trim(), content)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-surface-container)] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-surface-highest)]">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-sm flex-shrink-0">
              {String(stepIndex + 1).padStart(2, '0')}
            </span>
            <div>
              <p className="font-['Space_Grotesk'] font-bold text-[var(--color-on-surface)]">Editar Etapa</p>
              <p className="text-xs text-[var(--color-on-surface-variant)]">Título e conteúdo rico</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] transition-colors">
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
              Título da Etapa <span className="text-[var(--color-primary)]">*</span>
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Instalação da CPU"
              className="input-field w-full text-base font-medium"
              autoFocus
            />
          </div>

          {/* Rich content */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
              Conteúdo
            </label>
            <RichEditor
              content={content}
              onChange={setContent}
              placeholder="Escreva o conteúdo desta etapa — use formatação, imagens, links e vídeos..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-[var(--color-surface-highest)]">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] text-sm font-medium hover:bg-[var(--color-surface-high)] transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={!title.trim()}
            className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_16px_color-mix(in_srgb,var(--color-primary)_40%,transparent)] flex items-center justify-center gap-2">
            <span className="material-symbols-rounded text-base">check</span>
            Salvar Etapa
          </button>
        </div>
      </div>
    </div>
  )
}
