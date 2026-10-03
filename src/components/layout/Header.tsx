import { Menu, Phone, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { localizePath, otherLang, switchLangPath } from '@/i18n/lang'
import { CallLink, WhatsAppLink } from '../ContactLinks'
import { BrandIcon } from '../icons/BrandIcon'
import { useSite, useStrings } from '../site-context'
import { Logo } from './Logo'
import { HEADER_NAV } from './nav'

export function Header() {
  const { lang, phoneDisplay } = useSite()
  const t = useStrings()
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container-x flex h-16 items-center gap-3 lg:h-[72px]">
        <Link to={localizePath('/', lang)} className="shrink-0 rounded-md" aria-label={t.nav.home}>
          <Logo className="h-11 w-auto lg:h-12" />
        </Link>

        <nav aria-label={t.mainNav} className="ms-6 hidden lg:block">
          <ul className="flex items-center gap-1">
            {HEADER_NAV.map((item) => (
              <li key={item.key}>
                <NavLink
                  to={localizePath(item.path, lang)}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-[15px] font-semibold transition-colors hover:bg-bg hover:text-navy ${
                      isActive ? 'text-navy' : 'text-muted'
                    }`
                  }
                >
                  {t.nav[item.key]}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <Link
            to={switchLangPath(pathname)}
            lang={otherLang(lang)}
            hrefLang={otherLang(lang) === 'ar' ? 'ar-SA' : 'en'}
            aria-label={t.switchLang.aria}
            className="rounded-lg px-2.5 py-2 text-sm font-semibold text-navy hover:bg-bg"
          >
            {t.switchLang.label}
          </Link>

          <CallLink location="header" className="btn btn-outline btn-sm hidden md:inline-flex">
            <Phone aria-hidden="true" className="size-4" />
            <span dir="ltr">{phoneDisplay}</span>
          </CallLink>

          <WhatsAppLink message={{ kind: 'general' }} location="header" className="btn btn-wa btn-sm pulse-ring hidden md:inline-flex">
            <BrandIcon name="whatsapp" size={18} />
            {t.cta.whatsapp}
          </WhatsAppLink>

          <MobileMenu />
        </div>
      </div>
    </header>
  )
}

/**
 * Small-screen menu built on <details>, so it opens even before JavaScript loads.
 * With JavaScript it also closes on navigation, outside click and Escape.
 */
function MobileMenu() {
  const { lang } = useSite()
  const t = useStrings()
  const { pathname } = useLocation()
  const ref = useRef<HTMLDetailsElement>(null)
  const lastPath = useRef(pathname)

  // Close after navigating — but not on first mount, or a menu opened before hydration
  // finished would snap shut.
  useEffect(() => {
    if (lastPath.current === pathname) return
    lastPath.current = pathname
    if (ref.current) ref.current.open = false
  }, [pathname])

  useEffect(() => {
    const details = ref.current
    if (!details) return
    const close = () => (details.open = false)
    const onPointer = (e: PointerEvent) => {
      if (details.open && !details.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (details.open && e.key === 'Escape') {
        close()
        details.querySelector('summary')?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const items = [...HEADER_NAV, { key: 'products' as const, path: '/products' }]

  return (
    <details ref={ref} className="group relative lg:hidden">
      <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-xl text-navy hover:bg-bg">
        <span className="sr-only">{t.menu}</span>
        <Menu aria-hidden="true" className="size-6 group-open:hidden" />
        <X aria-hidden="true" className="hidden size-6 group-open:block" />
      </summary>
      <nav
        aria-label={t.mainNav}
        className="absolute end-0 top-full mt-2 w-[min(86vw,300px)] rounded-2xl border border-line bg-white p-2 shadow-xl"
      >
        <ul>
          {items.map((item) => (
            <li key={item.key}>
              <NavLink
                to={localizePath(item.path, lang)}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-base font-semibold hover:bg-bg ${isActive ? 'bg-bg text-navy' : 'text-ink'}`
                }
              >
                {t.nav[item.key]}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  )
}
