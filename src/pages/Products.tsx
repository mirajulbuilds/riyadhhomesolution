import { Info, Package } from 'lucide-react'
import { useLoaderData } from 'react-router-dom'
import { WhatsAppLink } from '@/components/ContactLinks'
import { CtaBand } from '@/components/HomeBlocks'
import { BrandIcon } from '@/components/icons/BrandIcon'
import { PageHeader } from '@/components/PageHeader'
import { Seo } from '@/components/Seo'
import { useStrings } from '@/components/site-context'
import type { ProductsData } from '@/content/view'

/** Product catalog (brief §6.7): no prices, no brands, no cart — every item asks on WhatsApp. */
export function Component() {
  const data = useLoaderData() as ProductsData

  const t = useStrings()

  return (
    <>
      <Seo title={t.pages.productsTitle} description={t.pages.productsDescription} />
      <PageHeader title={t.pages.productsTitle} lead={t.products.lead}>
          <p className="mt-4 flex max-w-2xl items-start gap-2 rounded-xl bg-bg p-3 text-sm text-navy">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-orange-text" />
            {t.products.noPrices}
          </p>
          <nav aria-label={t.products.sections} className="mt-6">
            <ul className="flex flex-wrap gap-2">
              {data.categories.map((c) => (
                <li key={c.slug}>
                  <a href={`#${c.slug}`} className="chip hover:border-navy">
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
      </PageHeader>

      <div className="container-x space-y-12 py-10 lg:py-14">
        {data.categories.map((c) => (
          <section key={c.slug} id={c.slug} aria-labelledby={`${c.slug}-title`} className="scroll-mt-24">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id={`${c.slug}-title`} className="text-2xl font-bold">
                {c.name}
              </h2>
              <WhatsAppLink
                message={{ kind: 'product', name: c.name }}
                location="product_category"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-wa hover:underline"
              >
                <BrandIcon name="whatsapp" size={16} />
                {t.products.askCategory(c.name)}
              </WhatsAppLink>
            </div>

            {c.products.length === 0 ? (
              <div className="mt-5 flex flex-col items-start gap-4 rounded-card border border-dashed border-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-3 text-muted">
                  <Package aria-hidden="true" className="size-6 shrink-0 text-navy/40" />
                  {t.products.emptyCategory}
                </p>
                <WhatsAppLink message={{ kind: 'product', name: c.name }} location="product_category_empty" className="btn btn-wa btn-sm shrink-0">
                  <BrandIcon name="whatsapp" size={16} />
                  {t.common.askOnWhatsapp}
                </WhatsAppLink>
              </div>
            ) : (
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {c.products.map((p) => (
                  <li key={p.id} className="card flex flex-col p-3">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        width={400}
                        height={400}
                        loading="lazy"
                        decoding="async"
                        className="aspect-square w-full rounded-xl bg-bg object-contain"
                      />
                    ) : (
                      <div aria-hidden="true" className="grid aspect-square w-full place-items-center rounded-xl bg-bg">
                        <Package className="size-10 text-navy/25" />
                      </div>
                    )}
                    <h3 className="mt-3 px-1 text-sm font-bold">{p.name}</h3>
                    {p.spec && <p className="mt-1 flex-1 px-1 text-xs/relaxed text-muted">{p.spec}</p>}
                    <WhatsAppLink message={{ kind: 'product', name: p.name }} location="product_card" className="btn btn-wa btn-sm mt-3">
                      <BrandIcon name="whatsapp" size={16} />
                      {t.common.askOnWhatsapp}
                    </WhatsAppLink>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <CtaBand />
    </>
  )
}
