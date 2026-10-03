import { MessageCircle, Phone } from 'lucide-react'
import type { ServiceCard as ServiceCardData } from '@/content/types'
import { localizePath } from '@/i18n/lang'
import { CategoryIcon, categoryTone } from './CategoryIcon'
import { CallLink, WhatsAppLink } from './ContactLinks'
import { BrandIcon } from './icons/BrandIcon'
import { Badge } from './TrustStrip'
import { ArrowLink } from './ui/Section'
import { useSite, useStrings } from './site-context'

/** 4:3 service image, or a tinted placeholder with the category icon until a photo is uploaded. */
export function ServiceImage({
  src,
  alt,
  icon,
  className = '',
  eager = false,
  compact = false,
}: {
  src: string | null
  alt: string
  icon: string | null
  className?: string
  eager?: boolean
  /** Smaller placeholder icon (phone thumbnail). */
  compact?: boolean
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        width={800}
        height={600}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={`aspect-[4/3] w-full rounded-2xl bg-bg object-cover ${className}`}
      />
    )
  }
  const tone = categoryTone(icon)
  return (
    <div aria-hidden="true" className={`grid aspect-[4/3] w-full place-items-center rounded-2xl ${tone.bg} ${className}`}>
      <span className={`grid place-items-center rounded-full bg-white/80 ${compact ? 'size-11 sm:size-16' : 'size-16'}`}>
        <CategoryIcon icon={icon} className={`${tone.fg} ${compact ? 'size-5 sm:size-8' : 'size-8'}`} />
      </span>
    </div>
  )
}

/** Service grid card (brief §6.3): image, name, one line, price tag, WhatsApp, Call, optional Details. */
export function ServiceCard({ service, icon, headingLevel = 3 }: { service: ServiceCardData; icon: string | null; headingLevel?: 2 | 3 }) {
  const { lang } = useSite()
  const t = useStrings()
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  const detailPath = localizePath(`/services/${service.categorySlug}/${service.slug}`, lang)

  return (
    // Phones: compact row (small square thumbnail beside the text) so long service lists stay
    // scannable; from sm up: classic card with a 4:3 image on top.
    <article className="card flex h-full flex-col p-3 transition-shadow hover:shadow-[0_14px_34px_-18px_rgb(11_37_69/0.35)]">
      <div className="flex gap-3 sm:flex-col sm:gap-0">
        <ServiceImage
          src={service.imageUrl}
          alt={service.name}
          icon={icon}
          className="aspect-square! w-[88px]! shrink-0 self-start sm:aspect-[4/3]! sm:w-full!"
          compact
        />
        <div className="min-w-0 sm:px-2 sm:pt-4">
          <Heading className="text-base/snug font-bold">{service.name}</Heading>
          <p className="mt-1.5 text-sm/relaxed text-muted">{service.short}</p>
          <div className="mt-3">
            <Badge>
              <MessageCircle aria-hidden="true" className="size-3.5 text-orange-text" />
              {t.cta.priceOnWhatsapp}
            </Badge>
          </div>
        </div>
      </div>
      <div className="mt-auto flex flex-col pt-4 sm:px-2 sm:pb-2">
        <div className="grid grid-cols-2 gap-2">
          <WhatsAppLink
            message={{ kind: 'service', name: service.name, extraLines: service.waExtraLines }}
            location="service_card"
            category={service.categorySlug}
            service={service.slug}
            className="btn btn-wa btn-sm"
          >
            <BrandIcon name="whatsapp" size={16} />
            {t.cta.whatsapp}
          </WhatsAppLink>
          <CallLink location="service_card" category={service.categorySlug} service={service.slug} className="btn btn-outline btn-sm">
            <Phone aria-hidden="true" className="size-4" />
            {t.cta.call}
          </CallLink>
        </div>
        {service.hasDetailPage && (
          <ArrowLink to={detailPath} className="mt-3 self-start text-sm">
            {t.details}
            <span className="sr-only">: {service.name}</span>
          </ArrowLink>
        )}
      </div>
    </article>
  )
}

/** Last card of every category grid: "Didn't find your service? Describe it to us". */
export function DescribeCard({ categoryName, categorySlug }: { categoryName?: string; categorySlug?: string }) {
  const t = useStrings()
  return (
    <article className="flex h-full flex-col justify-between rounded-card border-2 border-dashed border-orange/50 bg-white p-6">
      <div>
        <span className="grid size-12 place-items-center rounded-2xl bg-orange/15">
          <MessageCircle aria-hidden="true" className="size-6 text-orange-text" />
        </span>
        <h3 className="mt-4 text-lg font-bold">{t.describeService.title}</h3>
        <p className="mt-2 text-sm/relaxed text-muted">{t.describeService.body}</p>
      </div>
      <WhatsAppLink
        message={{ kind: 'describe', category: categoryName }}
        location="describe_card"
        category={categorySlug}
        className="btn btn-wa mt-6"
      >
        <BrandIcon name="whatsapp" size={18} />
        {t.cta.whatsappUs}
      </WhatsAppLink>
    </article>
  )
}
