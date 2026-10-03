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

/** The standard WhatsApp + Call pair — side by side even on small phones. */
export function CtaButtons({ message = { kind: 'general' }, location, category, service, className = '' }: Props) {
  const t = useStrings()
  return (
    <div className={`grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3 ${className}`}>
      <WhatsAppLink message={message} location={location} category={category} service={service} className="btn btn-wa px-3 sm:px-5">
        <BrandIcon name="whatsapp" size={20} />
        {t.cta.whatsappUs}
      </WhatsAppLink>
      <CallLink location={location} category={category} service={service} className="btn btn-call px-3 sm:px-5">
        <Phone aria-hidden="true" className="size-5" />
        {t.cta.callNow}
      </CallLink>
    </div>
  )
}
