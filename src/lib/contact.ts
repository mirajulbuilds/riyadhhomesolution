import type { Lang } from '@/i18n/lang'
import type { LeadTag } from './lead-source'

/*
 * WhatsApp and phone links. Message templates follow PROJECT_BRIEF.md §7 exactly — the
 * owner reads these messages on WhatsApp, so keep the line order and labels stable.
 */

export type WhatsAppMessage =
  /** A service card / detail page / category page. */
  | { kind: 'service'; name: string; extraLines?: string | null }
  /** "Ask on WhatsApp" for a product. */
  | { kind: 'product'; name: string }
  /** "Didn't find your service? Describe it to us." `category` is optional context. */
  | { kind: 'describe'; category?: string }
  /** Header, sticky bar and other general buttons. */
  | { kind: 'general' }
  /** Contact-page "Request a visit" form. */
  | { kind: 'visit'; name: string; district: string; service: string; description: string }

const labels = {
  ar: {
    greeting: 'السلام عليكم',
    needService: 'أحتاج خدمة',
    askAbout: 'أسأل عن',
    district: 'الحي',
    time: 'الوقت المناسب',
    name: 'الاسم',
    description: 'الوصف',
    footer: '— من موقع رياض هوم سوليوشن',
  },
  en: {
    greeting: 'Hi',
    needService: 'I need',
    askAbout: "I'd like to ask about",
    district: 'Area',
    time: 'Preferred time',
    name: 'Name',
    description: 'Details',
    footer: '— from the Riyadh Home Solution website',
  },
} as const

/** Normalises user-entered extra lines ("Size: \nHow many: ") to clean lines. */
function extraLinesOf(text: string | null | undefined): string[] {
  return (text ?? '')
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== '')
    .map((line) => (line.endsWith(':') ? `${line} ` : line))
}

export function buildWhatsAppMessage(message: WhatsAppMessage, lang: Lang, tag: LeadTag): string {
  const t = labels[lang]
  const comma = lang === 'ar' ? '،' : ','
  const footer = `${t.footer} ${tag}`

  switch (message.kind) {
    case 'product':
      return [`${t.greeting}${comma} ${t.askAbout}: ${message.name}`, footer].join('\n')

    case 'visit':
      return [
        `${t.greeting}${comma} ${t.needService}: ${message.service}`,
        `${t.name}: ${message.name}`,
        `${t.district}: ${message.district}`,
        `${t.description}: ${message.description}`,
        `${t.time}: `,
        footer,
      ].join('\n')

    case 'describe':
    case 'general':
    case 'service': {
      const service =
        message.kind === 'service' ? message.name : message.kind === 'describe' ? (message.category ?? '') : ''
      return [
        // With no service name the line ends in ": " so the customer can type straight after it.
        `${t.greeting}${comma} ${t.needService}: ${service}`,
        ...(message.kind === 'service' ? extraLinesOf(message.extraLines) : []),
        ...(message.kind === 'describe' ? [`${t.description}: `] : []),
        `${t.district}: `,
        `${t.time}: `,
        footer,
      ].join('\n')
    }
  }
}

/** https://wa.me/<digits>?text=<encoded message> */
export function whatsappHref(number: string, text: string): string {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}

/** tel:+966500569163 */
export function telHref(e164: string): string {
  return `tel:${e164.replace(/[^\d+]/g, '')}`
}
