import { CtaButtons } from '@/components/CtaButtons'
import { DirectionsLink } from '@/components/ContactLinks'
import { PageHeader, Phase2Note } from '@/components/PageHeader'
import { Seo } from '@/components/Seo'
import { useSite, useStrings } from '@/components/site-context'
import { formatHours } from '@/lib/hours'

export function Component() {
  const site = useSite()
  const t = useStrings()
  return (
    <>
      <Seo title={t.pages.contactTitle} description={t.pages.contactDescription} />
      <PageHeader title={t.pages.contactTitle} lead={t.pages.contactDescription}>
        <CtaButtons location="contact_page" className="mt-6" />
        <div className="mt-6 space-y-1 text-ink">
          <address className="not-italic">{site.addressLine}</address>
          {formatHours(site.hours, site.lang).map((row) => (
            <p key={row.days}>
              {row.days}: {row.time}
            </p>
          ))}
          <DirectionsLink location="contact_page" className="inline-block font-semibold text-orange-text hover:underline">
            {t.cta.directions}
          </DirectionsLink>
        </div>
      </PageHeader>
      <Phase2Note what="three contact cards, “Request a visit” form, embedded map, social icons" />
    </>
  )
}
