import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabase'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSSO = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-mail ou senha inválidos.')
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decoração geométrica */}
      <div className="absolute top-0 left-0 w-64 h-64 border-l-2 border-t-2 border-[var(--color-surface-highest)] opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 border-r-2 border-b-2 border-[var(--color-surface-highest)] opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 8%, transparent) 0%, transparent 70%)' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[var(--color-surface-container)] rounded-2xl p-8 space-y-7"
          style={{ boxShadow: '0 0 40px color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>

          {/* Brand */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="material-symbols-rounded text-[var(--color-primary)] text-4xl">bolt</span>
              <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[var(--color-on-surface)]">Power Learn</h1>
            </div>
            <p className="text-sm text-[var(--color-on-surface-variant)]">Plataforma de aprendizado corporativo</p>
          </div>

          {/* SSO Google */}
          <button onClick={handleSSO}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[var(--color-surface-highest)] text-[var(--color-on-surface)] font-medium hover:brightness-125 transition-all duration-150 active:scale-[0.98]">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Conta Corporativa
          </button>

          <div className="relative flex items-center">
            <div className="flex-1 border-t border-[var(--color-surface-highest)]" />
            <span className="px-3 text-xs text-[var(--color-on-surface-variant)]">ou</span>
            <div className="flex-1 border-t border-[var(--color-surface-highest)]" />
          </div>

          {/* Email + Senha */}
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <input type="email" placeholder="E-mail corporativo" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3 bg-[var(--color-surface-lowest)] text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)] rounded-lg text-sm outline-none border-b-2 border-transparent focus:border-[var(--color-primary)] transition-colors" />
            <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-3 bg-[var(--color-surface-lowest)] text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)] rounded-lg text-sm outline-none border-b-2 border-transparent focus:border-[var(--color-primary)] transition-colors" />
            {error && (
              <p className="text-xs text-[var(--color-primary)] flex items-center gap-1">
                <span className="material-symbols-rounded text-sm">error</span>{error}
              </p>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors active:scale-[0.98]"
              style={{ boxShadow: '0 0 20px color-mix(in srgb, var(--color-primary) 30%, transparent)' }}>
              {loading ? 'Entrando...' : 'Iniciar Sessão'}
            </button>
          </form>

          <p className="text-center text-xs text-[var(--color-on-surface-variant)]">
            Problemas com acesso?{' '}
            <a href="#" className="text-[var(--color-tertiary)] hover:underline">Contatar Admin</a>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-[var(--color-on-surface-variant)]">
          <span className="flex items-center gap-1">
            <span className="material-symbols-rounded text-sm">lock</span>AES-256
          </span>
          <span>·</span>
          <span>Power Learn © 2026</span>
        </div>
      </div>
    </div>
  )
}
