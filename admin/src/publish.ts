import type { Supabase } from './supabase'

/*
 * "Publish changes": asks the Edge Function publish-site (with the admin's own login) to start a
 * Cloudflare Pages rebuild. The database keeps three bookkeeping rows in `settings`:
 *   last_admin_edit  time of the last saved change (triggers on every content table + settings)
 *   last_publish     time of the last successful Publish click
 *   publish_lock     { at } of the last attempt: one publish per 60 seconds
 * "Unpublished changes" = last_admin_edit is newer than last_publish. last_publish is the time of
 * the click, so a change saved while a publish is running stays "unpublished".
 */

export const COOLDOWN_SECONDS = 60

export type PublishResult =
  | { kind: 'ok'; publishedAt: string; recorded: boolean }
  | { kind: 'cooldown'; retryAfter: number }
  | { kind: 'not_configured' }
  | { kind: 'refused'; status: number | null }
  | { kind: 'network' }
  | { kind: 'denied' }
  | { kind: 'error' }

/** a is later than b (ISO times from the database; equal milliseconds compare the full text). */
export function isNewer(a: string | null, b: string | null): boolean {
  if (!a) return false
  if (!b) return true
  const ta = Date.parse(a)
  const tb = Date.parse(b)
  if (Number.isNaN(ta) || Number.isNaN(tb)) return a > b
  return ta !== tb ? ta > tb : a > b
}

export interface PublishState {
  lastEdit: string | null
  lastPublish: string | null
  lockAt: string | null
}

export async function loadPublishState(sb: Supabase): Promise<PublishState | null> {
  const { data, error } = await sb.from('settings').select('key, value').in('key', ['last_admin_edit', 'last_publish', 'publish_lock'])
  if (error) return null
  const value = (key: string) => data.find((r) => r.key === key)?.value as unknown
  const text = (v: unknown) => (typeof v === 'string' ? v : null)
  const lock = value('publish_lock') as { at?: unknown } | undefined
  return { lastEdit: text(value('last_admin_edit')), lastPublish: text(value('last_publish')), lockAt: text(lock?.at) }
}

export const hasUnpublished = (s: Pick<PublishState, 'lastEdit' | 'lastPublish'>) => isNewer(s.lastEdit, s.lastPublish)

/** Seconds left before the next publish is allowed (0 = now). */
export function cooldownLeft(lockAt: string | null, now = Date.now()): number {
  if (!lockAt) return 0
  const at = Date.parse(lockAt)
  if (Number.isNaN(at)) return 0
  return Math.max(0, Math.ceil(COOLDOWN_SECONDS - (now - at) / 1000))
}

export async function publishSite(sb: Supabase): Promise<PublishResult> {
  const { data, error } = await sb.functions.invoke<{ published_at?: string; recorded?: boolean }>('publish-site', { method: 'POST' })
  if (!error) return data?.published_at ? { kind: 'ok', publishedAt: data.published_at, recorded: data.recorded !== false } : { kind: 'error' }
  if (error.name !== 'FunctionsHttpError') return { kind: 'network' }
  const res = (error as { context?: Response }).context
  const status = res?.status ?? 0
  const body = ((await res?.json().catch(() => null)) ?? {}) as { code?: string; retry_after?: number; status?: number }
  if (status === 401 || status === 403) return { kind: 'denied' }
  if (body.code === 'cooldown') return { kind: 'cooldown', retryAfter: body.retry_after ?? COOLDOWN_SECONDS }
  if (body.code === 'not_configured') return { kind: 'not_configured' }
  if (body.code === 'refused') return { kind: 'refused', status: body.status ?? null }
  if (body.code === 'network') return { kind: 'network' }
  return { kind: 'error' }
}

/**
 * The admin build writes assets/build.json ({ built_at }) next to the panel. After a publish the
 * Home screen reads it every 20 seconds: once a build newer than the click is being served, the
 * new site is live. No Cloudflare API token is needed (it only reads the panel's own file).
 */
export async function liveBuildTime(): Promise<string | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}assets/build.json`, { cache: 'no-store' })
    if (!res.ok) return null
    const body = (await res.json()) as { built_at?: unknown }
    return typeof body.built_at === 'string' ? body.built_at : null
  } catch {
    return null
  }
}
