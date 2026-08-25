import { useNavigate } from 'react-router-dom'

export function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-8xl font-['Space_Grotesk'] font-bold text-[var(--color-primary)]">404</p>
        <p className="text-[var(--color-on-surface-variant)]">Página não encontrada</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  )
}
