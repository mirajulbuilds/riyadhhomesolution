import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { buildWhatsAppMessage, directionsHref, telHref, whatsappHref, type WhatsAppMessage } from '@/lib/contact'
import { track } from '@/lib/track'
import { useLeadTag, usePageType, useSite } from './site-context'

type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>

interface TrackingProps {
  /** Where the link sits, for analytics: "header", "sticky_bar", "service_card", ... */
  location: string
  category?: string
  service?: string
}

function useTracker(event: Parameters<typeof track>[0], { location, category, service }: TrackingProps) {
  const { lang } = useSite()
  const pageType = usePageType()
  return () => track(event, { language: lang, page_type: pageType, link_location: location, category, service })
}

/** Opens WhatsApp with a pre-filled message (brief §7) and records a whatsapp_click. */
export function WhatsAppLink({
  message,
  location,
  category,
  service,
  onClick,
  children,
  ...rest
}: AnchorProps & TrackingProps & { message: WhatsAppMessage }) {
  const site = useSite()
  const tag = useLeadTag()
  const onTrack = useTracker('whatsapp_click', { location, category, service })
  const href = whatsappHref(site.whatsappNumber, buildWhatsAppMessage(message, site.lang, tag))

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onTrack()
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}

/** tel: link to the shop number; records a call_click. */
export function CallLink({ location, category, service, onClick, children, ...rest }: AnchorProps & TrackingProps) {
  const site = useSite()
  const onTrack = useTracker('call_click', { location, category, service })
  return (
    <a
      href={telHref(site.phoneE164)}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onTrack()
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}

/** Google Maps directions to the shop's exact coordinates; records a directions_click. */
export function DirectionsLink({ location, onClick, children, ...rest }: AnchorProps & TrackingProps) {
  const site = useSite()
  const onTrack = useTracker('directions_click', { location })
  return (
    <a
      href={directionsHref(site.geo)}
      target="_blank"
      rel="noopener"
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onTrack()
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
