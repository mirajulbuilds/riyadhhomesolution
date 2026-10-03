/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_GTM_ID?: string
  readonly VITE_SITE_URL?: string
  /** Development only: sample gallery/reviews when no Supabase keys are set. */
  readonly VITE_DEMO_CONTENT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  dataLayer?: Record<string, unknown>[]
}
