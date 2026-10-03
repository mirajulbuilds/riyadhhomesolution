import { Check, MessageCircle, PackageCheck, Users, X } from 'lucide-react'
import { useLoaderData } from 'react-router-dom'
import { CtaButtons } from '@/components/CtaButtons'
import { CtaBand, HowWeWork } from '@/components/HomeBlocks'
import { ServiceCard, ServiceImage } from '@/components/ServiceCard'
import { Seo } from '@/components/Seo'
import { useLeadTag, useSite, useStrings } from '@/components/site-context'
import { Badge } from '@/components/TrustStrip'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Faq } from '@/components/ui/Faq'
import type { ServiceData } from '@/content/view'
import { localizePath } from '@/i18n/lang'
import { buildWhatsAppMessage, type WhatsAppMessage } from '@/lib/contact'
import { NotFoundView } from './NotFound'

/** Service detail page (brief §6.4). */
export function Component() {
  const data = useLoaderData() as ServiceData | null
  const { lang } = useSite()
  const tag = useLeadTag()
  const t = useStrings()
  if (!data) return <NotFoundView />
  const { category, service, related } = data
  const message: WhatsAppMessage = { kind: 'service', name: service.name, extraLines: service.waExtraLines }
  const faq = service.faq.length > 0 ? service.faq : data.faq

  const bookingCard = (
    <div className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold">{t.service.readyTitle}</h2>
      <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-muted">
        <MessageCircle aria-hidden="true" className="size-4 text-orange-text" />
        {t.cta.priceOnWhatsapp}
      </p>
      <CtaButtons message={message} location="service_card_side" category={category.slug} service={service.slug} className="mt-4 [&>a]:flex-1" />
      <div className="mt-5">
        <p className="text-sm font-semibold text-navy">{t.messagePreview}</p>
        <pre className="mt-2 rounded-xl border border-line bg-bg p-4 font-[inherit] text-sm/relaxed whitespace-pre-wrap text-ink">
          {buildWhatsAppMessage(message, lang, tag)}
        </pre>
        <p className="mt-2 text-xs text-muted">{t.service.previewNote}</p>
      </div>
    </div>
  )

  return (
    <>
      <Seo title={service.name} description={service.short} />

      <div className="container-x pt-5 pb-10 lg:pt-8">
        <Breadcrumbs
          items={[
            { label: t.nav.home, to: localizePath('/', lang) },
            { label: t.nav.services, to: localizePath('/services', lang) },
            { label: category.name, to: localizePath(`/services/${category.slug}`, lang) },
            { label: service.name },
          ]}
        />

        <div className="mt-4 grid items-start gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
          <div className="space-y-6">
            <section className="card p-5 sm:p-8">
              <h1 className="text-[1.75rem]/tight font-bold sm:text-4xl/tight">{service.name}</h1>
              <div className="mt-4 flex flex-wrap gap-2">
                {service.partsInStock && (
                  <Badge tone="green">
                    <PackageCheck aria-hidden="true" className="size-3.5" />
                    {t.common.partsInStock}
                  </Badge>
                )}
                <Badge>
                  <MessageCircle aria-hidden="true" className="size-3.5 text-orange-text" />
                  {t.cta.priceOnWhatsapp}
                </Badge>
                <Badge tone="navy">
                  <Users aria-hidden="true" className="size-3.5" />
                  {t.common.ownTechnicians}
                </Badge>
              </div>
              <p className="mt-4 text-lg/relaxed text-muted">{service.short}</p>
              {/* On phones the CTA sits right here; on desktop it's in the side card. */}
              <CtaButtons message={message} location="service_hero" category={category.slug} service={service.slug} className="mt-6 lg:hidden" />
              {/* No placeholder here: until a photo is uploaded the text comes straight after. */}
              {service.imageUrl && (
                <div className="mt-6">
                  <ServiceImage src={service.imageUrl} alt={service.name} icon={category.icon} eager />
                </div>
              )}
              <div className="mt-6 space-y-4 text-base/relaxed text-ink">
                {service.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>

            {service.options.length > 0 && (
              <section aria-labelledby="options-title" className="card p-5 sm:p-8">
                <h2 id="options-title" className="text-lg font-bold">
                  {t.service.options}
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {service.options.map((o) => (
                    <li key={o} className="chip">
                      {o}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(service.includes.length > 0 || service.excludes.length > 0) && (
              <div className="grid gap-6 md:grid-cols-2">
                {service.includes.length > 0 && (
                  <section aria-labelledby="includes-title" className="card p-5 sm:p-7">
                    <h2 id="includes-title" className="text-lg font-bold">
                      {t.service.includes}
                    </h2>
                    <ul className="mt-4 space-y-2.5">
                      {service.includes.map((i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-wa/10">
                            <Check aria-hidden="true" className="size-3.5 text-wa" />
                          </span>
                          {i}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {service.excludes.length > 0 && (
                  <section aria-labelledby="excludes-title" className="card p-5 sm:p-7">
                    <h2 id="excludes-title" className="text-lg font-bold">
                      {t.service.excludes}
                    </h2>
                    <ul className="mt-4 space-y-2.5">
                      {service.excludes.map((i) => (
                        <li key={i} className="flex items-start gap-2.5 text-muted">
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-bg">
                            <X aria-hidden="true" className="size-3.5" />
                          </span>
                          {i}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}

            {service.parts.length > 0 && (
              <section aria-labelledby="parts-title" className="card p-5 sm:p-7">
                <h2 id="parts-title" className="flex items-center gap-2 text-lg font-bold">
                  <PackageCheck aria-hidden="true" className="size-5 text-wa" />
                  {t.service.parts}
                </h2>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {service.parts.map((p) => (
                    <li key={p} className="rounded-xl bg-bg px-4 py-2.5 text-sm font-semibold text-navy">
                      {p}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="process-title" className="card p-5 sm:p-8">
              <h2 id="process-title" className="text-lg font-bold">
                {t.steps.title}
              </h2>
              <div className="mt-6">
                <HowWeWork compact />
              </div>
            </section>

            {faq.length > 0 && (
              <section aria-labelledby="faq-title">
                <h2 id="faq-title" className="mb-4 text-2xl font-bold">
                  {t.common.faqTitle}
                </h2>
                <Faq items={faq} />
              </section>
            )}
          </div>

          {/* One booking card: beside the content on desktop (sticky), after it on phones. */}
          <aside className="lg:sticky lg:top-24">{bookingCard}</aside>
        </div>


        {related.length > 0 && (
          <section aria-labelledby="related-title" className="mt-12">
            <h2 id="related-title" className="text-2xl font-bold">
              {t.service.related}
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 3).map((s) => (
                <li key={s.slug}>
                  <ServiceCard service={s} icon={category.icon} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <CtaBand />
    </>
  )
}
