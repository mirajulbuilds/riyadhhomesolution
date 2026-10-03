import type { Lang } from '@/i18n/lang'
import type { LeadTag } from './lead-source'

/*
 * WhatsApp, phone and map links.
 *
 * WhatsApp messages are short and natural, in the page language, with no empty fields to fill
 * in: one sentence that fits the page, then the lead tag — (WEB) or (WEB-AD) — on its own last
 * line. The customer can edit the text before sending. Texts approved by the owner (2026-10).
 */

export type WhatsAppMessage =
  /** Home, About, Contact, Reviews, Products, Our Work, 404 and any other general button. */
  | { kind: 'general' }
  /** A category page: the category's own message (categories.wa_message_*); blank → general. */
  | { kind: 'category'; message: string | null | undefined }
  /** A service page or card. `custom` is the service's optional wa_message_* override. */
  | { kind: 'service'; name: string; custom?: string | null }
  /** "Ask on WhatsApp" for a product (or a product section). */
  | { kind: 'product'; name: string }
  /** Contact-page "Request a visit" form: composed from the fields the visitor filled in. */
  | { kind: 'visit'; name: string; district: string; service: string; description: string }

const texts = {
  ar: {
    general: 'السلام عليكم، أحتاج إلى فني.',
    service: (name: string) => `السلام عليكم، أريد الاستفسار عن ${name}.`,
    product: (name: string) => `السلام عليكم، أريد الاستفسار عن: ${name}.`,
    visit: (service: string) => `السلام عليكم، أحتاج خدمة: ${service}`,
    name: 'الاسم',
    district: 'الحي',
    description: 'الوصف',
  },
  en: {
    general: 'Hello, I need a technician.',
    service: (name: string) => `Hello, I'd like to ask about: ${name}.`,
    product: (name: string) => `Hello, I'd like to ask about: ${name}.`,
    visit: (service: string) => `Hello, I need: ${service}`,
    name: 'Name',
    district: 'Area',
    description: 'Details',
  },
} as const

/** The message body for `lang`, without the lead tag. */
function messageBody(message: WhatsAppMessage, lang: Lang): string {
  const t = texts[lang]
  switch (message.kind) {
    case 'general':
      return t.general
    case 'category':
      return message.message?.trim() || t.general
    case 'service':
      return message.custom?.trim() || t.service(message.name.trim())
    case 'product':
      return t.product(message.name.trim())
    case 'visit':
      // Only the fields the visitor actually filled in.
      return [
        t.visit(message.service),
        `${t.name}: ${message.name}`,
        `${t.district}: ${message.district}`,
        ...(message.description.trim() ? [`${t.description}: ${message.description.trim()}`] : []),
      ].join('\n')
  }
}

/** Full WhatsApp text: the message, then the lead tag on its own line. */
export function buildWhatsAppMessage(message: WhatsAppMessage, lang: Lang, tag: LeadTag): string {
  return `${messageBody(message, lang)}\n${tag}`
}

/** https://wa.me/<digits>?text=<encoded message> */
export function whatsappHref(number: string, text: string): string {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}

/** tel:+966500569163 */
export function telHref(e164: string): string {
  return `tel:${e164.replace(/[^\d+]/g, '')}`
}

type LatLng = { lat: number; lng: number }

/** Google Maps directions with the shop's exact coordinates as the destination. */
export function directionsHref({ lat, lng }: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

/** Keyless Google Maps embed with a pin on the shop's coordinates. */
export function mapEmbedSrc({ lat, lng }: LatLng, lang: Lang, zoom = 17): string {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&hl=${lang}&output=embed`
}
