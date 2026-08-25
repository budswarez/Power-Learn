import type { Department } from '@/types'

interface DepartmentPickerProps {
  departments: Department[]
  selected: string[]
  onChange: (ids: string[]) => void
}

export function DepartmentPicker({ departments, selected, onChange }: DepartmentPickerProps) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }

  if (departments.length === 0) {
    return (
      <p className="text-xs text-[var(--color-on-surface-variant)] italic py-2">
        Nenhum departamento cadastrado. Crie em <strong>Administração → Departamentos</strong>.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {departments.map(dept => {
        const active = selected.includes(dept.id)
        return (
          <button
            key={dept.id}
            type="button"
            onClick={() => toggle(dept.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              active
                ? 'bg-[var(--color-primary)] text-white shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]'
                : 'bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-high)]'
            }`}
          >
            {active && <span className="material-symbols-rounded text-sm">check</span>}
            <span className="material-symbols-rounded text-sm">corporate_fare</span>
            {dept.name}
          </button>
        )
      })}
    </div>
  )
}
