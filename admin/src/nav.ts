import { createContext, useContext, useEffect } from 'react'

/*
 * Pages are one URL segment under the panel's base URL (Cloudflare's deep-link rule matches one
 * segment); details go in the query string: <base>services?id=…, <base>services?new=1.
 */

export const PAGES = ['dashboard', 'categories', 'services', 'photos', 'security'] as const
export type Page = (typeof PAGES)[number]
export type Params = Record<string, string>
export interface Route {
  page: Page
  params: Params
}

const BASE = import.meta.env.BASE_URL

export function routeFromUrl(): Route {
  const rest = window.location.pathname.slice(BASE.length).replace(/\/+$/, '')
  const page = (PAGES as readonly string[]).includes(rest) ? (rest as Page) : 'dashboard'
  return { page, params: Object.fromEntries(new URLSearchParams(window.location.search)) }
}

export function urlOf(page: Page, params: Params = {}): string {
  const query = new URLSearchParams(params).toString()
  return (page === 'dashboard' ? BASE : BASE + page) + (query ? `?${query}` : '')
}

export interface Nav {
  route: Route
  /** Opens a page; asks first when a form has unsaved changes. */
  go: (page: Page, params?: Params, options?: { replace?: boolean; force?: boolean }) => void
  /** A form registers "has unsaved changes?" here while it is open. */
  setDirty: (dirty: boolean) => void
}

export const NavContext = createContext<Nav>({ route: { page: 'dashboard', params: {} }, go: () => {}, setDirty: () => {} })
export const useNav = () => useContext(NavContext)

/** Marks the open form as changed: in-panel navigation asks first, and so does closing the tab. */
export function useUnsavedGuard(dirty: boolean) {
  const { setDirty } = useNav()
  useEffect(() => {
    setDirty(dirty)
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => {
      window.removeEventListener('beforeunload', warn)
      setDirty(false)
    }
  }, [dirty, setDirty])
}
