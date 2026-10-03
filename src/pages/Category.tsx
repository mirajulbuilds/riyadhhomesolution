import { Phone } from 'lucide-react'
import { Link, useLoaderData } from 'react-router-dom'
import { CallLink, WhatsAppLink } from '@/components/ContactLinks'
import { CtaButtons } from '@/components/CtaButtons'
import { BrandIcon } from '@/components/icons/BrandIcon'
import { PageHeader, Phase2Note } from '@/components/PageHeader'
import { Seo } from '@/components/Seo'
import { useSite, useStrings } from '@/components/site-context'
import type { CategoryData } from '@/content/view'
import { localizePath } from '@/i18n/lang'
import { NotFoundView } from './NotFound'

export function Component() {
  const data = useLoaderData() as CategoryData | null
  const { lang } = useSite()
  const t = useStrings()
  if (!data) return <NotFoundView />
  const { category, services } = data

  return (
    <>
      <Seo title={category.headline} description={category.metaDescription} />
      <PageHeader title={category.headline} lead={category.intro}>
        <CtaButtons location="category_hero" category={category.slug} className="mt-6" />
      </PageHeader>

      <div className="container-x py-10">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.slug} className="card flex flex-col p-5">
              <h2 className="text-base font-semibold">{s.name}</h2>
              <p className="mt-1 flex-1 text-sm text-muted">{s.short}</p>
              <p className="mt-3 text-xs font-semibold text-orange-text">{t.cta.priceOnWhatsapp}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <WhatsAppLink
                  message={{ kind: 'service', name: s.name, extraLines: s.waExtraLines }}
                  location="service_card"
                  category={category.slug}
                  service={s.slug}
                  className="btn btn-wa btn-sm"
                >
                  <BrandIcon name="whatsapp" size={16} />
                  {t.cta.whatsapp}
                </WhatsAppLink>
                <CallLink location="service_card" category={category.slug} service={s.slug} className="btn btn-outline btn-sm">
                  <Phone aria-hidden="true" className="size-4" />
                  {t.cta.call}
                </CallLink>
                {s.hasDetailPage && (
                  <Link
                    to={localizePath(`/services/${category.slug}/${s.slug}`, lang)}
                    className="btn btn-sm text-orange-text hover:shadow-none"
                  >
                    {t.details} {lang === 'ar' ? '←' : '→'}
                  </Link>
                )}
              </div>
            </li>
          ))}
          <li className="card flex flex-col border-dashed p-5">
            <h2 className="text-base font-semibold">{t.describeService.title}</h2>
            <p className="mt-1 flex-1 text-sm text-muted">{t.describeService.body}</p>
            <WhatsAppLink
              message={{ kind: 'describe', category: category.name }}
              location="describe_card"
              category={category.slug}
              className="btn btn-wa btn-sm mt-3 self-start"
            >
              <BrandIcon name="whatsapp" size={16} />
              {t.cta.whatsapp}
            </WhatsAppLink>
          </li>
        </ul>
      </div>

      <Phase2Note what="njik-style hero card, trust strip, areas, about/covers cards, images, FAQ with schema" />
    </>
  )
}
