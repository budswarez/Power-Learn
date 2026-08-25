import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabase'

export interface DashboardConfig {
  featured_video_url: string
  featured_video_title: string
  featured_video_description: string
}

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  featured_video_url: '',
  featured_video_title: '',
  featured_video_description: '',
}

/** Converte qualquer URL do YouTube para formato embed */
export function toEmbedUrl(url: string): string {
  if (!url) return ''
  if (url.includes('youtube.com/embed/')) return url

  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?controls=0&rel=0&modestbranding=1`

  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?controls=0&rel=0&modestbranding=1`

  return url
}

export function useDashboardConfig() {
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_DASHBOARD_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('dashboard_config')
        .select('featured_video_url, featured_video_title, featured_video_description')
        .eq('id', 'default')
        .single()

      if (!error && data) {
        setConfig({
          featured_video_url:         data.featured_video_url         ?? DEFAULT_DASHBOARD_CONFIG.featured_video_url,
          featured_video_title:        data.featured_video_title        ?? DEFAULT_DASHBOARD_CONFIG.featured_video_title,
          featured_video_description:  data.featured_video_description  ?? DEFAULT_DASHBOARD_CONFIG.featured_video_description,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  async function save(next: DashboardConfig) {
    const { error } = await supabase
      .from('dashboard_config')
      .upsert({ id: 'default', ...next, updated_at: new Date().toISOString() })
    if (!error) setConfig(next)
    return { error: error?.message ?? null }
  }

  return { config, loading, save }
}
