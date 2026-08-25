import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/services/supabase'
import type { AppUser } from '@/types'

export function useUsers() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    supabase
      .from('users')
      .select('id, name, email, department, role, user_role, status, is_admin, created_at')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && !initialized.current) {
          initialized.current = true
          setUsers((data ?? []) as AppUser[])
        }
        setLoading(false)
      })
  }, [])

  return { users, setUsers, loading }
}
