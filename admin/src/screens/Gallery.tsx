import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { GALLERY_COLUMNS, cleanGallery, move, renumber, type CategoryRow, type GalleryRow } from '../data'
import { DistrictField, districtName, useAreas, type Area } from '../district'
import { Badge, DragHandle, MoveButtons, PageTitle, Pair, Select, TextArea, Toggle, useDragList } from '../form'
import {
  beforeVariants,
  deleteGalleryPhoto,
  pairExisting,
  removeBeforePhoto,
  replaceMainPhoto,
  saveGalleryFields,
  setBeforePhoto,
  topSortOrder,
  uploadGalleryBatch,
  type BatchFailure,
  type GalleryMeta,
} from '../gallery'
import { useT, type Strings } from '../i18n'
import { UnreadableImageError, photoVariants, thumbOf } from '../images'
import { useNav, useUnsavedGuard } from '../nav'
import type { Supabase } from '../supabase'
import { useToast } from '../toast'
import { Button, Card, Field, Notice } from '../ui'
import { SaveBar } from './Categories'

/** "Our work" photos: upload many, filter, reorder, edit, pair before/after, delete. */
export function Gallery({ sb }: { sb: Supabase }) {
  const { route } = useNav()
  return route.params.id ? <GalleryForm key={route.params.id} sb={sb} id={route.params.id} /> : <GalleryList sb={sb} />
}

type CategoryName = Pick<CategoryRow, 'id' | 'name_ar' | 'name_en'>

function useGallery(sb: Supabase) {
  const [rows, setRows] = useState<GalleryRow[] | null>(null)
  const [categories, setCategories] = useState<CategoryName[]>([])
  const [failed, setFailed] = useState(false)
  const load = useCallback(async () => {
    const [g, c] = await Promise.all([
      sb.from('gallery').select(GALLERY_COLUMNS).order('sort_order').order('taken_on', { ascending: false, nullsFirst: false }),
      sb.from('categories').select('id, name_ar, name_en').order('sort_order'),
    ])
    if (g.error || c.error) return setFailed(true)
    setRows(g.data as GalleryRow[])
    setCategories(c.data as CategoryName[])
  }, [sb])
  useEffect(() => void load(), [load])
  return { rows, setRows, categories, failed, reload: load }
}

/** Message for one file that could not be uploaded. */
export const failureText = (t: Strings, f: BatchFailure) => (f.reason === 'unreadable' ? t.unreadableImage(f.file) : `${f.file}: ${f.message}`)

const ACCEPT = 'image/*,.heic,.heif'

/** Thumbnail of a gallery photo; a before/after pair shows both halves. */
function PairThumb({ row, size = 'size-16' }: { row: GalleryRow; size?: string }) {
  const { t } = useT()
  const after = row.thumb_url ?? row.image_url
  if (!row.before_image_url) return <img src={after} alt="" loading="lazy" className={`${size} shrink-0 rounded-lg bg-bg object-cover`} />
  return (
    <span className="flex shrink-0 gap-0.5" title={`${t.before} / ${t.after}`}>
      <img src={thumbOf(row.before_image_url)!} alt={t.before} loading="lazy" className={`${size} rounded-s-lg bg-bg object-cover`} />
      <img src={after} alt={t.after} loading="lazy" className={`${size} rounded-e-lg bg-bg object-cover`} />
    </span>
  )
}

function GalleryList({ sb }: { sb: Supabase }) {
  const { t, lang } = useT()
  const { go } = useNav()
  const toast = useToast()
  const { rows, setRows, categories, failed, reload } = useGallery(sb)
  const areas = useAreas(sb)
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [district, setDistrict] = useState('')

  const catName = (id: string | null) => {
    const c = categories.find((x) => x.id === id)
    return c ? (lang === 'ar' ? c.name_ar : c.name_en) : ''
  }
  const filtered = !!(category || status || district)
  const visible = useMemo(
    () =>
      (rows ?? []).filter(
        (r) =>
          (!category || (category === 'none' ? !r.category_id : r.category_id === category)) &&
          (!status || (status === 'active' ? r.is_active : !r.is_active)) &&
          (!district || (district === 'none' ? !r.district : r.district === district)),
      ),
    [rows, category, status, district],
  )
  // District filter: the service areas, plus any free-text districts in use.
  const districtOptions = useMemo(() => {
    const typed = [...new Set((rows ?? []).map((r) => r.district).filter((d): d is string => !!d && !areas.some((a) => a.key === d)))]
    return [...areas.map((a) => ({ value: a.key, label: a[lang] })), ...typed.map((d) => ({ value: d, label: d }))]
  }, [rows, areas, lang])

  async function reorder(from: number, to: number) {
    if (!rows) return
    const next = move(rows, from, to)
    const changes = renumber(next)
    setRows(next.map((r, i) => ({ ...r, sort_order: (i + 1) * 10 })))
    const results = await Promise.all(changes.map((c) => sb.from('gallery').update({ sort_order: c.sort_order }).eq('id', c.id).select('id')))
    const bad = results.find((r) => r.error || !r.data?.length)
    if (bad) {
      toast('error', t.saveFailed(bad.error?.message ?? '—'))
      void reload()
    } else toast('ok', t.orderSaved)
  }
  const drag = useDragList((a, b) => void reorder(a, b))

  return (
    <div className="space-y-5">
      <PageTitle title={t.navGallery} />
      <GalleryUpload sb={sb} rows={rows} categories={categories} areas={areas} onAdded={(row) => setRows((all) => [row, ...(all ?? [])].sort((a, b) => a.sort_order - b.sort_order))} />

      <div className="grid grid-cols-3 gap-2">
        <Select label={t.filterCategory} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">{t.all}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {lang === 'ar' ? c.name_ar : c.name_en}
            </option>
          ))}
          <option value="none">{t.noCategory}</option>
        </Select>
        <Select label={t.filterStatus} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{t.all}</option>
          <option value="active">{t.statusActive}</option>
          <option value="hidden">{t.statusHidden}</option>
        </Select>
        <Select label={t.district} value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option value="">{t.all}</option>
          {districtOptions.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
          <option value="none">{t.noDistrict}</option>
        </Select>
      </div>

      {failed && <Notice>{t.loadFailed}</Notice>}
      {!rows && !failed && <p className="text-muted">{t.loading}</p>}
      {rows && (
        <p className="text-sm text-muted">
          {t.photoCount(visible.length)}
          {filtered && ` · ${t.reorderHint}`}
        </p>
      )}
      {rows && rows.length > 0 && visible.length === 0 && <Notice tone="info">{t.noResults}</Notice>}

      <ul className="space-y-2">
        {visible.map((r, i) => {
          const row = drag.row(i)
          return (
            <li
              key={r.id}
              {...(!filtered ? { onDragOver: row.onDragOver, onDrop: row.onDrop } : {})}
              className={`flex items-center gap-2 rounded-2xl border border-line bg-white p-2 ${!filtered ? row.className : ''}`}
            >
              {!filtered && <DragHandle {...drag.handle(i)} />}
              <button type="button" onClick={() => go('gallery', { id: r.id })} className="flex min-h-12 min-w-0 flex-1 items-center gap-3 text-start">
                <PairThumb row={r} />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{(lang === 'ar' ? r.caption_ar : r.caption_en) || (lang === 'ar' ? r.caption_en : r.caption_ar) || t.noCaption}</span>
                  <span className="block truncate text-xs text-muted">
                    {[catName(r.category_id), districtName(r.district, areas, lang), r.taken_on].filter(Boolean).join(' · ')}
                  </span>
                  <span className="flex flex-wrap gap-1 pt-1">
                    {r.before_image_url && <Badge tone="navy">{t.before} / {t.after}</Badge>}
                    {!r.is_active && <Badge tone="warn">{t.hiddenBadge}</Badge>}
                  </span>
                </span>
              </button>
              {!filtered && <MoveButtons index={i} count={visible.length} onMove={(a, b) => void reorder(a, b)} className="sm:hidden" />}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Upload card: details applied to every photo of the batch, then pick or drop the files. */
function GalleryUpload({ sb, rows, categories, areas, onAdded }: { sb: Supabase; rows: GalleryRow[] | null; categories: CategoryName[]; areas: Area[]; onAdded: (row: GalleryRow) => void }) {
  const { t, lang } = useT()
  const toast = useToast()
  const [meta, setMeta] = useState<GalleryMeta>({ category_id: null, district: null, caption_ar: null, caption_en: null, taken_on: null, is_active: true })
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(0)
  const [total, setTotal] = useState(0)
  const [failures, setFailures] = useState<BatchFailure[]>([])
  const [dragOver, setDragOver] = useState(false)
  useUnsavedGuard(running)

  async function upload(list: FileList | File[]) {
    const files = Array.from(list).filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name))
    if (!files.length || !rows) return
    setRunning(true)
    setDone(0)
    setTotal(files.length)
    setFailures([])
    const { added, failed } = await uploadGalleryBatch(sb, files, meta, topSortOrder(rows, files.length), (n, row, failure) => {
      setDone(n)
      if (row) onAdded(row)
      if (failure) setFailures((all) => [...all, failure])
    })
    setRunning(false)
    toast(failed.length ? 'error' : 'ok', t.uploadSummary(added.length, failed.length))
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (!running) void upload(e.dataTransfer.files)
  }

  return (
    <Card title={t.addPhotos}>
      <div className="space-y-4">
        <p className="text-sm text-muted">{t.galleryUploadHelp}</p>
        <details className="rounded-xl border border-line px-4 py-2">
          <summary className="flex min-h-10 cursor-pointer items-center font-semibold text-navy">{t.batchDetails}</summary>
        <div className="grid gap-3 pt-2 pb-2 sm:grid-cols-3">
          <Select label={t.category} value={meta.category_id ?? ''} onChange={(e) => setMeta({ ...meta, category_id: e.target.value || null })}>
            <option value="">{t.none}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {lang === 'ar' ? c.name_ar : c.name_en}
              </option>
            ))}
          </Select>
          <DistrictField value={meta.district} onChange={(v) => setMeta({ ...meta, district: v })} areas={areas} />
          <Field label={t.takenOn} type="date" value={meta.taken_on ?? ''} onChange={(e) => setMeta({ ...meta, taken_on: e.target.value || null })} />
        </div>
        </details>
        <label
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center font-semibold text-navy ${
            dragOver ? 'border-orange bg-orange/10' : 'border-line bg-white'
          } ${running || !rows ? 'pointer-events-none opacity-50' : ''}`}
        >
          {t.dropHere}
          <input
            type="file"
            accept={ACCEPT}
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) void upload(e.target.files)
              e.target.value = ''
            }}
          />
        </label>
        {(running || done > 0) && total > 0 && (
          <div>
            <p className="text-sm font-semibold">{running ? t.uploadProgress(Math.min(done + 1, total), total) : t.uploadSummary(done - failures.length, failures.length)}</p>
            <progress className="h-2 w-full accent-navy" value={done} max={total} />
          </div>
        )}
        {failures.length > 0 && (
          <Notice>
            {t.failedFiles}
            <span className="mt-1 block space-y-1">
              {failures.map((f) => (
                <span key={f.file} className="block">
                  • {failureText(t, f)}
                </span>
              ))}
            </span>
          </Notice>
        )}
      </div>
    </Card>
  )
}

function GalleryForm({ sb, id }: { sb: Supabase; id: string }) {
  const { t, lang } = useT()
  const { go } = useNav()
  const toast = useToast()
  const { rows, setRows, categories, failed } = useGallery(sb)
  const areas = useAreas(sb)
  const [row, setRow] = useState<GalleryRow | null>(null)
  const saved = useRef('')
  const [busy, setBusy] = useState(false)
  const [picking, setPicking] = useState(false)

  useEffect(() => {
    if (!rows || row) return
    const found = rows.find((r) => r.id === id)
    if (!found) return
    saved.current = JSON.stringify(cleanGallery(found))
    setRow(found)
  }, [rows, id, row])

  const dirty = Boolean(row && JSON.stringify(cleanGallery(row)) !== saved.current)
  useUnsavedGuard(dirty || busy)

  if (failed) return <Notice>{t.loadFailed}</Notice>
  if (rows && !rows.some((r) => r.id === id)) return <Notice>{t.loadFailed}</Notice>
  if (!row) return <p className="text-muted">{t.loading}</p>

  const set = <K extends keyof GalleryRow>(key: K, value: GalleryRow[K]) => setRow((r) => (r ? { ...r, [key]: value } : r))
  const others = (rows ?? []).filter((r) => r.id !== row.id && !r.before_image_url)

  async function save() {
    if (!row) return
    setBusy(true)
    try {
      await saveGalleryFields(sb, row)
      saved.current = JSON.stringify(cleanGallery(row))
      toast('ok', t.saved)
    } catch (e) {
      toast('error', t.saveFailed((e as Error).message))
    }
    setBusy(false)
  }

  /** Runs a photo action, then shows its result. */
  async function photoAction<R extends { warning: string | null }>(action: () => Promise<R>, ok: string, after: (r: R) => void = () => {}) {
    setBusy(true)
    try {
      const result = await action()
      after(result)
      toast(result.warning ? 'info' : 'ok', result.warning ? t.cleanupWarning(result.warning) : ok)
    } catch (e) {
      toast('error', e instanceof UnreadableImageError ? t.unreadableImage(e.fileName) : t.photoFailed((e as Error).message))
    }
    setBusy(false)
  }

  const replaceMain = (file: File) =>
    photoAction(
      async () => replaceMainPhoto(sb, row.id, await photoVariants(file)),
      t.photoSaved,
      (r) => setRow((cur) => (cur ? { ...cur, image_url: r.url, thumb_url: thumbOf(r.url) } : cur)),
    )

  const uploadBefore = (file: File) =>
    photoAction(async () => setBeforePhoto(sb, row.id, await beforeVariants(file)), t.photoSaved, (r) => set('before_image_url', r.url))

  const removeBefore = () => {
    if (!confirm(t.removeBeforeConfirm)) return
    void photoAction(() => removeBeforePhoto(sb, row.id), t.photoRemoved, () => set('before_image_url', null))
  }

  const useAsBefore = (other: GalleryRow) => {
    if (!confirm(t.useAsBeforeConfirm)) return
    setPicking(false)
    void photoAction(() => pairExisting(sb, row, other), t.paired, (r) => {
      set('before_image_url', r.url)
      setRows((all) => all && all.filter((x) => x.id !== other.id))
    })
  }

  async function remove() {
    if (!row || !confirm(t.deletePhotoConfirm)) return
    setBusy(true)
    try {
      const { warning } = await deleteGalleryPhoto(sb, row.id)
      saved.current = JSON.stringify(cleanGallery(row))
      toast(warning ? 'info' : 'ok', warning ? t.cleanupWarning(warning) : t.photoDeleted)
      go('gallery', {}, { force: true })
    } catch (e) {
      toast('error', t.saveFailed((e as Error).message))
      setBusy(false)
    }
  }

  const fileButton = (label: string, onFile: (file: File) => void) => (
    <label className={`inline-flex min-h-12 cursor-pointer items-center rounded-xl border border-line bg-white px-5 font-semibold text-navy ${busy ? 'pointer-events-none opacity-50' : ''}`}>
      {label}
      <input
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void onFile(file)
        }}
      />
    </label>
  )

  return (
    <div className="space-y-5 pb-24">
      <PageTitle title={t.editPhoto} onBack={() => go('gallery')} />

      <Card title={row.before_image_url ? `${t.before} / ${t.after}` : t.photo}>
        <div className={row.before_image_url ? 'grid grid-cols-2 gap-2' : ''}>
          {row.before_image_url && (
            <figure>
              <img src={thumbOf(row.before_image_url)!} alt={t.before} className="aspect-[4/3] w-full rounded-xl bg-bg object-cover" />
              <figcaption className="pt-1 text-center text-sm font-semibold text-muted">{t.before}</figcaption>
            </figure>
          )}
          <figure>
            <img src={row.thumb_url ?? row.image_url} alt="" className={`aspect-[4/3] w-full rounded-xl bg-bg object-cover ${row.before_image_url ? '' : 'max-w-sm'}`} />
            {row.before_image_url && <figcaption className="pt-1 text-center text-sm font-semibold text-muted">{t.after}</figcaption>}
          </figure>
        </div>
        {busy && <p className="mt-3 text-muted">{t.photoWorking}</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          {fileButton(row.before_image_url ? t.replaceAfter : t.replacePhoto, replaceMain)}
          {fileButton(row.before_image_url ? t.replaceBefore : t.addBefore, uploadBefore)}
          {row.before_image_url ? (
            <Button variant="danger" disabled={busy} onClick={removeBefore}>
              {t.removeBefore}
            </Button>
          ) : (
            others.length > 0 && (
              <Button variant="secondary" disabled={busy} onClick={() => setPicking((p) => !p)}>
                {t.pickBefore}
              </Button>
            )
          )}
        </div>
        {picking && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-muted">{t.pickBeforeHelp}</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {others.map((o) => (
                <button key={o.id} type="button" onClick={() => useAsBefore(o)} className="overflow-hidden rounded-xl border border-line hover:ring-2 hover:ring-orange">
                  <img src={o.thumb_url ?? o.image_url} alt={(lang === 'ar' ? o.caption_ar : o.caption_en) ?? ''} loading="lazy" className="aspect-square w-full bg-bg object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card title={t.details}>
        <div className="space-y-4">
          <Select label={t.category} value={row.category_id ?? ''} onChange={(e) => set('category_id', e.target.value || null)}>
            <option value="">{t.none}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {lang === 'ar' ? c.name_ar : c.name_en}
              </option>
            ))}
          </Select>
          <DistrictField value={row.district} onChange={(v) => set('district', v)} areas={areas} />
          <Pair>
            <TextArea label={`${t.caption} · ${t.langAr}`} dir="rtl" rows={2} value={row.caption_ar ?? ''} onChange={(e) => set('caption_ar', e.target.value)} />
            <TextArea label={`${t.caption} · ${t.langEn}`} dir="ltr" rows={2} value={row.caption_en ?? ''} onChange={(e) => set('caption_en', e.target.value)} />
          </Pair>
          <Pair>
            <Field label={t.takenOn} type="date" value={row.taken_on ?? ''} onChange={(e) => set('taken_on', e.target.value || null)} />
            <Field label={t.sortOrder} type="number" inputMode="numeric" value={row.sort_order} onChange={(e) => set('sort_order', Number(e.target.value) || 0)} />
          </Pair>
          <Toggle label={t.shownOnSite} checked={row.is_active} onChange={(v) => set('is_active', v)} />
        </div>
      </Card>

      <Card title={t.deletePhoto}>
        <Button variant="danger" disabled={busy} onClick={remove}>
          {t.deletePhoto}
        </Button>
      </Card>

      <SaveBar busy={busy} dirty={dirty} onSave={save} />
    </div>
  )
}
