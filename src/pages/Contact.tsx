import { MapPin, Navigation, Phone } from 'lucide-react'
import { useLoaderData } from 'react-router-dom'
import { CallLink, DirectionsLink, WhatsAppLink } from '@/components/ContactLinks'
import { VisitForm } from '@/components/forms/VisitForm'
import { HoursList, MapEmbed } from '@/components/HomeBlocks'
import { BrandIcon } from '@/components/icons/BrandIcon'
import { PageHeader } from '@/components/PageHeader'
import { Seo } from '@/components/Seo'
import { useSite, useStrings } from '@/components/site-context'
import type { ContactData } from '@/content/view'

const SOCIAL_LABELS = { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', snapchat: 'Snapchat' } as const

/** Contact (brief §6.9): WhatsApp / Call / Visit cards, request-a-visit form, map, hours, socials. */
export function Component() {
  const data = useLoaderData() as ContactData
  const site = useSite()
  const t = useStrings()
  const c = t.contact

  return (
    <>
      <Seo title={t.pages.contactTitle} description={t.pages.contactDescription} />
      <PageHeader title={t.pages.contactTitle} lead={t.pages.contactDescription} />

      <div className="container-x py-10 lg:py-14">
        <ul className="grid gap-4 md:grid-cols-3">
          <li>
            <WhatsAppLink
              message={{ kind: 'general' }}
              location="contact_card"
              className="card group flex h-full flex-col p-6 transition-shadow hover:shadow-[0_18px_40px_-20px_rgb(11_37_69/0.4)]"
            >
              <span className="grid size-14 place-items-center rounded-2xl bg-wa text-white">
                <BrandIcon name="whatsapp" size={28} />
              </span>
              <span className="mt-5 text-xl font-bold text-navy">{t.cta.whatsapp}</span>
              <span className="mt-2 flex-1 text-sm/relaxed text-muted">{c.whatsappBody}</span>
              <span className="mt-4 font-semibold text-wa" dir="ltr">
                {site.phoneDisplay}
              </span>
            </WhatsAppLink>
          </li>
          <li>
            <CallLink
              location="contact_card"
              className="card flex h-full flex-col p-6 transition-shadow hover:shadow-[0_18px_40px_-20px_rgb(11_37_69/0.4)]"
            >
              <span className="grid size-14 place-items-center rounded-2xl bg-orange text-navy">
                <Phone aria-hidden="true" className="size-7" />
              </span>
              <span className="mt-5 text-xl font-bold text-navy">{c.callTitle}</span>
              <span className="mt-2 flex-1 text-sm/relaxed text-muted">{c.callBody}</span>
              <span className="mt-4 font-semibold text-navy" dir="ltr">
                {site.phoneDisplay}
              </span>
            </CallLink>
          </li>
          <li>
            <DirectionsLink
              location="contact_card"
              className="card flex h-full flex-col p-6 transition-shadow hover:shadow-[0_18px_40px_-20px_rgb(11_37_69/0.4)]"
            >
              <span className="grid size-14 place-items-center rounded-2xl bg-navy text-white">
                <MapPin aria-hidden="true" className="size-7" />
              </span>
              <span className="mt-5 text-xl font-bold text-navy">{c.visitTitle}</span>
              <span className="mt-2 flex-1 text-sm/relaxed text-muted">{site.addressLine}</span>
              <span className="mt-4 inline-flex items-center gap-1.5 font-semibold text-orange-text">
                <Navigation aria-hidden="true" className="size-4" />
                {t.cta.directions}
              </span>
            </DirectionsLink>
          </li>
        </ul>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
          <VisitForm serviceOptions={data.serviceOptions} />
          <div className="space-y-6">
            <MapEmbed />
            <div className="card space-y-4 p-6">
              <div className="flex items-start gap-2">
                <MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-orange-text" />
                <address className="font-semibold text-navy not-italic">{site.addressLine}</address>
              </div>
              <div>
                <h2 className="mb-2 text-sm font-semibold text-muted">{c.hoursTitle}</h2>
                <HoursList />
              </div>
              {site.social.length > 0 && (
                <div>
                  <h2 className="mb-2 text-sm font-semibold text-muted">{t.footer.follow}</h2>
                  <ul className="flex gap-2">
                    {site.social.map((s) => (
                      <li key={s.name}>
                        <a href={s.url} target="_blank" rel="noopener" className="grid size-11 place-items-center rounded-xl bg-navy text-white hover:bg-navy-deep">
                          <BrandIcon name={s.name} size={20} />
                          <span className="sr-only">{SOCIAL_LABELS[s.name]}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
