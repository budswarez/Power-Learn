import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/services/supabase'
import type { Department } from '@/types'

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('departments')
      .select('id, name, created_at')
      .order('name', { ascending: true })
    if (data) setDepartments(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function create(name: string): Promise<{ department: Department | null; error: string | null }> {
    const id = `dept-${Date.now()}`
    const { data, error } = await supabase
      .from('departments')
      .insert({ id, name: name.trim() })
      .select()
      .single()
    if (!error && data) {
      setDepartments(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      return { department: data, error: null }
    }
    const msg = error?.code === '23505'
      ? 'Já existe um departamento com esse nome.'
      : (error?.message ?? 'Erro ao criar departamento.')
    return { department: null, error: msg }
  }

  async function rename(id: string, name: string) {
    const { error } = await supabase.from('departments').update({ name: name.trim() }).eq('id', id)
    if (!error) {
      setDepartments(prev => prev.map(d => d.id === id ? { ...d, name: name.trim() } : d)
        .sort((a, b) => a.name.localeCompare(b.name)))
    }
    return !error
  }

  async function remove(id: string) {
    await supabase.from('course_departments').delete().eq('department_id', id)
    await supabase.from('track_departments').delete().eq('department_id', id)
    await supabase.from('departments').delete().eq('id', id)
    setDepartments(prev => prev.filter(d => d.id !== id))
  }

  return { departments, loading, create, rename, remove, refetch: fetch }
}
