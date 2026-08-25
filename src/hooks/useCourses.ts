import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Course, CourseStep } from '@/types'

type DBCourse = Omit<Course, 'steps' | 'departmentIds'> & {
  steps: CourseStep[]
}

export function useCourses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [enrollmentsReady, setEnrollmentsReady] = useState(false)

  useEffect(() => {
    async function load() {
      const [coursesRes, enrollRes, deptRes] = await Promise.all([
        supabase
          .from('courses')
          .select('id, title, description, category, duration, thumbnail, status, label, created_at, steps:course_steps(id, title, content, position)')
          .order('created_at', { ascending: true }),
        user
          ? supabase.from('enrollments').select('course_id, progress').eq('user_id', user.id)
          : { data: [] as { course_id: string; progress: number }[], error: null },
        supabase.from('course_departments').select('course_id, department_id'),
      ])

      if (coursesRes.error) {
        console.error('[useCourses] Erro ao buscar cursos:', coursesRes.error.message)
        setLoading(false)
        setEnrollmentsReady(true)
        return
      }
      if (enrollRes.error) {
        console.error('[useCourses] Erro ao buscar enrollments:', enrollRes.error.message)
      }

      const enrollMap = new Map((enrollRes.data ?? []).map(e => [e.course_id, e.progress]))

      // Build course → department IDs map (fails gracefully if table not accessible)
      const deptMap = new Map<string, string[]>()
      for (const row of (deptRes.data ?? [])) {
        if (!deptMap.has(row.course_id)) deptMap.set(row.course_id, [])
        deptMap.get(row.course_id)!.push(row.department_id)
      }

      setCourses((coursesRes.data as DBCourse[] ?? []).map(c => ({
        ...c,
        progress: enrollMap.get(c.id) ?? 0,
        steps: (c.steps ?? []).sort((a, b) => a.position - b.position),
        departmentIds: deptMap.get(c.id) ?? [],
      })))

      setLoading(false)
      setEnrollmentsReady(true)
    }
    load()
  }, [user])

  return { courses, setCourses, loading, enrollmentsReady }
}
