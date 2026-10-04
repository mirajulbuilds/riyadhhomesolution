import { isAuthRetryableFetchError, type AuthError, type Factor } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Strings } from './i18n'
import type { Supabase } from './supabase'

/*
 * Sign-in state machine: password → (admins table check) → authenticator code → panel.
 * The database enforces the same rules (private.is_admin() requires aal2), so this is the
 * friendly front door, not the lock.
 */

export type AuthState =
  | { kind: 'loading' }
  | { kind: 'offline' }
  | { kind: 'signed-out'; notice?: 'notAdmin' }
  | { kind: 'enroll' }
  | { kind: 'challenge'; factors: Factor[] }
  | { kind: 'ready'; email: string }

/** Works out which sign-in step to show. Exported so the flow can be tested against Supabase. */
export async function evaluate(sb: Supabase): Promise<AuthState> {
  const { data, error } = await sb.auth.getSession()
  const session = data.session
  if (!session) return error && isAuthRetryableFetchError(error) ? { kind: 'offline' } : { kind: 'signed-out' }

  // Readable with the password alone (a user only ever sees their own row), so a non-admin is
  // turned away before any authenticator setup. Any error keeps the session: never sign out
  // because of a bad connection.
  const admin = await sb.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
  if (admin.error) return { kind: 'offline' }
  if (!admin.data) {
    await sb.auth.signOut({ scope: 'local' })
    return { kind: 'signed-out', notice: 'notAdmin' }
  }

  const level = await sb.auth.mfa.getAuthenticatorAssuranceLevel()
  if (level.error) return { kind: 'offline' }
  if (level.data.currentLevel === 'aal2') return { kind: 'ready', email: session.user.email ?? '' }

  const factors = await sb.auth.mfa.listFactors()
  if (factors.error) return { kind: 'offline' }
  return factors.data.totp.length ? { kind: 'challenge', factors: factors.data.totp } : { kind: 'enroll' }
}

export function useAuth(sb: Supabase) {
  const [state, setState] = useState<AuthState>({ kind: 'loading' })
  const run = useRef(0)

  const recheck = useCallback(async () => {
    const id = ++run.current
    const next = await evaluate(sb)
    if (id === run.current) setState(next)
  }, [sb])

  useEffect(() => {
    void recheck()
    const { data } = sb.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        run.current++
        setState((s) => (s.kind === 'signed-out' ? s : { kind: 'signed-out' }))
      } else if (event === 'TOKEN_REFRESHED') {
        // Supabase advises against awaiting auth calls inside this callback.
        setTimeout(async () => {
          const level = await sb.auth.mfa.getAuthenticatorAssuranceLevel()
          if (level.data && level.data.currentLevel !== 'aal2') void recheck()
        })
      }
    })
    return () => data.subscription.unsubscribe()
  }, [sb, recheck])

  // Back on the tab after a while: renew the login now rather than on the first click.
  useEffect(() => {
    const onVisible = async () => {
      if (document.visibilityState !== 'visible') return
      const { data } = await sb.auth.getSession()
      const expiresAt = (data.session?.expires_at ?? 0) * 1000
      if (!data.session || expiresAt - Date.now() >= 10 * 60_000) return
      const { error } = await sb.auth.refreshSession()
      // Revoked ("Log out everywhere" on another device): leave now, not when the token runs out.
      // A bad connection is retryable and never signs out.
      if (error && !isAuthRetryableFetchError(error)) await sb.auth.signOut({ scope: 'local' })
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [sb])

  // Ask the browser not to clear this site's storage (and with it the login) when space runs low.
  useEffect(() => {
    if (state.kind === 'ready') void navigator.storage?.persist?.().catch(() => {})
  }, [state.kind])

  return { state, recheck }
}

/** A friendly message for a failed password or code check. */
export function authMessage(error: AuthError, t: Strings, wrong: string): string {
  if (isAuthRetryableFetchError(error)) return t.offline
  if (error.status === 429) return t.tooMany
  if (['invalid_credentials', 'mfa_verification_failed', 'mfa_challenge_expired'].includes(error.code ?? '')) return wrong
  return t.somethingWrong
}

/** After 5 failed tries in a row, each further try waits 30 seconds (the server has its own limits). */
export function useTryLimit() {
  const [failures, setFailures] = useState(0)
  const [until, setUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (until <= Date.now()) return
    const timer = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(timer)
  }, [until])

  return {
    wait: Math.max(0, Math.ceil((until - now) / 1000)),
    failed() {
      const count = failures + 1
      setFailures(count)
      if (count >= 5) {
        setUntil(Date.now() + 30_000)
        setNow(Date.now())
      }
    },
    passed() {
      setFailures(0)
      setUntil(0)
    },
  }
}
