/*
 * Lead source: remember how the visitor arrived (Google Ads click IDs / UTM tags) for the
 * whole browser session, so every WhatsApp message can say whether the lead came from an ad.
 */

const STORAGE_KEY = 'rhs_lead_source'

export const LEAD_PARAMS = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign'] as const
const CLICK_IDS = ['gclid', 'gbraid', 'wbraid'] as const

export type LeadParams = Partial<Record<(typeof LEAD_PARAMS)[number], string>>

export type LeadTag = '(WEB)' | '(WEB-AD)'

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    return null // storage blocked (privacy mode, in-app browsers)
  }
}

/**
 * Call once per page load, before the app renders. A landing URL with tracking params
 * replaces what was stored; a URL without them keeps the earlier landing's values.
 */
export function captureLeadParams(search: string = typeof window === 'undefined' ? '' : window.location.search) {
  const query = new URLSearchParams(search)
  const found: LeadParams = {}
  for (const name of LEAD_PARAMS) {
    const value = query.get(name)?.trim()
    if (value) found[name] = value.slice(0, 200)
  }
  if (Object.keys(found).length === 0) return
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify(found))
  } catch {
    // quota / blocked storage: the tag just falls back to (WEB)
  }
}

export function getLeadParams(): LeadParams {
  try {
    const raw = storage()?.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? (parsed as LeadParams) : {}
  } catch {
    return {}
  }
}

/** True when the visit came from a paid click: any Google click ID, or utm_medium=cpc. */
export function isAdVisit(params: LeadParams = getLeadParams()): boolean {
  return CLICK_IDS.some((id) => Boolean(params[id])) || params.utm_medium?.toLowerCase() === 'cpc'
}

export function getLeadTag(params: LeadParams = getLeadParams()): LeadTag {
  return isAdVisit(params) ? '(WEB-AD)' : '(WEB)'
}
