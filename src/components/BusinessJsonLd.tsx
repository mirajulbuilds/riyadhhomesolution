import { Head } from 'vite-react-ssg'
import { localizePath } from '@/i18n/lang'
import { SCHEMA_DAYS } from '@/lib/hours'
import { absoluteUrl, SITE_URL } from '@/lib/site-url'
import { useSite } from './site-context'

/**
 * HomeAndConstructionBusiness structured data on every page (brief §13), from the settings.
 * Deliberately no aggregateRating: self-collected site reviews must not be marked up.
 * Page-level types (Service, BreadcrumbList, FAQPage) come in Phase 5.
 */
export function BusinessJsonLd() {
  const site = useSite()
  const sep = site.lang === 'ar' ? '، ' : ', '
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${SITE_URL}/#business`,
    name: site.brand,
    alternateName: site.alternateBrand,
    url: absoluteUrl(localizePath('/', site.lang)),
    logo: absoluteUrl('/brand/RHS-social-avatar.png'),
    image: absoluteUrl('/brand/RHS-social-avatar.png'),
    telephone: site.phoneE164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${site.address.street}${sep}${site.address.district}`,
      addressLocality: site.address.city,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapsUrl,
    openingHoursSpecification: site.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days.map((d) => SCHEMA_DAYS[d]),
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: site.areas.map((a) => ({ '@type': 'Place', name: a.name })),
    foundingDate: String(site.sinceYear),
    ...(site.social.length > 0 ? { sameAs: site.social.map((s) => s.url) } : {}),
  }
  // "<" escaped so no value can ever close the script element.
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return (
    <Head>
      <script type="application/ld+json">{json}</script>
    </Head>
  )
}
