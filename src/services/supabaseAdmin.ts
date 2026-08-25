import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY as string | undefined

/**
 * Admin Supabase client using the service_role key.
 * Required for creating users and changing passwords.
 * Add VITE_SUPABASE_SERVICE_KEY to .env.local (Supabase dashboard → Settings → API → service_role).
 * Note: this key bypasses RLS — only use for admin operations.
 */
export const supabaseAdmin = serviceKey
  ? createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null
