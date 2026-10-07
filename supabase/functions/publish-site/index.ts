// Deno entry point of the publish-site Edge Function; the logic (and its rules) is in handler.ts.
import { createClient } from 'npm:@supabase/supabase-js@2.117.2'
import { handle } from './handler.ts'

Deno.serve((req) =>
  handle(req, {
    supabaseUrl: Deno.env.get('SUPABASE_URL') ?? '',
    anonKey: Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    hookUrl: Deno.env.get('CF_DEPLOY_HOOK_URL') ?? '',
    createClient,
    fetch: (url, init) => fetch(url, init),
    log: (message) => console.log(message),
  }),
)
