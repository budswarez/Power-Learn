import { Link } from 'react-router-dom'
import { useLabels } from '@/hooks/useLabels'
import type { CourseLabel } from '@/types'

interface Props {
  value: CourseLabel
  onChange: (label: CourseLabel) => void
}

export function LabelSelect({ value, onChange }: Props) {
  const { labels, loading } = useLabels()

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[var(--color-on-surface-variant)] text-sm">
        <span className="material-symbols-rounded text-base animate-spin">progress_activity</span>
        Carregando etiquetas...
      </div>
    )
  }

  if (labels.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--color-surface-highest)] text-sm">
        <span className="material-symbols-rounded text-[var(--color-on-surface-variant)] text-base">label_off</span>
        <span className="text-[var(--color-on-surface-variant)]">
          Nenhuma etiqueta cadastrada.{' '}
          <Link
            to="/admin/configuracoes"
            className="text-[var(--color-primary)] hover:underline"
          >
            Crie em Configurações →
          </Link>
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {labels.map(lbl => {
          const isSelected =
            value.name === lbl.name &&
            value.icon === lbl.icon &&
            value.color === lbl.color
          return (
            <button
              key={lbl.id}
              type="button"
              title={lbl.name}
              onClick={() => onChange({ name: lbl.name, icon: lbl.icon, color: lbl.color })}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider text-white transition-all ${
                isSelected
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--color-surface-container)] scale-105 shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]'
                  : 'opacity-50 hover:opacity-90 hover:scale-105'
              }`}
              style={{ backgroundColor: lbl.color }}
            >
              <span className="material-symbols-rounded text-[11px]">{lbl.icon}</span>
              {lbl.name}
            </button>
          )
        })}
      </div>

      {/* Selected preview */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-on-surface-variant)]">
        <span>Selecionada:</span>
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: value.color }}
        >
          <span className="material-symbols-rounded text-[10px]">{value.icon}</span>
          {value.name || 'Label'}
        </span>
      </div>
    </div>
  )
}
