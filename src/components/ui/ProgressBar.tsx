import { clsx } from 'clsx'

interface ProgressBarProps {
  value: number  // 0-100
  size?: 'sm' | 'md'
  showLabel?: boolean
  className?: string
}

export function ProgressBar({ value, size = 'sm', showLabel = false, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-[var(--color-on-surface-variant)] mb-1">
          <span>Progresso</span>
          <span className="text-[var(--color-primary)] font-semibold">{clamped}%</span>
        </div>
      )}
      <div className={clsx(
        'w-full bg-[var(--color-surface-highest)] rounded-full overflow-hidden',
        size === 'sm' ? 'h-1' : 'h-2',
      )}>
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
          style={{
            width: `${clamped}%`,
            boxShadow: clamped > 0 ? '0 0 8px var(--color-primary)' : 'none',
          }}
        />
      </div>
    </div>
  )
}
