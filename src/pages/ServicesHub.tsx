import { Check } from 'lucide-react'
import { Link, useLoaderData } from 'react-router-dom'
import { CategoryArt } from '@/components/CategoryIcon'
import { WhatsAppLink } from '@/components/ContactLinks'
import { CtaBand } from '@/components/HomeBlocks'
import { BrandIcon } from '@/components/icons/BrandIcon'
import { PageHeader } from '@/components/PageHeader'
import { Seo } from '@/components/Seo'
import { useSite, useStrings } from '@/components/site-context'
import { ArrowLink } from '@/components/ui/Section'
import type { ServicesHubData } from '@/content/view'
import { localizePath } from '@/i18n/lang'

export function Component() {
  const data = useLoaderData() as ServicesHubData
  const { lang } = useSite()
  const t = useStrings()

  return (
    <>
      <Seo title={t.pages.servicesTitle} description={t.pages.servicesDescription} />
      <PageHeader title={t.pages.servicesTitle} lead={t.category.allCategoriesLead} />

      <div className="container-x space-y-6 py-10 lg:py-14">
        {data.categories.map((c) => {
          const path = localizePath(`/services/${c.slug}`, lang)
          return (
            <section key={c.slug} aria-labelledby={`cat-${c.slug}`} className="card grid gap-6 p-5 sm:p-7 md:grid-cols-[180px_1fr] lg:grid-cols-[220px_1fr]">
              <Link to={path} tabIndex={-1} aria-hidden="true" className="hidden md:block">
                <CategoryArt icon={c.icon} />
              </Link>
              <div>
                <h2 id={`cat-${c.slug}`} className="text-2xl font-bold">
                  <Link to={path} className="hover:text-orange-text">
                    {c.name}
                  </Link>
                </h2>
                <p className="mt-2 max-w-3xl leading-relaxed text-muted">{c.intro}</p>
                <ul className="mt-5 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  {c.services.map((s) => (
                    <li key={s.slug} className="flex items-start gap-2">
                      <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-wa" />
                      {s.hasDetailPage ? (
                        <Link to={localizePath(`/services/${c.slug}/${s.slug}`, lang)} className="font-semibold text-navy hover:underline">
                          {s.name}
                        </Link>
                      ) : (
                        <span className="text-ink">{s.name}</span>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <ArrowLink to={path}>
                    {t.category.servicesIn(c.name)} ({c.services.length})
                  </ArrowLink>
                  <WhatsAppLink
                    message={{ kind: 'service', name: c.name }}
                    location="services_hub"
                    category={c.slug}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-wa hover:underline"
                  >
                    <BrandIcon name="whatsapp" size={16} />
                    {t.cta.whatsappUs}
                  </WhatsAppLink>
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <CtaBand />
    </>
  )
}
