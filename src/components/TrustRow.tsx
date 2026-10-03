import { CalendarCheck, PackageCheck, Siren, Users } from 'lucide-react'
import { useSite, useStrings } from './site-context'

/** «منذ 1999» · «+10 فنيين» · «طوارئ 24/7» · «القطع من محلنا» — values come from settings. */
export function TrustRow({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const site = useSite()
  const t = useStrings()
  const items = [
    { icon: CalendarCheck, label: t.trust.since(site.sinceYear) },
    { icon: Users, label: t.trust.technicians(site.technicians) },
    { icon: Siren, label: t.trust.emergency },
    { icon: PackageCheck, label: t.trust.parts },
  ]
  return (
    <ul className={`flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold ${tone === 'dark' ? 'text-white/90' : 'text-navy'}`}>
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2">
          <Icon aria-hidden="true" className="size-5 text-orange" />
          {label}
        </li>
      ))}
    </ul>
  )
}
