import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'
import type { UserRole } from '@/types'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  userRole: UserRole
  userDepartment: string
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole>('usuario')
  const [userDepartment, setUserDepartment] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUserProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUserProfile(session.user.id)
      else { setUserRole('usuario'); setUserDepartment(''); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUserProfile(userId: string) {
    try {
      const { data } = await supabase
        .from('users')
        .select('user_role, is_admin, department')
        .eq('id', userId)
        .single()
      const role: UserRole = data?.user_role ?? (data?.is_admin ? 'admin' : 'usuario')
      setUserRole(role)
      setUserDepartment(data?.department ?? '')
    } catch {
      setUserRole('usuario')
      setUserDepartment('')
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin: userRole === 'admin', userRole, userDepartment, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
