import { ChevronLeft } from 'lucide-react'
import { Link, useLoaderData } from 'react-router-dom'
import { CtaButtons } from '@/components/CtaButtons'
import { Phase2Note } from '@/components/PageHeader'
import { Seo } from '@/components/Seo'
import { useSite, useStrings } from '@/components/site-context'
import { TrustRow } from '@/components/TrustRow'
import type { HomeData } from '@/content/view'
import { localizePath } from '@/i18n/lang'

export function Component() {
  const data = useLoaderData() as HomeData
  const { lang } = useSite()
  const t = useStrings()

  return (
    <>
      <Seo fullTitle={t.pages.homeTitle} description={t.pages.homeDescription} />

      <section className="bg-navy">
        <div className="container-x py-14 lg:py-20">
          <h1 className="max-w-3xl text-3xl/tight font-bold text-white sm:text-4xl/tight lg:text-5xl/tight">
            {t.hero.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg/relaxed text-white/80">{t.hero.sub}</p>
          <CtaButtons location="hero" className="mt-8" />
          <div className="mt-8">
            <TrustRow />
          </div>
        </div>
      </section>

      <section className="container-x py-12" aria-labelledby="home-services">
        <h2 id="home-services" className="text-2xl font-bold">
          {t.nav.services}
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.categories.map((c) => (
            <li key={c.slug}>
              <Link
                to={localizePath(`/services/${c.slug}`, lang)}
                className="card flex h-full items-start justify-between gap-4 p-5 transition-shadow hover:shadow-lg"
              >
                <span>
                  <span className="block text-lg font-semibold text-navy">{c.name}</span>
                  <span className="mt-1 line-clamp-2 block text-sm text-muted">{c.intro}</span>
                </span>
                <ChevronLeft aria-hidden="true" className="mt-1 size-5 shrink-0 text-orange-text ltr:-scale-x-100" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Phase2Note what="hero story scene, why us, how we work, our work, reviews, areas map, FAQ, CTA band" />
    </>
  )
}
