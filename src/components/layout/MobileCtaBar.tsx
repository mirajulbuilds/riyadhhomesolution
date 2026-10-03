import { Phone } from 'lucide-react'
import { CallLink, WhatsAppLink } from '../ContactLinks'
import { BrandIcon } from '../icons/BrandIcon'
import { useContextualCta, useStrings } from '../site-context'

/**
 * Always-visible WhatsApp + Call bar on phones (< 768px). The layout reserves its height.
 * On service and category pages the WhatsApp message names that service.
 */
export function MobileCtaBar() {
  const t = useStrings()
  const cta = useContextualCta()
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] backdrop-blur md:hidden">
      <div className="grid grid-cols-2 gap-2">
        <WhatsAppLink
          message={cta.message}
          location="sticky_bar"
          category={cta.category}
          service={cta.service}
          className="btn btn-wa h-12"
        >
          <BrandIcon name="whatsapp" size={20} />
          {t.cta.whatsapp}
        </WhatsAppLink>
        <CallLink location="sticky_bar" category={cta.category} service={cta.service} className="btn btn-call h-12">
          <Phone aria-hidden="true" className="size-5" />
          {t.cta.call}
        </CallLink>
      </div>
    </div>
  )
}
