import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/** Allows access for admin and gerente roles. */
export function GerenteRoute() {
  const { userRole, loading } = useAuth()

  if (loading) return null

  return userRole === 'admin' || userRole === 'gerente'
    ? <Outlet />
    : <Navigate to="/dashboard" replace />
}
