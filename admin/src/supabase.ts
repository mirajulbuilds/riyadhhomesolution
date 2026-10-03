import { createClient } from '@supabase/supabase-js'

/*
 * The admin panel's own Supabase client. The login is kept in this browser's localStorage and
 * renewed automatically, so the owner stays signed in across reloads and closed tabs until they
 * log out. No email links are ever used (no magic links, no password reset), so nothing is read
 * from the URL.
 */

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  url && key
    ? createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storage: window.localStorage,
          storageKey: 'rhs-admin-session',
          detectSessionInUrl: false,
        },
      })
    : null

export type Supabase = NonNullable<typeof supabase>
