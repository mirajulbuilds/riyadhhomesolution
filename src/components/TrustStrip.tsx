import { MessageCircle, PackageCheck, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { useStrings } from './site-context'

/** Category / service trust strip: own technicians · parts in stock · price on WhatsApp. */
export function TrustStrip({ className = '' }: { className?: string }) {
  const t = useStrings()
  const items = [
    { icon: Users, label: t.common.ownTechnicians },
    { icon: PackageCheck, label: t.common.partsInStock },
    { icon: MessageCircle, label: t.cta.priceOnWhatsapp },
  ]
  return (
    <ul className={`grid grid-cols-3 gap-2 sm:gap-3 ${className}`}>
      {items.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="flex flex-col items-center gap-1.5 rounded-2xl bg-bg px-2 py-3 text-center text-xs font-semibold text-navy sm:flex-row sm:gap-3 sm:px-4 sm:text-start sm:text-sm"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white">
            <Icon aria-hidden="true" className="size-5 text-orange-text" />
          </span>
          {label}
        </li>
      ))}
    </ul>
  )
}

/** Small pill badges used on service pages and cards. */
export function Badge({ children, tone = 'orange' }: { children: ReactNode; tone?: 'orange' | 'green' | 'navy' }) {
  // Navy text on the orange tint: orange text on a tinted background drops below 4.5:1.
  const tones = {
    orange: 'bg-orange/15 text-navy',
    green: 'bg-wa/10 text-wa',
    navy: 'bg-navy/8 text-navy',
  }
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}
