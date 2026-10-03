import { compressImage } from './image'
import { getSupabase, isSupabaseConfigured } from './supabase'

export interface ReviewInput {
  name: string
  /** E.164, from normalizePhone(). Stored for verification only; never readable by visitors. */
  phone: string
  district: string | null
  service: string | null
  rating: number
  body: string
  photo: File | null
}

export type ReviewSubmitError = 'unavailable' | 'failed'

export class ReviewError extends Error {
  constructor(public reason: ReviewSubmitError) {
    super(reason)
  }
}

/**
 * Sends a website review: a row in public.reviews, then the optional photo → private "reviews"
 * bucket (pending/…). The database forces status=pending and source=website; nothing is
 * published before the owner approves it. There is no per-phone or per-connection limit: a
 * customer may review several jobs, and repeat numbers are shown to the owner instead.
 *
 * The row goes first so a rejected insert never leaves an orphan photo. If only the photo upload
 * fails, the review itself is still saved.
 */
export async function submitReview(input: ReviewInput): Promise<void> {
  if (!isSupabaseConfigured()) throw new ReviewError('unavailable')
  const db = await getSupabase()

  let photo: { blob: Blob; path: string } | null = null
  if (input.photo) {
    const blob = await compressImage(input.photo, { maxSize: 1200, quality: 0.8 })
    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
    photo = { blob, path: `pending/${crypto.randomUUID()}.${ext}` }
  }

  const { error } = await db.from('reviews').insert({
    name: input.name,
    phone: input.phone,
    district: input.district,
    service_text: input.service,
    rating: input.rating,
    body: input.body,
    // Private bucket: store the object path. The admin copies approved photos into "site".
    photo_url: photo ? `reviews/${photo.path}` : null,
  })
  if (error) throw new ReviewError('failed')

  if (photo) {
    await db.storage.from('reviews').upload(photo.path, photo.blob, { contentType: photo.blob.type, upsert: false })
  }
}
