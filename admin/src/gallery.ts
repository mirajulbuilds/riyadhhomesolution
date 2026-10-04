import { GALLERY_COLUMNS, cleanGallery, type GalleryRow } from './data'
import { UnreadableImageError, cleanFolder, clearImage, newStamp, photoVariants, publicUrl, removeFolder, storeImage, thumbOf, uploadFiles, type ImageFile } from './images'
import type { Supabase } from './supabase'

/*
 * "Our work" photos, bucket "gallery", one folder per photo (see images.ts):
 *   <id>/<stamp>.webp + <stamp>-thumb.webp                 the photo ("after" when paired)
 *   <id>/before-<stamp>.webp + before-<stamp>-thumb.webp   optional "before" photo
 */

export const GALLERY_BUCKET = 'gallery' as const
const isBefore = (name: string) => name.startsWith('before-')
const isMain = (name: string) => !isBefore(name)
const thumbName = (path: string) => path.replace(/\.(webp|jpg|png)$/, '-thumb.$1')
/** "https://…/object/public/gallery/<id>/<file>" → "<id>/<file>". */
export const galleryPath = (url: string) => decodeURIComponent(url.split(`/object/public/${GALLERY_BUCKET}/`)[1] ?? '')

export type GalleryMeta = Omit<ReturnType<typeof cleanGallery>, 'sort_order'>

/** Uploads one prepared photo (full + thumbnail) and creates its row; a failed save removes the files. */
export async function addGalleryPhoto(sb: Supabase, files: ImageFile[], meta: GalleryMeta, sortOrder: number): Promise<GalleryRow> {
  const id = crypto.randomUUID()
  const uploaded = await uploadFiles(sb, id, files, GALLERY_BUCKET)
  const { data, error } = await sb
    .from('gallery')
    .insert({
      id,
      ...meta,
      sort_order: sortOrder,
      image_url: publicUrl(sb, uploaded[0], GALLERY_BUCKET),
      thumb_url: uploaded[1] ? publicUrl(sb, uploaded[1], GALLERY_BUCKET) : null,
    })
    .select(GALLERY_COLUMNS)
    .single()
  if (error) {
    await sb.storage.from(GALLERY_BUCKET).remove(uploaded)
    throw new Error(error.message)
  }
  return data as GalleryRow
}

export interface BatchFailure {
  file: string
  /** 'unreadable': the browser could not decode it (HEIC…); nothing was uploaded. */
  reason: 'unreadable' | 'error'
  message: string
}

/**
 * Many photos at once, one after the other: each is compressed, uploaded and saved on its own, so
 * one bad file never stops the rest. New photos go to the top of the list, in the order picked.
 */
export async function uploadGalleryBatch(
  sb: Supabase,
  files: File[],
  meta: GalleryMeta,
  firstSortOrder: number,
  onProgress: (done: number, row: GalleryRow | null, failure: BatchFailure | null) => void = () => {},
  prepare: (file: File) => Promise<ImageFile[]> = (file) => photoVariants(file),
): Promise<{ added: GalleryRow[]; failed: BatchFailure[] }> {
  const added: GalleryRow[] = []
  const failed: BatchFailure[] = []
  for (const [i, file] of files.entries()) {
    let row: GalleryRow | null = null
    let failure: BatchFailure | null = null
    try {
      row = await addGalleryPhoto(sb, await prepare(file), meta, firstSortOrder + i * 10)
      added.push(row)
    } catch (e) {
      failure = e instanceof UnreadableImageError ? { file: file.name, reason: 'unreadable', message: '' } : { file: file.name, reason: 'error', message: (e as Error).message }
      failed.push(failure)
    }
    onProgress(i + 1, row, failure)
  }
  return { added, failed }
}

/** Sort order for a batch of n new photos placed above the current first one. */
export const topSortOrder = (rows: Pick<GalleryRow, 'sort_order'>[], n: number) => (rows.length ? Math.min(...rows.map((r) => r.sort_order)) : 0) - n * 10

export async function saveGalleryFields(sb: Supabase, row: GalleryRow): Promise<void> {
  const { error } = await sb.from('gallery').update(cleanGallery(row)).eq('id', row.id).select('id').single()
  if (error) throw new Error(error.message)
}

/** Replaces the photo itself (the "after" photo of a pair). */
export async function replaceMainPhoto(sb: Supabase, id: string, files: ImageFile[]) {
  return storeImage(sb, id, files, (u) => sb.from('gallery').update({ image_url: u, thumb_url: thumbOf(u) }).eq('id', id).select('id').single(), GALLERY_BUCKET, isMain)
}

/** Files for a "before" photo (named before-<stamp>…). */
export const beforeVariants = (file: File) => photoVariants(file, newStamp(), 'before-')

/** Adds or replaces the "before" photo. */
export async function setBeforePhoto(sb: Supabase, id: string, files: ImageFile[]) {
  return storeImage(sb, id, files, (u) => sb.from('gallery').update({ before_image_url: u }).eq('id', id).select('id').single(), GALLERY_BUCKET, isBefore)
}

export async function removeBeforePhoto(sb: Supabase, id: string) {
  return clearImage(sb, id, () => sb.from('gallery').update({ before_image_url: null }).eq('id', id).select('id').single(), GALLERY_BUCKET, isBefore)
}

/**
 * Pairs two uploaded photos: `before` becomes the "before" photo of `after`. Its files are copied
 * into the "after" folder, then the separate "before" entry and its files are deleted.
 */
export async function pairExisting(sb: Supabase, after: Pick<GalleryRow, 'id'>, before: Pick<GalleryRow, 'id' | 'image_url'>): Promise<{ url: string; warning: string | null }> {
  if (after.id === before.id) throw new Error('same photo')
  const source = galleryPath(before.image_url)
  const ext = source.slice(source.lastIndexOf('.') + 1)
  const target = `${after.id}/before-${newStamp()}.${ext}`
  const copy = await sb.storage.from(GALLERY_BUCKET).copy(source, target)
  if (copy.error) throw new Error(copy.error.message)
  const copied = [target]
  const thumbCopy = await sb.storage.from(GALLERY_BUCKET).copy(thumbName(source), thumbName(target))
  if (!thumbCopy.error) copied.push(thumbName(target))
  const url = publicUrl(sb, target, GALLERY_BUCKET)
  const saved = await sb.from('gallery').update({ before_image_url: url }).eq('id', after.id).select('id').single()
  if (saved.error) {
    await sb.storage.from(GALLERY_BUCKET).remove(copied)
    throw new Error(saved.error.message)
  }
  const warnings = [await removeOldBefore(sb, after.id, copied)]
  const { error } = await sb.from('gallery').delete().eq('id', before.id).select('id').single()
  warnings.push(error ? error.message : await removeFolder(sb, before.id, GALLERY_BUCKET))
  return { url, warning: warnings.filter(Boolean).join('; ') || null }
}

function removeOldBefore(sb: Supabase, id: string, keep: string[]): Promise<string | null> {
  const names = keep.map((p) => p.slice(p.lastIndexOf('/') + 1))
  return cleanFolder(sb, GALLERY_BUCKET, id, (name) => isBefore(name) && !names.includes(name))
}

/** Deletes the row, then every file in its folder. */
export async function deleteGalleryPhoto(sb: Supabase, id: string): Promise<{ warning: string | null }> {
  const { error } = await sb.from('gallery').delete().eq('id', id).select('id').single()
  if (error) throw new Error(error.message)
  return { warning: await removeFolder(sb, id, GALLERY_BUCKET) }
}
