import { Phone } from 'lucide-react'
import type { WhatsAppMessage } from '@/lib/contact'
import { CallLink, WhatsAppLink } from './ContactLinks'
import { BrandIcon } from './icons/BrandIcon'
import { useStrings } from './site-context'

interface Props {
  message?: WhatsAppMessage
  location: string
  category?: string
  service?: string
  className?: string
}

/** The standard WhatsApp + Call pair. */
export function CtaButtons({ message = { kind: 'general' }, location, category, service, className = '' }: Props) {
  const t = useStrings()
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <WhatsAppLink message={message} location={location} category={category} service={service} className="btn btn-wa">
        <BrandIcon name="whatsapp" size={20} />
        {t.cta.whatsappUs}
      </WhatsAppLink>
      <CallLink location={location} category={category} service={service} className="btn btn-call">
        <Phone aria-hidden="true" className="size-5" />
        {t.cta.callNow}
      </CallLink>
    </div>
  )
}
