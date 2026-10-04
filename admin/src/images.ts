import { compressImage } from '../../src/lib/image'
import type { Supabase } from './supabase'

/*
 * Photos live in public buckets, one folder per row:
 *   services  <service id>/<stamp>.webp         full size (max 1600 px)  → services.image_url
 *             <service id>/<stamp>-thumb.webp   600 px thumbnail (same name + "-thumb")
 *             categories/<category id>/<stamp>.webp   uploaded category illustration (max 800 px)
 *   products  <product id>/<stamp>.webp (+ -thumb)                        → products.image_url
 *   gallery   <gallery id>/<stamp>.webp (+ -thumb)                        → gallery.image_url / thumb_url
 *             <gallery id>/before-<stamp>.webp (+ -thumb)                 → gallery.before_image_url
 * Every write saves the new URL first and only then deletes the folder's other files, so a
 * replaced or removed photo never leaves files behind and a failed save never loses the old one.
 * (Safari cannot encode WebP; the shared helper then produces JPEG.)
 */

export type Bucket = 'services' | 'products' | 'gallery'
export const BUCKET: Bucket = 'services'

export interface ImageFile {
  name: string
  blob: Blob
}

/** The browser could not decode the file (e.g. an iPhone HEIC photo in Chrome): nothing is uploaded. */
export class UnreadableImageError extends Error {
  constructor(public fileName: string) {
    super(`unreadable: ${fileName}`)
  }
}

const extension = (blob: Blob) => (blob.type === 'image/webp' ? 'webp' : blob.type === 'image/png' ? 'png' : 'jpg')

/** compressImage, but a file the browser cannot read becomes an UnreadableImageError (never a broken upload). */
async function compress(file: File, options: { maxSize: number; quality: number }): Promise<Blob> {
  let blob: Blob
  try {
    blob = await compressImage(file, options)
  } catch {
    throw new UnreadableImageError(file.name)
  }
  if (!blob.size) throw new UnreadableImageError(file.name)
  return blob
}

/** Full size (1600 px) + 600 px thumbnail, named for the given stamp (and optional prefix). */
export async function photoVariants(file: File, stamp = newStamp(), prefix = ''): Promise<ImageFile[]> {
  const full = await compress(file, { maxSize: 1600, quality: 0.8 })
  const thumb = await compress(file, { maxSize: 600, quality: 0.8 })
  return [
    { name: `${prefix}${stamp}.${extension(full)}`, blob: full },
    { name: `${prefix}${stamp}-thumb.${extension(thumb)}`, blob: thumb },
  ]
}

/** Service and product photos use the same sizes. */
export const serviceVariants = (file: File, stamp = newStamp()) => photoVariants(file, stamp)

/** Category illustration: transparent artwork, so keep PNG when the browser can't make WebP. */
export async function illustrationVariant(file: File, stamp = newStamp()): Promise<ImageFile[]> {
  let blob: Blob = await compress(file, { maxSize: 800, quality: 0.85 })
  if (blob.type === 'image/jpeg' && file.type === 'image/png') blob = file
  return [{ name: `${stamp}.${extension(blob)}`, blob }]
}

export const newStamp = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

export const serviceFolder = (serviceId: string) => serviceId
export const categoryFolder = (categoryId: string) => `categories/${categoryId}`

/** The 600 px version of a stored photo (falls back to the URL itself for other images). */
export function thumbOf(url: string | null): string | null {
  if (!url) return null
  return /\/storage\/v1\/object\/public\/(services|products|gallery)\//.test(url) ? url.replace(/\.(webp|jpg|png)$/, '-thumb.$1') : url
}

/** Files of a folder (just the names). */
export async function listFolder(sb: Supabase, folder: string, bucket: Bucket = BUCKET): Promise<string[]> {
  const { data, error } = await sb.storage.from(bucket).list(folder, { limit: 1000 })
  if (error) throw new Error(error.message)
  return (data ?? []).filter((f) => f.id).map((f) => f.name)
}

/**
 * Deletes the files of a folder that `remove(name)` picks, then lists the folder again to be
 * sure they are gone. A failed request is tried again (up to 3 times, after a short pause), so a
 * bad connection does not leave files behind. Returns a warning, or null when the folder is clean.
 */
export async function cleanFolder(sb: Supabase, bucket: string, folder: string, remove: (name: string) => boolean, search?: string): Promise<string | null> {
  let failure: string | null = null
  let failures = 0
  for (let round = 0; round < 6 && failures < 3; round++) {
    try {
      // `search` narrows big shared folders (the reviews bucket's pending/) to the wanted files.
      const { data, error } = await sb.storage.from(bucket).list(folder, { limit: 1000, search })
      if (error) throw new Error(error.message)
      const old = (data ?? []).filter((f) => f.id && remove(f.name)).map((f) => `${folder}/${f.name}`)
      if (!old.length) return null
      const removed = await sb.storage.from(bucket).remove(old)
      if (removed.error) throw new Error(removed.error.message)
      // The next round lists the folder again: done when nothing is left.
      if ((removed.data ?? []).length < old.length) throw new Error('some files were not deleted')
    } catch (e) {
      failure = (e as Error).message
      failures++
      if (failures < 3) await new Promise((resolve) => setTimeout(resolve, 800 * failures))
    }
  }
  return failure ?? 'files still there'
}

/** Deletes the folder's files except `keep` (or only those matching `only`, when given). */
export const removeOthers = (sb: Supabase, folder: string, keep: string[], bucket: Bucket = BUCKET, only?: (name: string) => boolean) =>
  cleanFolder(sb, bucket, folder, (name) => !keep.includes(name) && (!only || only(name)))

/** Uploads files into a folder; on any failure the ones already uploaded are removed again. */
export async function uploadFiles(sb: Supabase, folder: string, files: ImageFile[], bucket: Bucket = BUCKET): Promise<string[]> {
  const uploaded: string[] = []
  for (const f of files) {
    const path = `${folder}/${f.name}`
    const { error } = await sb.storage.from(bucket).upload(path, f.blob, { contentType: f.blob.type, cacheControl: '31536000', upsert: false })
    if (error) {
      if (uploaded.length) await sb.storage.from(bucket).remove(uploaded)
      throw new Error(error.message)
    }
    uploaded.push(path)
  }
  return uploaded
}

export const publicUrl = (sb: Supabase, path: string, bucket: Bucket = BUCKET) => sb.storage.from(bucket).getPublicUrl(path).data.publicUrl

/**
 * Uploads the files into the folder, then calls save(url of the first file) to store it on the
 * row. On any failure the new files are removed and the old photo stays. Afterwards the folder's
 * old files are deleted (only those matching `only`, when given); a failed clean-up is returned
 * as a warning, not an error.
 */
export async function storeImage(
  sb: Supabase,
  folder: string,
  files: ImageFile[],
  save: (url: string) => PromiseLike<{ error: { message: string } | null }>,
  bucket: Bucket = BUCKET,
  only?: (name: string) => boolean,
): Promise<{ url: string; warning: string | null }> {
  const uploaded = await uploadFiles(sb, folder, files, bucket)
  const url = publicUrl(sb, uploaded[0], bucket)
  const saved = await save(url)
  if (saved.error) {
    await sb.storage.from(bucket).remove(uploaded)
    throw new Error(saved.error.message)
  }
  return { url, warning: await removeOthers(sb, folder, files.map((f) => f.name), bucket, only) }
}

/** Clears the photo on the row (save), then deletes the folder's files (only those matching `only`, when given). */
export async function clearImage(
  sb: Supabase,
  folder: string,
  save: () => PromiseLike<{ error: { message: string } | null }>,
  bucket: Bucket = BUCKET,
  only?: (name: string) => boolean,
): Promise<{ warning: string | null }> {
  const saved = await save()
  if (saved.error) throw new Error(saved.error.message)
  return { warning: await removeOthers(sb, folder, [], bucket, only) }
}

/** Deletes every file in a folder (after its row was deleted). */
export const removeFolder = (sb: Supabase, folder: string, bucket: Bucket = BUCKET) => removeOthers(sb, folder, [], bucket)
