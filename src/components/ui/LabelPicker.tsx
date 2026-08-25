import type { CourseLabel } from '@/types'

const ICONS = [
  'play_circle', 'menu_book', 'code', 'build', 'memory', 'school',
  'science', 'psychology', 'terminal', 'wifi', 'security', 'cloud',
  'analytics', 'engineering', 'settings_suggest', 'developer_mode',
  'rocket_launch', 'workspace_premium', 'local_library', 'auto_stories',
  'integration_instructions', 'hub', 'architecture', 'verified', 'rule',
  'fact_check', 'biotech', 'bolt', 'category', 'device_hub',
]

const COLORS = [
  { label: 'Roxo',     value: '#7C3AED' },
  { label: 'Azul',     value: '#2563EB' },
  { label: 'Ciano',    value: '#0891B2' },
  { label: 'Verde',    value: '#16A34A' },
  { label: 'Amarelo',  value: '#CA8A04' },
  { label: 'Laranja',  value: '#EA580C' },
  { label: 'Vermelho', value: '#DC2626' },
  { label: 'Rosa',     value: '#DB2777' },
  { label: 'Cinza',    value: '#4B5563' },
]

interface Props {
  value: CourseLabel
  onChange: (label: CourseLabel) => void
}

export function LabelPicker({ value, onChange }: Props) {
  return (
    <div className="space-y-4">

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
          Nome da Etiqueta
        </label>
        <input
          value={value.name}
          onChange={e => onChange({ ...value, name: e.target.value })}
          placeholder="Ex: Processo, Tutorial, Treinamento..."
          className="input-field"
          maxLength={20}
        />
      </div>

      {/* Icon grid */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
          Ícone
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ICONS.map(icon => (
            <button
              key={icon}
              type="button"
              title={icon}
              onClick={() => onChange({ ...value, icon })}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                value.icon === icon
                  ? 'bg-[var(--color-primary)] text-white shadow-[0_0_8px_color-mix(in_srgb,var(--color-primary)_40%,transparent)]'
                  : 'bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-high)] hover:text-[var(--color-on-surface)]'
              }`}
            >
              <span className="material-symbols-rounded text-sm">{icon}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color swatches */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
          Cor
        </label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              onClick={() => onChange({ ...value, color: c.value })}
              className={`w-7 h-7 rounded-full transition-all ${
                value.color === c.value
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--color-surface-container)] scale-110'
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-xs text-[var(--color-on-surface-variant)]">Preview:</span>
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
