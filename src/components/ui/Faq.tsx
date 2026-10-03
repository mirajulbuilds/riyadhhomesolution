import { Plus } from 'lucide-react'
import type { Faq as FaqItem } from '@/content/types'

/** FAQ accordion on <details>: works without JavaScript and is keyboard accessible. */
export function Faq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null
  return (
    <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-white">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-start font-semibold text-navy hover:bg-bg sm:px-6">
            <span>{item.q}</span>
            <Plus aria-hidden="true" className="size-5 shrink-0 text-orange-text transition-transform group-open:rotate-45" />
          </summary>
          <p className="px-5 pb-5 leading-relaxed text-muted sm:px-6">{item.a}</p>
        </details>
      ))}
    </div>
  )
}
