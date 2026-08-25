import { useNavigate } from 'react-router-dom'
import { Badge } from './Badge'
import { ProgressBar } from './ProgressBar'
import type { Course, Track } from '@/types'

type Props = {
  item: (Course & { type: 'curso' }) | (Track & { type: 'trilha' })
}

export function CourseCard({ item }: Props) {
  const navigate = useNavigate()
  const progress = item.progress ?? 0
  const thumbnail = item.type === 'curso' ? (item as Course).thumbnail : undefined

  return (
    <div
      onClick={() => navigate(`/leitura/${item.id}`)}
      className="group bg-[var(--color-surface-container)] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-[0_8px_30px_color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[var(--color-surface-highest)] overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-rounded text-[var(--color-on-surface-variant)] text-4xl">account_tree</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-lowest)]/60 to-transparent" />
        <div className="absolute top-2 left-2">
          <Badge type={item.type} label={item.type === 'curso' ? (item as Course).label : undefined} />
        </div>
        {progress === 100 && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
            <span className="material-symbols-rounded text-white text-sm">check</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <h3 className="font-['Space_Grotesk'] font-semibold text-[var(--color-on-surface)] text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {item.title}
        </h3>
        {'duration' in item && item.duration && (
          <p className="text-xs text-[var(--color-on-surface-variant)] flex items-center gap-1">
            <span className="material-symbols-rounded text-sm">schedule</span>
            {item.duration}
          </p>
        )}
        <ProgressBar value={progress} showLabel />
      </div>
    </div>
  )
}
