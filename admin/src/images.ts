import { compressImage } from '../../src/lib/image'
import type { Supabase } from './supabase'

/*
 * Photos live in the public "services" bucket:
 *   <service id>/<stamp>.webp         full size (max 1600 px)  → services.image_url
 *   <service id>/<stamp>-thumb.webp   600 px thumbnail (same name + "-thumb")
 *   categories/<category id>/<stamp>.webp   uploaded category illustration (max 800 px)
 * Every write saves the new URL first and only then deletes the folder's other files, so a
 * replaced or removed photo never leaves files behind and a failed save never loses the old one.
 * (Safari cannot encode WebP; the shared helper then produces JPEG.)
 */

export const BUCKET = 'services'

export interface ImageFile {
  name: string
  blob: Blob
}

const extension = (blob: Blob) => (blob.type === 'image/webp' ? 'webp' : blob.type === 'image/png' ? 'png' : 'jpg')

/** Full size + thumbnail for a service photo, named for the given stamp. */
export async function serviceVariants(file: File, stamp = newStamp()): Promise<ImageFile[]> {
  const full = await compressImage(file, { maxSize: 1600, quality: 0.8 })
  const thumb = await compressImage(file, { maxSize: 600, quality: 0.8 })
  return [
    { name: `${stamp}.${extension(full)}`, blob: full },
    { name: `${stamp}-thumb.${extension(thumb)}`, blob: thumb },
  ]
}

/** Category illustration: transparent artwork, so keep PNG when the browser can't make WebP. */
export async function illustrationVariant(file: File, stamp = newStamp()): Promise<ImageFile[]> {
  let blob: Blob = await compressImage(file, { maxSize: 800, quality: 0.85 })
  if (blob.type === 'image/jpeg' && file.type === 'image/png') blob = file
  return [{ name: `${stamp}.${extension(blob)}`, blob }]
}

export const newStamp = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

export const serviceFolder = (serviceId: string) => serviceId
export const categoryFolder = (categoryId: string) => `categories/${categoryId}`

/** The 600 px version of a stored service photo (falls back to the URL itself for other images). */
export function thumbOf(url: string | null): string | null {
  if (!url) return null
  return url.includes(`/storage/v1/object/public/${BUCKET}/`) ? url.replace(/\.(webp|jpg|png)$/, '-thumb.$1') : url
}

async function removeOthers(sb: Supabase, folder: string, keep: string[]): Promise<string | null> {
  const { data, error } = await sb.storage.from(BUCKET).list(folder, { limit: 1000 })
  if (error) return error.message
  const old = (data ?? []).filter((f) => f.id && !keep.includes(f.name)).map((f) => `${folder}/${f.name}`)
  if (!old.length) return null
  const removed = await sb.storage.from(BUCKET).remove(old)
  return removed.error ? removed.error.message : null
}

/**
 * Uploads the files into the folder, then calls save(url of the first file) to store it on the
 * row. On any failure the new files are removed and the old photo stays. Afterwards the folder's
 * old files are deleted; a failed clean-up is returned as a warning, not an error.
 */
export async function storeImage(
  sb: Supabase,
  folder: string,
  files: ImageFile[],
  save: (url: string) => PromiseLike<{ error: { message: string } | null }>,
): Promise<{ url: string; warning: string | null }> {
  const uploaded: string[] = []
  const undo = () => (uploaded.length ? sb.storage.from(BUCKET).remove(uploaded) : null)
  for (const f of files) {
    const path = `${folder}/${f.name}`
    const { error } = await sb.storage.from(BUCKET).upload(path, f.blob, { contentType: f.blob.type, cacheControl: '31536000', upsert: false })
    if (error) {
      await undo()
      throw new Error(error.message)
    }
    uploaded.push(path)
  }
  const url = sb.storage.from(BUCKET).getPublicUrl(uploaded[0]).data.publicUrl
  const saved = await save(url)
  if (saved.error) {
    await undo()
    throw new Error(saved.error.message)
  }
  return { url, warning: await removeOthers(sb, folder, files.map((f) => f.name)) }
}

/** Clears the photo on the row (save), then deletes every file in the folder. */
export async function clearImage(
  sb: Supabase,
  folder: string,
  save: () => PromiseLike<{ error: { message: string } | null }>,
): Promise<{ warning: string | null }> {
  const saved = await save()
  if (saved.error) throw new Error(saved.error.message)
  return { warning: await removeOthers(sb, folder, []) }
}

/** Deletes every file in a folder (after its service was deleted). */
export const removeFolder = (sb: Supabase, folder: string) => removeOthers(sb, folder, [])
