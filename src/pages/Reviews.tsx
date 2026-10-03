import { useLoaderData } from 'react-router-dom'
import { PageHeader, Phase2Note } from '@/components/PageHeader'
import { Seo } from '@/components/Seo'
import { useStrings } from '@/components/site-context'
import type { ReviewsData } from '@/content/view'

export function Component() {
  const data = useLoaderData() as ReviewsData
  const t = useStrings()
  return (
    <>
      <Seo title={t.pages.reviewsTitle} description={t.pages.reviewsDescription} />
      <PageHeader title={t.pages.reviewsTitle} lead={t.pages.reviewsDescription}>
        <p className="mt-4 text-sm text-muted" dir="ltr" lang="en">
          {data.reviews.length} approved site reviews · Google summary: {data.google ? 'cached' : 'not fetched yet'}
        </p>
      </PageHeader>
      <Phase2Note what="Google rating summary, reviews list, submit-review form" />
    </>
  )
}
