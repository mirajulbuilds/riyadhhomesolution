import { Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CategoryIllustration, categoryTone } from '@/components/CategoryIcon'
import { CtaButtons } from '@/components/CtaButtons'
import { Seo } from '@/components/Seo'
import { useSite, useStrings } from '@/components/site-context'
import { localizePath } from '@/i18n/lang'

/** 404 with links to the main categories (brief §6.11). Also used for unknown data routes. */
export function NotFoundView() {
  const site = useSite()
  const t = useStrings()
  const primary = site.nav.filter((c) => c.isPrimary)
  return (
    <>
      <Seo title={t.notFound.title} description={t.notFound.body} noindex />
      <div className="container-x py-16 lg:py-24">
        <div className="card mx-auto max-w-2xl p-8 text-center sm:p-12">
          <p className="text-6xl font-bold text-orange" dir="ltr">
            404
          </p>
          <h1 className="mt-4 text-3xl font-bold">{t.notFound.title}</h1>
          <p className="mt-3 text-lg text-muted">{t.notFound.body}</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {primary.map((c) => {
              const tone = categoryTone(c.icon)
              return (
                <li key={c.slug}>
                  <Link
                    to={localizePath(`/services/${c.slug}`, site.lang)}
                    className="group flex h-full flex-col items-center gap-2 rounded-2xl border border-line p-4 text-sm font-semibold text-navy transition-[border-color,translate] hover:-translate-y-0.5 hover:border-navy"
                  >
                    <span className={`grid size-20 place-items-center rounded-full ${tone.bg}`}>
                      <CategoryIllustration src={c.imageUrl} icon={c.icon} size={80} className="art-bob size-20" />
                    </span>
                    {c.name}
                  </Link>
                </li>
              )
            })}
          </ul>
          <Link to={localizePath('/', site.lang)} className="mt-6 inline-flex items-center gap-1.5 font-semibold text-orange-text hover:underline">
            <Home aria-hidden="true" className="size-4" />
            {t.notFound.backHome}
          </Link>
          <CtaButtons location="not_found" className="mt-8 justify-center" />
        </div>
      </div>
    </>
  )
}

export const Component = NotFoundView
