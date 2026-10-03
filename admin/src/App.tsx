import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react'
import { useAuth } from './auth'
import { applyLang, initialLang, LangContext, strings, useT, type Lang } from './i18n'
import { Challenge } from './screens/Challenge'
import { EnrollFirst } from './screens/Enroll'
import { Login } from './screens/Login'
import { Security } from './screens/Security'
import { supabase, type Supabase } from './supabase'
import { AuthPage, Button, Card, LangToggle, Notice } from './ui'

/*
 * Pages live under the panel's base URL (import.meta.env.BASE_URL), e.g. <base>security.
 * Cloudflare serves index.html for any one-segment deep link (rule written by admin/build.ts).
 */

const PAGES = ['dashboard', 'security'] as const
type Page = (typeof PAGES)[number]
const BASE = import.meta.env.BASE_URL

function pageFromUrl(): Page {
  const rest = window.location.pathname.slice(BASE.length).replace(/\/+$/, '')
  return (PAGES as readonly string[]).includes(rest) ? (rest as Page) : 'dashboard'
}
const pageUrl = (page: Page) => (page === 'dashboard' ? BASE : BASE + page)

export function App() {
  const [lang, setLang] = useState<Lang>(initialLang)
  useEffect(() => applyLang(lang), [lang])
  const value = useMemo(() => ({ lang, t: strings[lang], toggle: () => setLang((l) => (l === 'en' ? 'ar' : 'en')) }), [lang])

  return <LangContext.Provider value={value}>{supabase ? <Gate sb={supabase} /> : <NotConfigured />}</LangContext.Provider>
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
  const [page, setPage] = useState<Page>(pageFromUrl)

  useEffect(() => {
    const onPop = () => setPage(pageFromUrl())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const go = (next: Page) => (e: MouseEvent) => {
    e.preventDefault()
    if (next !== page) window.history.pushState(null, '', pageUrl(next))
    setPage(next)
    window.scrollTo(0, 0)
  }

  return (
    <Shell sb={sb} page={page} go={go}>
      {page === 'security' ? <Security sb={sb} email={email} onLevelChange={onLevelChange} /> : <Dashboard />}
    </Shell>
  )
}

function Shell({
  sb,
  page,
  go,
  children,
}: {
  sb: Supabase
  page: Page
  go: (page: Page) => (e: MouseEvent) => void
  children: ReactNode
}) {
  const { t } = useT()
  const label: Record<Page, string> = { dashboard: t.dashboard, security: t.security }

  return (
    <div className="min-h-dvh">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-1 px-4 py-2">
          <span className="me-auto text-lg font-bold">{t.appName}</span>
          <LangToggle className="hover:bg-white/10" />
          <button
            type="button"
            onClick={() => void sb.auth.signOut({ scope: 'local' })}
            className="min-h-12 rounded-xl px-4 font-semibold hover:bg-white/10"
          >
            {t.logOut}
          </button>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-2 px-4 pb-3">
          {PAGES.map((p) => (
            <a
              key={p}
              href={pageUrl(p)}
              onClick={go(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`flex min-h-12 items-center rounded-xl px-5 font-semibold ${p === page ? 'bg-white text-navy' : 'hover:bg-white/10'}`}
            >
              {label[p]}
            </a>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  )
}

function Dashboard() {
  const { t } = useT()
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-navy">{t.dashboard}</h1>
      <Card title={`✓ ${t.step1Done}`}>
        <p className="text-muted">{t.step1Text}</p>
      </Card>
    </div>
  )
}
