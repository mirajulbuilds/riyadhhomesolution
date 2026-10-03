import { Clock, MapPin, Phone, Siren } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { localizePath } from '@/i18n/lang'
import { formatHours } from '@/lib/hours'
import { CallLink, DirectionsLink, WhatsAppLink } from '../ContactLinks'
import { BrandIcon } from '../icons/BrandIcon'
import { useSite, useStrings } from '../site-context'
import { Logo } from './Logo'
import { FOOTER_NAV } from './nav'

const SOCIAL_LABELS = { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', snapchat: 'Snapchat' } as const

export function Footer() {
  const site = useSite()
  const t = useStrings()
  const { lang } = site

  return (
    <footer className="bg-navy-deep text-white/80">
      <div className="container-x grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.4fr]">
        <div>
          <Logo variant="reversed" className="h-14 w-auto" lazy />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">{t.footer.tagline}</p>
          {site.social.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-white">{t.footer.follow}</p>
              <ul className="mt-3 flex gap-2">
                {site.social.map((s) => (
                  <li key={s.name}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener"
                      className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"
                    >
                      <BrandIcon name={s.name} size={18} />
                      <span className="sr-only">{SOCIAL_LABELS[s.name]}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <FooterColumn title={t.footer.services}>
          {site.nav.map((c) => (
            <li key={c.slug}>
              <Link to={localizePath(`/services/${c.slug}`, lang)} className="footer-link">
                {c.name}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title={t.footer.links}>
          {FOOTER_NAV.map((item) => (
            <li key={item.key}>
              <Link to={localizePath(item.path, lang)} className="footer-link">
                {t.nav[item.key]}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <div>
          <h2 className="text-sm font-semibold text-white">{t.footer.contact}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <CallLink location="footer" className="footer-link inline-flex items-center gap-2">
                <Phone aria-hidden="true" className="size-4 shrink-0 text-orange" />
                <span dir="ltr">{site.phoneDisplay}</span>
              </CallLink>
            </li>
            <li>
              <WhatsAppLink message={{ kind: 'general' }} location="footer" className="footer-link inline-flex items-center gap-2">
                <BrandIcon name="whatsapp" size={16} className="shrink-0 text-orange" />
                {t.cta.whatsappUs}
              </WhatsAppLink>
            </li>
            <li className="flex gap-2">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-orange" />
              <div>
                <address className="not-italic">{site.addressLine}</address>
                <DirectionsLink location="footer" className="mt-1 inline-block font-semibold text-white underline-offset-4 hover:underline">
                  {t.cta.directions}
                </DirectionsLink>
              </div>
            </li>
            <li className="flex gap-2">
              <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-orange" />
              <div>
                <span className="sr-only">{t.footer.hours}: </span>
                {formatHours(site.hours, lang).map((row) => (
                  <p key={row.days}>
                    <span className="text-white">{row.days}:</span> {row.time}
                  </p>
                ))}
              </div>
            </li>
            <li className="flex items-center gap-2 font-semibold text-white">
              <Siren aria-hidden="true" className="size-4 shrink-0 text-orange" />
              {site.emergency}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {site.buildYear} {site.brand}. {t.footer.rights}
          </p>
          <Link to={localizePath('/privacy', lang)} className="hover:text-white">
            {t.nav.privacy}
          </Link>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">{children}</ul>
    </div>
  )
}
