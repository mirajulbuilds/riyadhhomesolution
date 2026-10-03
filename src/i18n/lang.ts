export type Lang = 'ar' | 'en'

export const LANGS: readonly Lang[] = ['ar', 'en']

/** Arabic is served at the root, English under /en. */
export const DEFAULT_LANG: Lang = 'ar'

export const dirOf = (lang: Lang) => (lang === 'ar' ? 'rtl' : 'ltr')

/** Value for hreflang / og:locale-style tags. */
export const hreflangOf = (lang: Lang) => (lang === 'ar' ? 'ar-SA' : 'en')

export const otherLang = (lang: Lang): Lang => (lang === 'ar' ? 'en' : 'ar')

/** Split a pathname into its language and the language-neutral path ('/services/plumbing'). */
export function parsePath(pathname: string): { lang: Lang; path: string } {
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return { lang: 'en', path: pathname.slice(3) || '/' }
  }
  return { lang: 'ar', path: pathname || '/' }
}

/** '/services/plumbing' + 'en' → '/en/services/plumbing'; '/' + 'en' → '/en'. */
export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (lang === DEFAULT_LANG) return clean
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`
}

/** The same page in the other language. */
export function switchLangPath(pathname: string): string {
  const { lang, path } = parsePath(pathname)
  return localizePath(path, otherLang(lang))
}
