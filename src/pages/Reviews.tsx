import { useLoaderData } from 'react-router-dom'
import { ReviewForm } from '@/components/forms/ReviewForm'
import { PageHeader } from '@/components/PageHeader'
import { GoogleReviewCard, GoogleSummary, ReviewCard } from '@/components/reviews/ReviewCards'
import { Seo } from '@/components/Seo'
import { useStrings } from '@/components/site-context'
import type { ReviewsData } from '@/content/view'

/** Reviews (brief §6.6): Google summary + Google reviews + approved site reviews + submit form. */
export function Component() {
  const data = useLoaderData() as ReviewsData
  const t = useStrings()
  const googleReviews = data.google?.reviews ?? []

  return (
    <>
      <Seo title={t.pages.reviewsTitle} description={t.pages.reviewsDescription} />
      <PageHeader title={t.pages.reviewsTitle} lead={t.reviews.lead} />

      <div className="container-x space-y-12 py-10 lg:py-14">
        <GoogleSummary google={data.google} />

        {googleReviews.length > 0 && (
          <section aria-labelledby="google-reviews">
            <h2 id="google-reviews" className="text-2xl font-bold">
              {t.reviews.fromGoogle}
            </h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {googleReviews.map((r, i) => (
                <li key={`${r.authorName}-${i}`}>
                  <GoogleReviewCard review={r} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.reviews.length > 0 && (
          <section aria-labelledby="site-reviews">
            <h2 id="site-reviews" className="text-2xl font-bold">
              {t.reviews.siteReviews}
            </h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.reviews.map((r) => (
                <li key={r.id}>
                  <ReviewCard review={r} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="review-form" className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <h2 id="review-form" className="text-2xl font-bold sm:text-3xl">
              {t.reviewForm.title}
            </h2>
            <p className="mt-3 text-lg/relaxed text-muted">{t.reviewForm.lead}</p>
          </div>
          <ReviewForm serviceOptions={data.serviceOptions} />
        </section>
      </div>
    </>
  )
}
