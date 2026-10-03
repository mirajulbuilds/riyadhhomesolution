import type { SupabaseClient } from '@supabase/supabase-js'

/*
 * Browser Supabase client, loaded on demand (review form, client-side refresh of reviews/gallery)
 * so supabase-js never weighs on the first page load. Build-time reads use src/content/server.ts.
 * The admin panel is a separate app with its own client (admin/src/supabase.ts).
 */

let clientPromise: Promise<SupabaseClient> | undefined

export const isSupabaseConfigured = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

export function getSupabase(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured()) {
    return Promise.reject(new Error('Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).'))
  }
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!, {
      auth: {
        // Visitors never sign in.
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    }),
  )
  return clientPromise
}
