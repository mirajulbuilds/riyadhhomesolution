import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useMatches } from 'react-router-dom'
import type { Site } from '@/content/types'
import { strings } from '@/i18n/strings'
import { getLeadTag, type LeadTag } from '@/lib/lead-source'

const SiteContext = createContext<Site | null>(null)
const LeadTagContext = createContext<LeadTag>('(WEB)')

export function SiteProvider({ site, children }: { site: Site; children: ReactNode }) {
  // The prerendered HTML always says (WEB): sessionStorage only exists in the browser, so the
  // real tag is read after hydration. Only the WhatsApp links re-render when it changes.
  const [tag, setTag] = useState<LeadTag>('(WEB)')
  useEffect(() => setTag(getLeadTag()), [])

  return (
    <SiteContext.Provider value={site}>
      <LeadTagContext.Provider value={tag}>{children}</LeadTagContext.Provider>
    </SiteContext.Provider>
  )
}

/** Business settings + language for the current page. */
export function useSite(): Site {
  const site = useContext(SiteContext)
  if (!site) throw new Error('useSite() must be used inside <SiteProvider>')
  return site
}

/** UI strings for the current language. */
export function useStrings() {
  return strings[useSite().lang]
}

export function useLeadTag(): LeadTag {
  return useContext(LeadTagContext)
}

export interface RouteHandle {
  pageType: string
}

/** The deepest route's page type ("home", "category", ...), for analytics. */
export function usePageType(): string {
  const matches = useMatches()
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i]?.handle as Partial<RouteHandle> | undefined
    if (handle?.pageType) return handle.pageType
  }
  return 'other'
}
