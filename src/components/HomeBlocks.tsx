import { CalendarCheck, Clock, MapPin, MessageCircle, PackageCheck, Phone, Siren, Truck, Users, Wrench, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { mapEmbedSrc } from '@/lib/contact'
import { formatHours } from '@/lib/hours'
import { CallLink, WhatsAppLink } from './ContactLinks'
import { BrandIcon } from './icons/BrandIcon'
import { useContextualCta, useSite, useStrings } from './site-context'

const WHY_ICONS: LucideIcon[] = [Users, PackageCheck, CalendarCheck, Siren]

/** The four differentiators from brief §1. */
export function WhyUs() {
  const site = useSite()
  const t = useStrings()
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {t.why.map((item, i) => {
        const Icon = WHY_ICONS[i] ?? Wrench
        // The "since" title follows the founding year in settings.
        const title = i === 2 ? t.trust.since(site.sinceYear) : item.title
        return (
          <li key={item.title} className="card p-6">
            <span className="grid size-12 place-items-center rounded-2xl bg-navy">
              <Icon aria-hidden="true" className="size-6 text-orange" />
            </span>
            <h3 className="mt-5 text-lg font-bold">{title}</h3>
            <p className="mt-2 text-sm/relaxed text-muted">{item.body}</p>
          </li>
        )
      })}
    </ul>
  )
}

const STEP_ICONS: LucideIcon[] = [MessageCircle, CalendarCheck, Truck, Wrench]

/**
 * The 4-step process. A line connects the steps (Phase 4 draws it on scroll and drives a
 * van along it in the reading direction).
 */
export function HowWeWork({ compact = false }: { compact?: boolean }) {
  const t = useStrings()
  return (
    <ol className={`relative grid gap-6 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
      {!compact && (
        <span aria-hidden="true" className="absolute inset-x-[12%] top-7 hidden h-0.5 bg-[repeating-linear-gradient(90deg,var(--orange)_0_10px,transparent_10px_18px)] lg:block" />
      )}
      {t.steps.items.map((step, i) => {
        const Icon = STEP_ICONS[i] ?? Wrench
        return (
          <li key={step.title} className="relative flex gap-4 lg:flex-col lg:items-center lg:text-center">
            <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full border-4 border-bg bg-white shadow-sm ring-1 ring-line">
              <Icon aria-hidden="true" className="size-6 text-navy" />
              <span className="absolute -end-1 -top-1 grid size-6 place-items-center rounded-full bg-orange text-xs font-bold text-navy">{i + 1}</span>
            </span>
            <div>
              <h3 className="font-bold">{step.title}</h3>
              <p className="mt-1 text-sm/relaxed text-muted">{step.body}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Final orange call-to-action band (navy text on orange for contrast). */
export function CtaBand() {
  const t = useStrings()
  const cta = useContextualCta()
  return (
    <section aria-labelledby="cta-band" className="container-x py-12 lg:py-16">
      <div className="relative overflow-hidden rounded-[22px] bg-orange px-6 py-10 sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-14">
        <span aria-hidden="true" className="absolute -end-10 -top-16 size-56 rounded-full bg-white/15" />
        <div className="relative max-w-xl">
          <h2 id="cta-band" className="text-2xl/tight font-bold text-navy sm:text-3xl/tight">
            {t.home.ctaTitle}
          </h2>
          <p className="mt-3 text-navy/80">{t.home.ctaBody}</p>
        </div>
        <div className="relative mt-6 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0">
          <WhatsAppLink message={cta.message} category={cta.category} service={cta.service} location="cta_band" className="btn btn-wa">
            <BrandIcon name="whatsapp" size={20} />
            {t.cta.whatsappUs}
          </WhatsAppLink>
          <CallLink location="cta_band" category={cta.category} service={cta.service} className="btn bg-navy text-white hover:bg-navy-deep">
            <Phone aria-hidden="true" className="size-5" />
            {t.cta.callNow}
          </CallLink>
        </div>
      </div>
    </section>
  )
}

/** Opening hours rows + emergency line. */
export function HoursList({ className = '' }: { className?: string }) {
  const site = useSite()
  return (
    <div className={className}>
      <ul className="space-y-1.5">
        {formatHours(site.hours, site.lang).map((row) => (
          <li key={row.days} className="flex items-start gap-2">
            <Clock aria-hidden="true" className="mt-1 size-4 shrink-0 text-orange-text" />
            <span>
              <span className="font-semibold text-navy">{row.days}:</span> <span>{row.time}</span>
            </span>
          </li>
        ))}
        {site.hoursNote && <li className="text-sm text-muted">{site.hoursNote}</li>}
        <li className="flex items-center gap-2 font-semibold text-navy">
          <Siren aria-hidden="true" className="size-4 shrink-0 text-orange-text" />
          {site.emergency}
        </li>
      </ul>
    </div>
  )
}

/**
 * Google Map of the shop. The iframe (~0.5 MB of Google scripts) is only created when it comes
 * within 200px of the screen or the visitor taps "Show map"; the box is sized up front, so
 * nothing shifts. Without JavaScript the map is embedded directly (noscript).
 */
export function MapEmbed({ className = '' }: { className?: string }) {
  const site = useSite()
  const t = useStrings()
  const box = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  // Pin on the shop's own Google listing marker (settings shop_lat / shop_lng).
  const src = mapEmbedSrc(site.geo, site.lang)
  const frameClass = 'block aspect-[4/3] h-auto w-full border-0 sm:aspect-[16/10]'

  useEffect(() => {
    const el = box.current
    if (!el || show || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShow(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [show])

  return (
    <div ref={box} className={`overflow-hidden rounded-card border border-line bg-bg ${className}`}>
      {show ? (
        <iframe title={t.about.mapTitle} src={src} referrerPolicy="no-referrer-when-downgrade" className={frameClass} allowFullScreen />
      ) : (
        <button
          type="button"
          onClick={() => setShow(true)}
          className={`${frameClass} grid cursor-pointer place-items-center bg-[radial-gradient(circle_at_50%_45%,#fff,var(--bg)_70%)]`}
        >
          <span className="flex flex-col items-center gap-2 text-navy">
            <span className="grid size-14 place-items-center rounded-full bg-orange text-navy shadow">
              <MapPin aria-hidden="true" className="size-7" />
            </span>
            <span className="font-semibold">{t.about.showMap}</span>
            <span className="max-w-xs px-4 text-center text-sm text-muted">{site.addressLine}</span>
          </span>
        </button>
      )}
      <noscript>
        <iframe title={t.about.mapTitle} src={src} loading="lazy" className={frameClass} />
      </noscript>
    </div>
  )
}
