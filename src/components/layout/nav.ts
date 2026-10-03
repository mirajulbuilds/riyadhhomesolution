import type { Strings } from '@/i18n/strings'

type NavKey = keyof Strings['nav']

/** Header navigation, in order (brief §6). Paths are language-neutral. */
export const HEADER_NAV: { key: NavKey; path: string }[] = [
  { key: 'home', path: '/' },
  { key: 'services', path: '/services' },
  { key: 'ourWork', path: '/our-work' },
  { key: 'reviews', path: '/reviews' },
  { key: 'about', path: '/about' },
  { key: 'contact', path: '/contact' },
]

/** Footer "Links" column. */
export const FOOTER_NAV: { key: NavKey; path: string }[] = [
  { key: 'ourWork', path: '/our-work' },
  { key: 'products', path: '/products' },
  { key: 'reviews', path: '/reviews' },
  { key: 'about', path: '/about' },
  { key: 'contact', path: '/contact' },
  { key: 'privacy', path: '/privacy' },
]
