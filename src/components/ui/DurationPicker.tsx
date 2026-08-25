interface DurationPickerProps {
  value: string
  onChange: (value: string) => void
}

const HOURS = Array.from({ length: 13 }, (_, i) => i)       // 0–12h
const MINUTES = [0, 15, 30, 45]

function parse(value: string): { h: number; m: number } {
  const h = parseInt(value.match(/(\d+)h/)?.[1] ?? '0', 10)
  const m = parseInt(value.match(/(\d+)\s*min/)?.[1] ?? '0', 10)
  return { h, m }
}

function format(h: number, m: number): string {
  if (h === 0 && m === 0) return ''
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export function DurationPicker({ value, onChange }: DurationPickerProps) {
  const { h, m } = parse(value)

  function setH(next: number) { onChange(format(next, m)) }
  function setM(next: number) { onChange(format(h, next)) }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 relative">
        <select
          value={h}
          onChange={e => setH(Number(e.target.value))}
          className="input-field appearance-none pr-8 cursor-pointer"
        >
          {HOURS.map(n => (
            <option key={n} value={n}>{n}h</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-[var(--color-on-surface-variant)] text-sm">
          expand_more
        </span>
      </div>

      <div className="flex-1 relative">
        <select
          value={m}
          onChange={e => setM(Number(e.target.value))}
          className="input-field appearance-none pr-8 cursor-pointer"
        >
          {MINUTES.map(n => (
            <option key={n} value={n}>{n}min</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-[var(--color-on-surface-variant)] text-sm">
          expand_more
        </span>
      </div>
    </div>
  )
}
