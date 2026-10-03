import { compressImage } from './image'
import { getSupabase, isSupabaseConfigured } from './supabase'

export interface ReviewInput {
  name: string
  district: string | null
  service: string | null
  rating: number
  body: string
  photo: File | null
}

export type ReviewSubmitError = 'unavailable' | 'rate_limited' | 'failed'

export class ReviewError extends Error {
  constructor(public reason: ReviewSubmitError) {
    super(reason)
  }
}

/**
 * Sends a website review: optional photo → private "reviews" bucket (pending/…), then a row in
 * public.reviews. The database forces status=pending and source=website and rate-limits submissions.
 */
export async function submitReview(input: ReviewInput): Promise<void> {
  if (!isSupabaseConfigured()) throw new ReviewError('unavailable')
  const db = await getSupabase()

  let photoPath: string | null = null
  if (input.photo) {
    const blob = await compressImage(input.photo, { maxSize: 1200, quality: 0.8 })
    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
    const path = `pending/${crypto.randomUUID()}.${ext}`
    const { error } = await db.storage.from('reviews').upload(path, blob, { contentType: blob.type, upsert: false })
    if (error) throw new ReviewError('failed')
    // Private bucket: store the object path. The admin copies approved photos into "site".
    photoPath = `reviews/${path}`
  }

  const { error } = await db.from('reviews').insert({
    name: input.name,
    district: input.district,
    service_text: input.service,
    rating: input.rating,
    body: input.body,
    photo_url: photoPath,
  })
  if (error) {
    const rateLimited = error.hint === 'rate_limited' || /too many reviews/i.test(error.message)
    throw new ReviewError(rateLimited ? 'rate_limited' : 'failed')
  }
}
