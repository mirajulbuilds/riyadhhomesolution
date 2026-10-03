import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  id: string
  title: string
  lead?: string
  /** "See all" style link shown beside the heading. */
  action?: { to: string; label: string }
  className?: string
  children: ReactNode
}

/** A page section with an H2, optional lead line and optional "see all" link. */
export function Section({ id, title, lead, action, className = '', children }: Props) {
  return (
    <section aria-labelledby={id} className={`container-x py-12 lg:py-16 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="max-w-2xl">
          <h2 id={id} className="text-2xl/tight font-bold sm:text-3xl/tight">
            {title}
          </h2>
          {lead && <p className="mt-2 text-muted">{lead}</p>}
        </div>
        {action && <ArrowLink to={action.to}>{action.label}</ArrowLink>}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  )
}

/** Text link with a chevron that points in the reading direction. */
export function ArrowLink({ to, children, className = '' }: { to: string; children: ReactNode; className?: string }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-1 font-semibold text-orange-text hover:underline ${className}`}>
      {children}
      <ChevronLeft aria-hidden="true" className="size-4 ltr:-scale-x-100" />
    </Link>
  )
}
