import { Camera, FolderTree, House, Images, Menu, Package, Shield, Star, Wrench, type LucideIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { useAuth } from './auth'
import { applyLang, initialLang, LangContext, strings, useT, type Lang } from './i18n'
import { NavContext, routeFromUrl, urlOf, useNav, type Nav, type Page, type Params, type Route } from './nav'
import { BulkPhotos } from './screens/BulkPhotos'
import { Categories } from './screens/Categories'
import { Challenge } from './screens/Challenge'
import { Dashboard } from './screens/Dashboard'
import { EnrollFirst } from './screens/Enroll'
import { Gallery } from './screens/Gallery'
import { Login } from './screens/Login'
import { More } from './screens/More'
import { Products } from './screens/Products'
import { Reviews } from './screens/Reviews'
import { Security } from './screens/Security'
import { Services } from './screens/Services'
import { supabase, type Supabase } from './supabase'
import { ToastProvider } from './toast'
import { AuthPage, Button, LangToggle, Notice } from './ui'

export function App() {
  const [lang, setLang] = useState<Lang>(initialLang)
  useEffect(() => applyLang(lang), [lang])
  const value = useMemo(() => ({ lang, t: strings[lang], toggle: () => setLang((l) => (l === 'en' ? 'ar' : 'en')) }), [lang])

  return (
    <LangContext.Provider value={value}>
      <ToastProvider>{supabase ? <Gate sb={supabase} /> : <NotConfigured />}</ToastProvider>
    </LangContext.Provider>
  )
}

function NotConfigured() {
  const { t } = useT()
  return (
    <AuthPage title={t.appName}>
      <Notice>{t.notConfigured}</Notice>
    </AuthPage>
  )
}

function Gate({ sb }: { sb: Supabase }) {
  const { t } = useT()
  const { state, recheck } = useAuth(sb)

  switch (state.kind) {
    case 'loading':
      return <AuthPage title={t.appName}>{<p className="text-muted">{t.loading}</p>}</AuthPage>
    case 'offline':
      return (
        <AuthPage title={t.appName}>
          <Notice>{t.offline}</Notice>
          <Button onClick={() => void recheck()}>{t.retry}</Button>
        </AuthPage>
      )
    case 'signed-out':
      return <Login sb={sb} notice={state.notice} onSignedIn={() => void recheck()} />
    case 'enroll':
      return <EnrollFirst sb={sb} onDone={() => void recheck()} />
    case 'challenge':
      return <Challenge sb={sb} factors={state.factors} onVerified={() => void recheck()} />
    case 'ready':
      return <Panel sb={sb} email={state.email} onLevelChange={() => void recheck()} />
  }
}

function Panel({ sb, email, onLevelChange }: { sb: Supabase; email: string; onLevelChange: () => void }) {
  const { t } = useT()
  const [route, setRoute] = useState<Route>(routeFromUrl)
  const dirty = useRef(false)

  useEffect(() => {
    const onPop = () => setRoute(routeFromUrl())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const go = useCallback<Nav['go']>(
    (page: Page, params: Params = {}, options = {}) => {
      if (!options.force && dirty.current && !confirm(t.leaveConfirm)) return
      dirty.current = false
      const url = urlOf(page, params)
      if (options.replace) window.history.replaceState(null, '', url)
      else window.history.pushState(null, '', url)
      setRoute({ page, params })
      window.scrollTo(0, 0)
    },
    [t],
  )
  const setDirty = useCallback((value: boolean) => void (dirty.current = value), [])

  // Pending reviews: re-counted on every page change and after each moderation action.
  const [pending, setPending] = useState(0)
  const refreshPending = useCallback(() => {
    void sb
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setPending(count ?? 0))
  }, [sb])
  useEffect(refreshPending, [refreshPending, route.page])

  const nav = useMemo(() => ({ route, go, setDirty, pending, refreshPending }), [route, go, setDirty, pending, refreshPending])

  const screens: Record<Page, ReactNode> = {
    dashboard: <Dashboard sb={sb} />,
    categories: <Categories sb={sb} />,
    services: <Services sb={sb} />,
    photos: <BulkPhotos sb={sb} />,
    security: <Security sb={sb} email={email} onLevelChange={onLevelChange} />,
    reviews: <Reviews sb={sb} />,
    gallery: <Gallery sb={sb} />,
    products: <Products sb={sb} />,
    more: <More />,
  }

  return (
    <NavContext.Provider value={nav}>
      <Shell sb={sb}>
        {/* Keyed by the full route so each page and each edited item starts fresh. */}
        <div key={route.page + JSON.stringify(route.params)}>{screens[route.page]}</div>
      </Shell>
    </NavContext.Provider>
  )
}

type NavItem = { page: Page; icon: LucideIcon; label: (t: ReturnType<typeof useT>['t']) => string }

/** Every page, in the order of the header links on wide screens (and of the "More" page). */
export const NAV: NavItem[] = [
  { page: 'dashboard', icon: House, label: (t) => t.navHome },
  { page: 'reviews', icon: Star, label: (t) => t.navReviews },
  { page: 'gallery', icon: Camera, label: (t) => t.navGallery },
  { page: 'services', icon: Wrench, label: (t) => t.navServices },
  { page: 'products', icon: Package, label: (t) => t.navProducts },
  { page: 'categories', icon: FolderTree, label: (t) => t.navCategories },
  { page: 'photos', icon: Images, label: (t) => t.navPhotos },
  { page: 'security', icon: Shield, label: (t) => t.navSecurity },
]

/** The phone's bottom bar: the daily pages + "More" for the rest. */
const BOTTOM: NavItem[] = [...NAV.slice(0, 4), { page: 'more', icon: Menu, label: (t) => t.navMore }]
const IN_MORE: Page[] = NAV.slice(4).map((n) => n.page)

/** Small count bubble on the Reviews link. */
function PendingBadge({ count, className = '' }: { count: number; className?: string }) {
  const { t } = useT()
  if (!count) return null
  return (
    <span className={`inline-grid min-w-5 place-items-center rounded-full bg-orange px-1.5 text-xs font-bold leading-5 text-white ${className}`} aria-label={t.pendingBadge(count)}>
      {count}
    </span>
  )
}

/** Header (+ links on wide screens) and a bottom navigation bar on phones. */
function Shell({ sb, children }: { sb: Supabase; children: ReactNode }) {
  const { t } = useT()
  const { route, go, pending } = useNav()
  const open = (page: Page) => (e: MouseEvent) => {
    e.preventDefault()
    go(page)
  }

  return (
    <div className="min-h-dvh pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-navy text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-2">
          <span className="me-auto text-lg font-bold">{t.appName}</span>
          <nav className="me-2 hidden gap-0.5 lg:flex">
            {NAV.map(({ page, label }) => (
              <a
                key={page}
                href={urlOf(page)}
                onClick={open(page)}
                aria-current={page === route.page ? 'page' : undefined}
                className={`flex min-h-12 items-center gap-1.5 rounded-xl px-3 font-semibold ${page === route.page ? 'bg-white text-navy' : 'hover:bg-white/10'}`}
              >
                {label(t)}
                {page === 'reviews' && <PendingBadge count={pending} />}
              </a>
            ))}
          </nav>
          <LangToggle className="hover:bg-white/10" />
          <button type="button" onClick={() => void sb.auth.signOut({ scope: 'local' })} className="min-h-12 rounded-xl px-3 font-semibold hover:bg-white/10">
            {t.logOut}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {BOTTOM.map(({ page, icon: Icon, label }) => {
          const current = page === route.page || (page === 'more' && IN_MORE.includes(route.page))
          return (
            <a
              key={page}
              href={urlOf(page)}
              onClick={open(page)}
              aria-current={current ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${current ? 'text-navy' : 'text-muted'}`}
            >
              <Icon className="size-6" aria-hidden="true" />
              {label(t)}
              {page === 'reviews' && <PendingBadge count={pending} className="absolute top-1 start-[calc(50%+6px)]" />}
            </a>
          )
        })}
      </nav>
    </div>
  )
}
