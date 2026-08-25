import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-surface)]">
        <span className="material-symbols-rounded animate-spin text-[var(--color-primary)] text-4xl">
          progress_activity
        </span>
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}
