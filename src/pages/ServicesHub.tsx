import { Link, useLoaderData } from 'react-router-dom'
import { PageHeader, Phase2Note } from '@/components/PageHeader'
import { Seo } from '@/components/Seo'
import { useSite, useStrings } from '@/components/site-context'
import type { ServicesHubData } from '@/content/view'
import { localizePath } from '@/i18n/lang'

export function Component() {
  const data = useLoaderData() as ServicesHubData
  const { lang } = useSite()
  const t = useStrings()

  return (
    <>
      <Seo title={t.pages.servicesTitle} description={t.pages.servicesDescription} />
      <PageHeader title={t.pages.servicesTitle} lead={t.pages.servicesDescription} />

      <div className="container-x grid gap-6 py-10 lg:grid-cols-2">
        {data.categories.map((c) => (
          <section key={c.slug} className="card p-6" aria-labelledby={`cat-${c.slug}`}>
            <h2 id={`cat-${c.slug}`} className="text-xl font-bold">
              <Link to={localizePath(`/services/${c.slug}`, lang)} className="hover:text-orange-text">
                {c.name}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-muted">{c.intro}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {c.services.map((s) => (
                <li key={s.slug} className="chip">
                  {s.name}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <Phase2Note what="category cards with illustrations and icon animations" />
    </>
  )
}
