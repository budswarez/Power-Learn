import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabase'
import type { CourseLabel, StoredLabel } from '@/types'

export function useLabels() {
  const [labels, setLabels] = useState<StoredLabel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('course_labels')
        .select('*')
        .order('created_at', { ascending: true })
      if (!error && data) setLabels(data as StoredLabel[])
      setLoading(false)
    }
    load()
  }, [])

  async function create(label: CourseLabel) {
    const id = `lbl-${Date.now()}`
    const { data, error } = await supabase
      .from('course_labels')
      .insert({ id, ...label })
      .select()
      .single()
    if (!error && data) setLabels(prev => [...prev, data as StoredLabel])
    return { label: error ? null : (data as StoredLabel), error: error?.message ?? null }
  }

  async function update(id: string, label: CourseLabel) {
    const { data, error } = await supabase
      .from('course_labels')
      .update({ name: label.name, icon: label.icon, color: label.color })
      .eq('id', id)
      .select()
      .single()
    if (!error && data) setLabels(prev => prev.map(l => l.id === id ? data as StoredLabel : l))
    return { label: error ? null : (data as StoredLabel), error: error?.message ?? null }
  }

  async function remove(id: string) {
    const { error } = await supabase.from('course_labels').delete().eq('id', id)
    if (!error) setLabels(prev => prev.filter(l => l.id !== id))
    return { error: error?.message ?? null }
  }

  return { labels, loading, create, update, remove }
}
