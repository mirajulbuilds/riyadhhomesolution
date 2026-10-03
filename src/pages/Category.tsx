import { Check } from 'lucide-react'
import { Link, useLoaderData } from 'react-router-dom'
import { AreaChips } from '@/components/AreasMap'
import { CategoryArt, CategoryIcon } from '@/components/CategoryIcon'
import { CtaButtons } from '@/components/CtaButtons'
import { CtaBand } from '@/components/HomeBlocks'
import { DescribeCard, ServiceCard } from '@/components/ServiceCard'
import { Seo } from '@/components/Seo'
import { useSite, useStrings } from '@/components/site-context'
import { TrustStrip } from '@/components/TrustStrip'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Faq } from '@/components/ui/Faq'
import type { CategoryData } from '@/content/view'
import { localizePath } from '@/i18n/lang'
import { NotFoundView } from './NotFound'

/**
 * Category landing page (brief §6.3) — the Google Ads destination for Plumbing and Electrical.
 * No intro animation, no scroll effects; WhatsApp + Call sit in the first screen on mobile.
 */
export function Component() {
  const data = useLoaderData() as CategoryData | null
  const site = useSite()
  const t = useStrings()
  if (!data) return <NotFoundView />
  const { category, services, others } = data
  const lang = site.lang

  return (
    <>
      <Seo title={category.headline} description={category.metaDescription} />

      <div className="container-x pt-5 pb-10 lg:pt-8">
        <Breadcrumbs
          items={[
            { label: t.nav.home, to: localizePath('/', lang) },
            { label: t.nav.services, to: localizePath('/services', lang) },
            { label: category.name },
          ]}
        />

        {/* Hero card: H1 + first paragraph carry the service + Riyadh/area words. */}
        <section className="card mt-4 grid items-center gap-6 p-5 sm:p-8 md:grid-cols-[1fr_220px] lg:grid-cols-[1fr_280px] lg:gap-10">
          <div>
            <h1 className="text-[1.75rem]/tight font-bold sm:text-4xl/tight">{category.headline}</h1>
            <p className="mt-3 max-w-2xl text-base/relaxed text-muted sm:text-lg/relaxed">{category.metaDescription}</p>
            <CtaButtons message={{ kind: 'service', name: category.name }} location="category_hero" category={category.slug} className="mt-6" />
          </div>
          <CategoryArt icon={category.icon} className="hidden md:grid" />
          <TrustStrip className="md:col-span-2" />
        </section>

        <section aria-labelledby="areas-title" className="mt-6 card p-5 sm:p-8">
          <h2 id="areas-title" className="text-lg font-bold">
            {t.home.areasTitle}
          </h2>
          <div className="mt-4">
            <AreaChips site={site} />
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="about-title" className="card p-5 sm:p-8">
            <h2 id="about-title" className="text-lg font-bold">
              {t.category.about}
            </h2>
            <p className="mt-3 leading-relaxed text-ink">{category.intro}</p>
          </section>
          <section aria-labelledby="covers-title" className="card p-5 sm:p-8">
            <h2 id="covers-title" className="text-lg font-bold">
              {t.category.covers}
            </h2>
            <ul className="mt-3 space-y-2.5">
              {category.covers.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-wa/10">
                    <Check aria-hidden="true" className="size-3.5 text-wa" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section aria-labelledby="services-title" className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="services-title" className="text-2xl font-bold sm:text-3xl">
              {t.category.servicesIn(category.name)}
            </h2>
            <p className="text-sm text-muted">{t.common.servicesCount(services.length)}</p>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.slug}>
                <ServiceCard service={s} icon={category.icon} />
              </li>
            ))}
            <li>
              <DescribeCard categoryName={category.name} categorySlug={category.slug} />
            </li>
          </ul>
        </section>

        {category.faq.length > 0 && (
          <section aria-labelledby="faq-title" className="mt-12">
            <h2 id="faq-title" className="text-2xl font-bold sm:text-3xl">
              {t.common.faqTitle}
            </h2>
            <div className="mt-6">
              <Faq items={category.faq} />
            </div>
          </section>
        )}

        {others.length > 0 && (
          <nav aria-labelledby="other-title" className="mt-12">
            <h2 id="other-title" className="text-lg font-bold">
              {t.category.other}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link to={localizePath(`/services/${o.slug}`, lang)} className="chip hover:border-navy">
                    <CategoryIcon icon={o.icon} className="size-4 text-orange-text" />
                    {o.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      <CtaBand />
    </>
  )
}
