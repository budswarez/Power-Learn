import { clsx } from 'clsx'
import type { CourseLabel } from '@/types'

interface BadgeProps {
  type: 'curso' | 'trilha'
  label?: CourseLabel
  className?: string
}

export function Badge({ type, label, className }: BadgeProps) {
  if (type === 'trilha') {
    return (
      <span className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
        'bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)]',
        className,
      )}>
        <span className="material-symbols-rounded text-[10px]">account_tree</span>
        Trilha
      </span>
    )
  }

  const icon  = label?.icon  ?? 'play_circle'
  const name  = label?.name  ?? 'Curso'
  const color = label?.color

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white',
        !color && 'bg-[var(--color-primary)]',
        className,
      )}
      style={color ? { backgroundColor: color } : undefined}
    >
      <span className="material-symbols-rounded text-[10px]">{icon}</span>
      {name}
    </span>
  )
}
