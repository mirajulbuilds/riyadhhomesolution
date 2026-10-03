import { Outlet, ScrollRestoration, useLoaderData } from 'react-router-dom'
import { Head } from 'vite-react-ssg'
import plexArabic400 from '@/assets/fonts/plex-arabic-400.woff2?url'
import plexArabic700 from '@/assets/fonts/plex-arabic-700.woff2?url'
import type { LayoutData } from '@/content/view'
import { dirOf, type Lang } from '@/i18n/lang'
import { strings } from '@/i18n/strings'
import { SiteProvider } from '../site-context'
import { Footer } from './Footer'
import { Header } from './Header'
import { MobileCtaBar } from './MobileCtaBar'

/** Root of each language tree: <html lang/dir>, header, footer and the mobile CTA bar. */
export function SiteLayout({ lang }: { lang: Lang }) {
  const { site } = useLoaderData() as LayoutData
  const t = strings[lang]

  return (
    <SiteProvider site={site}>
      <Head>
        <html lang={lang} dir={dirOf(lang)} />
        {/* Arabic pages: start the two Plex weights with the HTML (font-display: optional). */}
        {lang === 'ar' && <link rel="preload" href={plexArabic400} as="font" type="font/woff2" crossOrigin="" />}
        {lang === 'ar' && <link rel="preload" href={plexArabic700} as="font" type="font/woff2" crossOrigin="" />}
      </Head>
      <a href="#main" className="skip-link">
        {t.skipToContent}
      </a>
      <div className="flex min-h-dvh flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          <Outlet />
        </main>
        <Footer />
      </div>
      <MobileCtaBar />
      {/* New pages start at the top; back/forward restores the previous position. */}
      <ScrollRestoration />
    </SiteProvider>
  )
}
