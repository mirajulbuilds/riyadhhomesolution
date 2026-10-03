import { Link } from 'react-router-dom'
import { CtaButtons } from '@/components/CtaButtons'
import { Seo } from '@/components/Seo'
import { useSite, useStrings } from '@/components/site-context'
import { localizePath } from '@/i18n/lang'

/** 404 content, also used by data routes whose slug no longer exists. */
export function NotFoundView() {
  const site = useSite()
  const t = useStrings()
  return (
    <>
      <Seo title={t.notFound.title} description={t.notFound.body} noindex />
      <div className="container-x py-16 lg:py-24">
        <p className="text-sm font-semibold text-orange-text" dir="ltr">
          404
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t.notFound.title}</h1>
        <p className="mt-4 max-w-xl text-lg text-muted">{t.notFound.body}</p>
        <ul className="mt-8 flex flex-wrap gap-2">
          {site.nav
            .filter((c) => c.isPrimary)
            .map((c) => (
              <li key={c.slug}>
                <Link to={localizePath(`/services/${c.slug}`, site.lang)} className="chip hover:border-navy">
                  {c.name}
                </Link>
              </li>
            ))}
          <li>
            <Link to={localizePath('/', site.lang)} className="chip hover:border-navy">
              {t.notFound.backHome}
            </Link>
          </li>
        </ul>
        <CtaButtons location="not_found" className="mt-8" />
      </div>
    </>
  )
}

export const Component = NotFoundView
