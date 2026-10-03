import type { ReactNode } from 'react'
import { localizePath } from '@/i18n/lang'
import { Breadcrumbs } from './ui/Breadcrumbs'
import { useSite, useStrings } from './site-context'

/**
 * Title band at the top of inner pages: breadcrumb (Home › title), H1, lead, extras.
 * `navy` is the darker band used where a white panel overlaps it (services hub).
 */
export function PageHeader({
  title,
  lead,
  tone = 'white',
  children,
}: {
  title: string
  lead?: string
  tone?: 'white' | 'navy'
  children?: ReactNode
}) {
  const { lang } = useSite()
  const t = useStrings()
  const navy = tone === 'navy'
  return (
    <div className={navy ? 'relative overflow-hidden bg-navy' : 'border-b border-line bg-white'}>
      {navy && <span aria-hidden="true" className="absolute -end-32 -top-32 size-[28rem] rounded-full bg-orange/10 blur-3xl" />}
      <div className={`container-x relative ${navy ? 'pt-8 pb-20 sm:pb-28 lg:pt-12' : 'py-8 lg:py-12'}`}>
        <Breadcrumbs items={[{ label: t.nav.home, to: localizePath('/', lang) }, { label: title }]} inverted={navy} />
        <h1 className={`mt-4 max-w-3xl text-3xl/tight font-bold sm:text-4xl/tight ${navy ? 'text-white' : ''}`}>{title}</h1>
        {lead && <p className={`mt-3 max-w-2xl text-lg/relaxed ${navy ? 'text-white/80' : 'text-muted'}`}>{lead}</p>}
        {children}
      </div>
    </div>
  )
}
