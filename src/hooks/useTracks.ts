import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Track } from '@/types'

export function useTracks() {
  const { user } = useAuth()
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [tracksRes, enrollRes, deptRes] = await Promise.all([
        supabase
          .from('tracks')
          .select('id, title, goal, badge_icon, visibility, created_at, track_courses(course_id)')
          .order('created_at', { ascending: true }),
        user
          ? supabase.from('enrollments').select('course_id, progress').eq('user_id', user.id)
          : { data: [] as { course_id: string; progress: number }[], error: null },
        supabase.from('track_departments').select('track_id, department_id'),
      ])

      if (tracksRes.error) {
        console.error('[useTracks] Erro ao buscar trilhas:', tracksRes.error.message)
        setLoading(false)
        return
      }
      if (enrollRes.error) {
        console.error('[useTracks] Erro ao buscar enrollments:', enrollRes.error.message)
      }

      const enrollMap = new Map((enrollRes.data ?? []).map(e => [e.course_id, e.progress]))

      // Build track → department IDs map (fails gracefully if table not accessible)
      const deptMap = new Map<string, string[]>()
      for (const row of (deptRes.data ?? [])) {
        if (!deptMap.has(row.track_id)) deptMap.set(row.track_id, [])
        deptMap.get(row.track_id)!.push(row.department_id)
      }

      setTracks(
        (tracksRes.data as (Track & { track_courses: { course_id: string }[] })[] ?? []).map(t => {
          const courseIds = (t.track_courses ?? []).map(tc => tc.course_id)
          const trackProgress = courseIds.length > 0
            ? Math.round(courseIds.reduce((acc, cid) => acc + (enrollMap.get(cid) ?? 0), 0) / courseIds.length)
            : 0
          return {
            id: t.id,
            title: t.title,
            goal: t.goal,
            badge_icon: t.badge_icon,
            visibility: t.visibility,
            created_at: t.created_at,
            courseIds,
            departmentIds: deptMap.get(t.id) ?? [],
            progress: trackProgress,
          }
        })
      )
      setLoading(false)
    }
    load()
  }, [user])

  return { tracks, setTracks, loading }
}
