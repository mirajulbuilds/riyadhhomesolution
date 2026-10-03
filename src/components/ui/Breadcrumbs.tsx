import { ChevronLeft } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { useStrings } from '../site-context'

export interface Crumb {
  label: string
  /** Omit for the current page. */
  to?: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = useStrings()
  return (
    <nav aria-label={t.breadcrumb} className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <Fragment key={`${item.label}-${i}`}>
            {i > 0 && (
              <li aria-hidden="true">
                <ChevronLeft className="size-3.5 ltr:-scale-x-100" />
              </li>
            )}
            <li>
              {item.to ? (
                <Link to={item.to} className="hover:text-navy hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-semibold text-navy">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}
