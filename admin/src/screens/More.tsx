import { NAV } from '../App'
import { PageTitle } from '../form'
import { useT } from '../i18n'
import { urlOf, useNav } from '../nav'

/** Phones: the pages that don't fit in the bottom bar, as big buttons. */
export function More() {
  const { t } = useT()
  const { go } = useNav()
  return (
    <div>
      <PageTitle title={t.navMore} />
      <ul className="space-y-2">
        {NAV.slice(4).map(({ page, icon: Icon, label }) => (
          <li key={page}>
            <a
              href={urlOf(page)}
              onClick={(e) => {
                e.preventDefault()
                go(page)
              }}
              className="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-white px-4 text-lg font-semibold text-navy"
            >
              <Icon className="size-6" aria-hidden="true" />
              {label(t)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
