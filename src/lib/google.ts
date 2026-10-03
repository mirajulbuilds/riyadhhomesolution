import type { Site } from '@/content/types'

/** "Write a review" link. Falls back to the Maps link until the Place ID is set in admin. */
export function googleWriteReviewUrl(site: Site): string {
  return site.googlePlaceId
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(site.googlePlaceId)}`
    : site.mapsUrl
}

/** "See all reviews on Google" link. */
export function googleReviewsUrl(site: Site): string {
  return site.googlePlaceId
    ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(site.googlePlaceId)}`
    : site.mapsUrl
}
