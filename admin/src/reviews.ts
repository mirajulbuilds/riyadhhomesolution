import { REVIEW_COLUMNS, type ReviewRow, type ReviewSource, type ReviewStatus } from './data'
import { cleanFolder, newStamp, type ImageFile } from './images'
import type { Supabase } from './supabase'

/*
 * Review photos.
 *   Private bucket "reviews" (only admins can open it):
 *     pending/<uuid>.<ext>                    sent with a website review (public form, unchanged)
 *     manual/<review id>/<stamp>.webp (+ -thumb)   added by the owner with a manual review
 *     → reviews.photo_path (admin-only column)
 *   Public bucket "site": a COPY, only while the review is approved:
 *     reviews/<review id>/<stamp>.<ext> (+ -thumb when the original has one) → reviews.photo_url
 * Approving makes the copy and saves its URL in the same update as the status; rejecting, moving
 * back to pending or deleting clears photo_url and deletes the copy. Every status change also
 * deletes any stale file in the review's public folder, so nothing is left behind. The database
 * refuses photo_url on a review that is not approved.
 */

export const PRIVATE_BUCKET = 'reviews'
export const PUBLIC_BUCKET = 'site'
export const publicFolder = (reviewId: string) => `reviews/${reviewId}`
export const thumbPath = (path: string) => path.replace(/\.(webp|jpg|jpeg|png)$/, '-thumb.$1')
const baseName = (path: string) => path.slice(path.lastIndexOf('/') + 1)
const isNotFound = (error: { message: string; statusCode?: string | number; status?: number }) =>
  String(error.statusCode ?? error.status ?? '') === '404' || /not.?found/i.test(error.message)

type Sb = Supabase

/** A link to the private original that works for one hour (admins only). */
export async function privatePhotoUrl(sb: Sb, path: string): Promise<string | null> {
  const { data } = await sb.storage.from(PRIVATE_BUCKET).createSignedUrl(path, 3600)
  return data?.signedUrl ?? null
}

/** Deletes the files in the review's public folder, except `keep`. Returns a warning or null. */
const clearPublicCopy = (sb: Sb, reviewId: string, keep: string[] = []) => cleanFolder(sb, PUBLIC_BUCKET, publicFolder(reviewId), (name) => !keep.includes(name))

/** Copies the private photo (and its thumbnail, if any) into the public folder. */
async function makePublicCopy(sb: Sb, reviewId: string, photoPath: string | null): Promise<{ url: string | null; copied: string[]; missing: boolean }> {
  if (!photoPath) return { url: null, copied: [], missing: false }
  const ext = photoPath.slice(photoPath.lastIndexOf('.') + 1)
  const main = `${publicFolder(reviewId)}/${newStamp()}.${ext}`
  const copy = await sb.storage.from(PRIVATE_BUCKET).copy(photoPath, main, { destinationBucket: PUBLIC_BUCKET })
  if (copy.error) {
    // The visitor's upload may have failed after the review was saved: approve without a photo.
    if (isNotFound(copy.error)) return { url: null, copied: [], missing: true }
    throw new Error(copy.error.message)
  }
  const copied = [main]
  const thumb = thumbPath(main)
  const thumbCopy = await sb.storage.from(PRIVATE_BUCKET).copy(thumbPath(photoPath), thumb, { destinationBucket: PUBLIC_BUCKET })
  if (!thumbCopy.error) copied.push(thumb)
  return { url: sb.storage.from(PUBLIC_BUCKET).getPublicUrl(main).data.publicUrl, copied, missing: false }
}

export interface ReviewResult {
  review: ReviewRow
  /** Clean-up of old public files failed (the change itself was saved). */
  warning: string | null
  /** Approved, but the customer's photo file does not exist. */
  photoMissing: boolean
}

/** Approve / reject / back to pending. Approving publishes a copy of the photo; anything else removes it. */
export async function setReviewStatus(sb: Sb, review: Pick<ReviewRow, 'id' | 'photo_path'>, status: ReviewStatus): Promise<ReviewResult> {
  if (status === 'approved') {
    const { url, copied, missing } = await makePublicCopy(sb, review.id, review.photo_path)
    const { data, error } = await sb.from('reviews').update({ status, photo_url: url }).eq('id', review.id).select(REVIEW_COLUMNS).single()
    if (error) {
      if (copied.length) await sb.storage.from(PUBLIC_BUCKET).remove(copied)
      throw new Error(error.message)
    }
    return { review: data as ReviewRow, warning: await clearPublicCopy(sb, review.id, copied.map(baseName)), photoMissing: missing }
  }
  const { data, error } = await sb.from('reviews').update({ status, photo_url: null }).eq('id', review.id).select(REVIEW_COLUMNS).single()
  if (error) throw new Error(error.message)
  return { review: data as ReviewRow, warning: await clearPublicCopy(sb, review.id), photoMissing: false }
}

/** Fixes the text and/or the internal note. The database keeps the customer's original text. */
export async function editReview(sb: Sb, id: string, changes: { body: string; admin_note: string | null }): Promise<ReviewRow> {
  const { data, error } = await sb.from('reviews').update(changes).eq('id', id).select(REVIEW_COLUMNS).single()
  if (error) throw new Error(error.message)
  return data as ReviewRow
}

/** Deletes the review, then its private photo (+ thumbnail) and any public copy. */
export async function deleteReview(sb: Sb, review: Pick<ReviewRow, 'id' | 'photo_path'>): Promise<{ warning: string | null }> {
  const { error } = await sb.from('reviews').delete().eq('id', review.id).select('id').single()
  if (error) throw new Error(error.message)
  const warnings: string[] = []
  if (review.photo_path) {
    const path = review.photo_path
    const folder = path.slice(0, path.lastIndexOf('/'))
    const stem = baseName(path).replace(/\.[a-z]+$/, '')
    const privateWarning = await cleanFolder(sb, PRIVATE_BUCKET, folder, (name) => name === baseName(path) || name === baseName(thumbPath(path)), stem)
    if (privateWarning) warnings.push(privateWarning)
  }
  const publicWarning = await clearPublicCopy(sb, review.id)
  if (publicWarning) warnings.push(publicWarning)
  return { warning: warnings.join('; ') || null }
}

export interface ManualReview {
  name: string
  district: string | null
  service_text: string | null
  rating: number
  body: string
  phone: string | null
  source: Exclude<ReviewSource, 'website'>
  admin_note: string | null
}

/**
 * A review the owner adds by hand (from WhatsApp, in person, …): saved as approved. The optional
 * photo goes to the private bucket first and is then copied to the public folder, like an approved
 * website review. A failed save removes every uploaded file.
 */
export async function addManualReview(sb: Sb, input: ManualReview, photo: ImageFile[] | null): Promise<ReviewRow> {
  const id = crypto.randomUUID()
  const privatePaths: string[] = []
  let copied: string[] = []
  const undo = async () => {
    if (privatePaths.length) await sb.storage.from(PRIVATE_BUCKET).remove(privatePaths)
    if (copied.length) await sb.storage.from(PUBLIC_BUCKET).remove(copied)
  }
  try {
    for (const f of photo ?? []) {
      const path = `manual/${id}/${f.name}`
      const { error } = await sb.storage.from(PRIVATE_BUCKET).upload(path, f.blob, { contentType: f.blob.type, upsert: false })
      if (error) throw new Error(error.message)
      privatePaths.push(path)
    }
    const copy = await makePublicCopy(sb, id, privatePaths[0] ?? null)
    copied = copy.copied
    const { data, error } = await sb
      .from('reviews')
      .insert({ id, ...input, status: 'approved', photo_path: privatePaths[0] ?? null, photo_url: copy.url })
      .select(REVIEW_COLUMNS)
      .single()
    if (error) throw new Error(error.message)
    return data as ReviewRow
  } catch (e) {
    await undo()
    throw e
  }
}
