import type { ReactNode } from 'react'
import { localizePath } from '@/i18n/lang'
import { Breadcrumbs } from './ui/Breadcrumbs'
import { useSite, useStrings } from './site-context'

/** Title band at the top of inner pages: breadcrumb (Home › title), H1, lead, extras. */
export function PageHeader({ title, lead, children }: { title: string; lead?: string; children?: ReactNode }) {
  const { lang } = useSite()
  const t = useStrings()
  return (
    <div className="border-b border-line bg-white">
      <div className="container-x py-8 lg:py-12">
        <Breadcrumbs items={[{ label: t.nav.home, to: localizePath('/', lang) }, { label: title }]} />
        <h1 className="mt-4 max-w-3xl text-3xl/tight font-bold sm:text-4xl/tight">{title}</h1>
        {lead && <p className="mt-3 max-w-2xl text-lg/relaxed text-muted">{lead}</p>}
        {children}
      </div>
    </div>
  )
}
