import { ChevronLeft, ExternalLink, MapPin, Quote } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import type { GoogleSummary as GoogleSummaryData, Review } from '@/content/types'
import { googleReviewsUrl, googleWriteReviewUrl } from '@/lib/google'
import { useSite, useStrings } from '../site-context'
import { Stars } from '../ui/Stars'

type GoogleReview = GoogleSummaryData['reviews'][number]

function formatMonth(iso: string, lang: 'ar' | 'en') {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  // Gregorian months with Latin digits in both languages, matching the rest of the site.
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', { month: 'long', year: 'numeric' }).format(date)
}

/** A review submitted on our website (approved by the owner). */
export function ReviewCard({ review }: { review: Review }) {
  const { lang } = useSite()
  const t = useStrings()
  return (
    <article className="card flex h-full flex-col p-6">
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} label={t.reviews.stars(review.rating)} />
        <Quote aria-hidden="true" className="size-6 text-orange/50" />
      </div>
      <p className="mt-4 flex-1 leading-relaxed whitespace-pre-line text-ink">{review.body}</p>
      <footer className="mt-5 border-t border-line pt-4 text-sm">
        <p className="font-bold text-navy">{review.name}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
          {review.district && (
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden="true" className="size-3.5" />
              {review.district}
            </span>
          )}
          {review.service && <span>{review.service}</span>}
          <time dateTime={review.createdAt} suppressHydrationWarning>
            {formatMonth(review.createdAt, lang)}
          </time>
        </p>
      </footer>
    </article>
  )
}

/** A Google review, shown with the author's name, photo and Google attribution (Places API terms). */
export function GoogleReviewCard({ review }: { review: GoogleReview }) {
  const t = useStrings()
  const author = review.authorUri ? (
    <a href={review.authorUri} target="_blank" rel="noopener" className="font-bold text-navy hover:underline">
      {review.authorName}
    </a>
  ) : (
    <span className="font-bold text-navy">{review.authorName}</span>
  )
  return (
    <article className="card flex h-full flex-col p-6">
      <header className="flex items-center gap-3">
        {review.authorPhotoUri ? (
          <img
            src={review.authorPhotoUri}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="size-10 rounded-full bg-bg object-cover"
          />
        ) : (
          <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-navy/8 font-bold text-navy">
            {review.authorName.slice(0, 1)}
          </span>
        )}
        <div className="min-w-0 text-sm">
          {author}
          {review.relativePublishTimeDescription && <p className="text-muted">{review.relativePublishTimeDescription}</p>}
        </div>
      </header>
      <div className="mt-4">
        <Stars rating={review.rating} label={t.reviews.stars(review.rating)} />
      </div>
      {review.text && <p className="mt-3 line-clamp-6 flex-1 leading-relaxed text-ink">{review.text}</p>}
      <p className="mt-4 text-xs text-muted">{t.reviews.fromGoogle}</p>
    </article>
  )
}

/** Google rating badge: score, stars, count, links to Google. */
export function GoogleSummary({ google }: { google: GoogleSummaryData | null }) {
  const site = useSite()
  const t = useStrings()
  const rating = google?.rating ?? null
  return (
    <div className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-muted">{t.reviews.googleRating}</p>
        {rating !== null ? (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-4xl font-bold text-navy" dir="ltr">
              {rating.toFixed(1)}
            </span>
            <div>
              <Stars rating={rating} label={t.reviews.stars(Number(rating.toFixed(1)))} size={20} />
              {google?.count != null && <p className="mt-1 text-sm text-muted">{t.reviews.basedOn(google.count)}</p>}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">{t.reviews.none}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={googleWriteReviewUrl(site)} target="_blank" rel="noopener" className="btn btn-sm bg-navy text-white hover:bg-navy-deep">
          {t.reviews.writeOnGoogle}
        </a>
        {rating !== null && (
          <a href={googleReviewsUrl(site)} target="_blank" rel="noopener" className="btn btn-outline btn-sm">
            {t.reviews.seeOnGoogle}
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        )}
      </div>
    </div>
  )
}

/** Horizontal, swipeable list with prev/next buttons (plain scrolling still works without JS). */
export function Carousel({ label, children }: { label: string; children: ReactNode[] }) {
  const t = useStrings()
  const track = useRef<HTMLUListElement>(null)
  const scroll = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    const rtl = getComputedStyle(el).direction === 'rtl'
    const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth
    el.scrollBy({ left: dir * (rtl ? -1 : 1) * (step + 16), behavior: 'smooth' })
  }
  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      <ul ref={track} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:thin]">
        {children.map((child, i) => (
          <li key={i} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]">
            {child}
          </li>
        ))}
      </ul>
      {children.length > 1 && (
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => scroll(-1)} className="btn btn-outline btn-sm px-3" aria-label={t.common.previous}>
            <ChevronLeft aria-hidden="true" className="size-5 rtl:-scale-x-100" />
          </button>
          <button type="button" onClick={() => scroll(1)} className="btn btn-outline btn-sm px-3" aria-label={t.common.next}>
            <ChevronLeft aria-hidden="true" className="size-5 ltr:-scale-x-100" />
          </button>
        </div>
      )}
    </div>
  )
}
