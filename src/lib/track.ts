import type { Lang } from '@/i18n/lang'

/*
 * Analytics events go to the Google Tag Manager dataLayer only — GA4 and Google Ads tags are
 * configured inside GTM (see TRACKING_SETUP.md). Pushing before GTM loads is safe: GTM
 * processes the queued events when it starts.
 */

export type TrackEvent = 'whatsapp_click' | 'call_click' | 'directions_click' | 'review_submit' | 'contact_form_submit'

export interface TrackParams {
  language: Lang
  page_type: string
  /** Where on the page the link sits, e.g. "header", "sticky_bar", "service_card". */
  link_location: string
  category?: string
  service?: string
}

export function track(event: TrackEvent, params: TrackParams) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer ?? []
  // GTM merges dataLayer pushes, so clear optional keys or they leak in from the previous event.
  window.dataLayer.push({ event, category: undefined, service: undefined, ...params })
}
