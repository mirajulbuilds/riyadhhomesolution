import { useLoaderData } from 'react-router-dom'
import { PageHeader, Phase2Note } from '@/components/PageHeader'
import { Seo } from '@/components/Seo'
import { useStrings } from '@/components/site-context'
import type { OurWorkData } from '@/content/view'

export function Component() {
  const data = useLoaderData() as OurWorkData
  const t = useStrings()
  return (
    <>
      <Seo title={t.pages.ourWorkTitle} description={t.pages.ourWorkDescription} />
      <PageHeader title={t.pages.ourWorkTitle} lead={t.pages.ourWorkDescription}>
        <p className="mt-4 text-sm text-muted" dir="ltr" lang="en">
          {data.items.length} photos · {data.categories.length} filters
        </p>
      </PageHeader>
      <Phase2Note what="filterable gallery, lightbox, before/after slider" />
    </>
  )
}
