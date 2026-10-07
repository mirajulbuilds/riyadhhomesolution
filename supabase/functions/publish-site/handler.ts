/*
 * publish-site: the admin panel's "Publish changes" button. Calls the Cloudflare Pages deploy hook
 * (secret CF_DEPLOY_HOOK_URL) so Cloudflare rebuilds the static site from the database.
 *
 * Only a signed-in admin gets through, with the same rule as the database (private.is_admin()):
 *   1. a valid access token (signature + expiry checked by supabase-js getClaims) of a user,
 *   2. confirmed with the authenticator code (claim aal = aal2) and carrying a session_id,
 *   3. the database then checks the admins table AND that the session still exists (logged-out
 *      devices are refused at once): publish_claim() runs with the caller's own token.
 * Everything else gets 401/403 with no details. The hook URL is never sent back or logged.
 *
 * Pure module (no Deno APIs) so the test scripts can run it in Node with a mock hook; index.ts is
 * the Deno entry point. Deployed with verify_jwt = false because this file verifies the token itself.
 */

export interface Deps {
  supabaseUrl: string
  /** The project's public key: only used together with the caller's own token. */
  anonKey: string
  /** CF_DEPLOY_HOOK_URL; empty when the secret is not set. */
  hookUrl: string
  createClient: (url: string, key: string, options: object) => unknown
  fetch: (url: string, init: { method: string; signal?: AbortSignal }) => Promise<{ ok: boolean; status: number }>
  log?: (message: string) => void
}

interface DbError {
  code?: string
  message: string
}
interface Client {
  auth: { getClaims: (jwt: string) => Promise<{ data: { claims: Record<string, unknown> } | null; error: unknown }> }
  rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<{ data: unknown; error: DbError | null }>
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

/** The secret must be an https URL (Cloudflare: https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/…). */
export function isHookUrl(value: string): boolean {
  try {
    return new URL(value.trim()).protocol === 'https:'
  } catch {
    return false
  }
}

export async function handle(req: Request, deps: Deps): Promise<Response> {
  const log = deps.log ?? (() => {})
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
  if (req.method !== 'POST') return json(405, { code: 'method' })

  const token = /^Bearer\s+(\S+)$/i.exec(req.headers.get('Authorization') ?? '')?.[1]
  if (!token || !deps.supabaseUrl || !deps.anonKey) return json(401, { code: 'unauthorized' })

  const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  const verifier = deps.createClient(deps.supabaseUrl, deps.anonKey, options) as Client
  let claims: Record<string, unknown> | undefined
  try {
    const result = await verifier.auth.getClaims(token)
    if (!result.error) claims = result.data?.claims
  } catch {
    claims = undefined
  }
  // Not a signed-in user (no token, a forged or expired one, the anon key, a service key).
  if (!claims || claims.role !== 'authenticated' || typeof claims.sub !== 'string') return json(401, { code: 'unauthorized' })
  // A user, but not confirmed with the authenticator code, or a token without a session.
  if (claims.aal !== 'aal2' || typeof claims.session_id !== 'string' || !claims.session_id) return json(403, { code: 'forbidden' })

  // Everything below runs as the caller: the database checks admins table + aal2 + live session.
  const db = deps.createClient(deps.supabaseUrl, deps.anonKey, {
    ...options,
    global: { headers: { Authorization: `Bearer ${token}` } },
  }) as Client

  const claim = await db.rpc('publish_claim')
  if (claim.error) {
    if (claim.error.code === '42501') return json(403, { code: 'forbidden' })
    log(`publish-site: claim failed (${claim.error.code ?? 'error'})`)
    return json(500, { code: 'server' })
  }
  const slot = claim.data as { ok: boolean; at?: string; retry_after?: number }
  if (!slot.ok || !slot.at) return json(429, { code: 'cooldown', retry_after: slot.retry_after ?? 60 })
  const at = slot.at
  const release = () => db.rpc('publish_finish', { claimed_at: at, succeeded: false })

  if (!isHookUrl(deps.hookUrl)) {
    await release()
    log('publish-site: not configured')
    return json(503, { code: 'not_configured' })
  }

  let status: number
  try {
    const res = await deps.fetch(deps.hookUrl.trim(), { method: 'POST', signal: AbortSignal.timeout(15000) })
    status = res.status
    if (!res.ok) {
      await release()
      log(`publish-site: hook answered ${status}`)
      return json(502, { code: 'refused', status })
    }
  } catch {
    await release()
    log('publish-site: hook unreachable')
    return json(502, { code: 'network' })
  }

  const done = await db.rpc('publish_finish', { claimed_at: at, succeeded: true })
  log(`publish-site: started (hook ${status})${done.error ? ', time not recorded' : ''}`)
  return json(200, { ok: true, published_at: at, recorded: !done.error })
}
