import { useLoaderData } from 'react-router-dom'
import { Gallery } from '@/components/gallery/Gallery'
import { CtaBand } from '@/components/HomeBlocks'
import { PageHeader } from '@/components/PageHeader'
import { Seo } from '@/components/Seo'
import { useStrings } from '@/components/site-context'
import type { OurWorkData } from '@/content/view'

/** Our Work gallery (brief §6.5): filter by category, lightbox, before/after slider, area + date. */
export function Component() {
  const data = useLoaderData() as OurWorkData
  const t = useStrings()
  return (
    <>
      <Seo title={t.pages.ourWorkTitle} description={t.pages.ourWorkDescription} />
      <PageHeader title={t.pages.ourWorkTitle} lead={t.work.lead} />
      <div className="container-x py-10 lg:py-14">
        <Gallery items={data.items} categories={data.categories} />
      </div>
      <CtaBand />
    </>
  )
}
