/*
 * Rules for ADMIN_PATH, the secret first URL segment the admin panel is served under.
 * The value lives only in .env.local (your computer) and in the Cloudflare Pages environment
 * variables. It is never written to the repository, and anything printed during a build goes
 * through redact() first, because Cloudflare keeps build logs.
 */

const MIN_LENGTH = 10

/** Words a scanner or a curious visitor would try first. */
const GUESSABLE = ['admin', 'login', 'panel', 'dashboard', 'manage', 'wp-', 'riyadh', 'rhs', 'shop', '0500']

export type AdminPathCheck = { ok: true; path: string } | { ok: false; reason: string }

export function checkAdminPath(raw: string | undefined): AdminPathCheck {
  const path = (raw ?? '').trim().replace(/^\/+|\/+$/g, '')
  if (!path) return { ok: false, reason: 'ADMIN_PATH is not set.' }
  if (!/^[A-Za-z0-9_-]+$/.test(path)) {
    return { ok: false, reason: 'ADMIN_PATH may only contain letters, digits, "-" and "_".' }
  }
  if (path.length < MIN_LENGTH) return { ok: false, reason: `ADMIN_PATH is shorter than ${MIN_LENGTH} characters.` }
  const lower = path.toLowerCase()
  if (GUESSABLE.some((word) => lower.includes(word))) {
    return { ok: false, reason: `ADMIN_PATH contains an easy-to-guess word (${GUESSABLE.join(', ')}).` }
  }
  return { ok: true, path }
}

/** Replaces every occurrence of the secret path before text is printed. */
export const redact = (text: string, path: string) => text.split(path).join('<ADMIN_PATH>')
