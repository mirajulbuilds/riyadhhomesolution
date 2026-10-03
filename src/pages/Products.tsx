import { useLoaderData } from 'react-router-dom'
import { PageHeader, Phase2Note } from '@/components/PageHeader'
import { Seo } from '@/components/Seo'
import { useStrings } from '@/components/site-context'
import type { ProductsData } from '@/content/view'

export function Component() {
  const data = useLoaderData() as ProductsData
  const t = useStrings()
  return (
    <>
      <Seo title={t.pages.productsTitle} description={t.pages.productsDescription} />
      <PageHeader title={t.pages.productsTitle} lead={t.pages.productsDescription}>
        <ul className="mt-6 flex flex-wrap gap-2">
          {data.categories.map((c) => (
            <li key={c.slug} className="chip">
              {c.name} <span className="text-muted">({c.products.length})</span>
            </li>
          ))}
        </ul>
      </PageHeader>
      <Phase2Note what="catalog by category with “Ask on WhatsApp” per item" />
    </>
  )
}
