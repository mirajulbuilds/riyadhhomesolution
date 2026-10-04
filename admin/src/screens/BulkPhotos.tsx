import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import type { ServiceRow } from '../data'
import { Badge, PageTitle } from '../form'
import { useT } from '../i18n'
import { serviceFolder, serviceVariants, storeImage, thumbOf } from '../images'
import { duplicateTargets, matchFile, type Match } from '../match'
import { useUnsavedGuard } from '../nav'
import type { Supabase } from '../supabase'
import { useToast } from '../toast'
import { Button, Notice } from '../ui'
import { useCatalog } from './Services'

interface Item {
  key: string
  file: File
  preview: string
  match: Match
  /** Service chosen for this file ('' = skip). */
  target: string
  state: 'ready' | 'done' | 'failed'
  error?: string
}

/** Drop many photos, check the automatic file-name → service matches, then upload them in one go. */
export function BulkPhotos({ sb }: { sb: Supabase }) {
  const { t, lang } = useT()
  const toast = useToast()
  const { categories, services, setServices, failed } = useCatalog(sb)
  const [items, setItems] = useState<Item[]>([])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const previews = useRef<string[]>([])

  useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), [])
  useUnsavedGuard(running || items.some((i) => i.state === 'ready' && i.target))

  const byId = useMemo(() => new Map((services ?? []).map((s) => [s.id, s])), [services])
  const targets = useMemo(() => {
    const catSlug = new Map((categories ?? []).map((c) => [c.id, c.slug]))
    return (services ?? []).map((s) => ({ id: s.id, slug: s.slug, categorySlug: catSlug.get(s.category_id) ?? '' }))
  }, [categories, services])
  const duplicates = duplicateTargets(items.filter((i) => i.state !== 'done').map((i) => i.target || null))
  const toUpload = items.filter((i) => i.target && i.state !== 'done')
  const name = (s: ServiceRow) => (lang === 'ar' ? s.name_ar : s.name_en)

  function addFiles(files: FileList | File[]) {
    const images = Array.from(files).filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name))
    const added = images.map((file): Item => {
      const preview = URL.createObjectURL(file)
      previews.current.push(preview)
      const match = matchFile(file.name, targets)
      return { key: `${file.name}-${file.size}-${Math.random()}`, file, preview, match, target: match.target?.id ?? '', state: 'ready' }
    })
    setItems((all) => [...all, ...added])
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (!running) addFiles(e.dataTransfer.files)
  }

  async function upload() {
    if (duplicates.size || !toUpload.length) return
    setRunning(true)
    setProgress(0)
    setTotal(toUpload.length)
    let ok = 0
    let bad = 0
    for (const item of toUpload) {
      const id = item.target
      let result: Partial<Item>
      try {
        const files = await serviceVariants(item.file)
        const { url } = await storeImage(sb, serviceFolder(id), files, (u) => sb.from('services').update({ image_url: u }).eq('id', id).select('id').single())
        setServices((all) => all && all.map((s) => (s.id === id ? { ...s, image_url: url } : s)))
        result = { state: 'done', error: undefined }
        ok++
      } catch (e) {
        result = { state: 'failed', error: (e as Error).message }
        bad++
      }
      setItems((all) => all.map((x) => (x.key === item.key ? { ...x, ...result } : x)))
      setProgress((n) => n + 1)
    }
    setRunning(false)
    toast(bad ? 'error' : 'ok', t.uploadSummary(ok, bad))
  }

  function startOver() {
    previews.current.forEach((url) => URL.revokeObjectURL(url))
    previews.current = []
    setItems([])
    setProgress(0)
  }

  const matched = items.filter((i) => i.match.kind !== 'none')
  const unmatched = items.filter((i) => i.match.kind === 'none')
  const failedItems = items.filter((i) => i.state === 'failed')

  const row = (item: Item) => {
    const current = item.target ? byId.get(item.target) : undefined
    const clash = !!item.target && duplicates.has(item.target) && item.state !== 'done'
    return (
      <li key={item.key} className={`rounded-2xl border bg-white p-3 ${clash ? 'border-red-400 ring-2 ring-red-200' : 'border-line'}`}>
        <div className="flex flex-wrap items-start gap-3">
          <figure className="shrink-0 text-center">
            <img src={item.preview} alt="" className="size-20 rounded-lg bg-bg object-cover" />
            <figcaption className="pt-1 text-xs text-muted">{t.newPhoto}</figcaption>
          </figure>
          {current?.image_url && (
            <figure className="shrink-0 text-center">
              <img src={thumbOf(current.image_url)!} alt="" className="size-20 rounded-lg bg-bg object-cover opacity-80" />
              <figcaption className="pt-1 text-xs text-muted">{t.currentPhoto}</figcaption>
            </figure>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <p className="break-all text-sm font-semibold" dir="ltr">
              {item.file.name}
            </p>
            <div className="flex flex-wrap gap-1">
              {item.match.kind === 'exact' && <Badge tone="navy">{t.matchExact}</Badge>}
              {item.match.kind === 'close' && <Badge tone="warn">{t.matchClose(item.match.score)}</Badge>}
              {item.state === 'done' && <Badge tone="navy">✓ {t.stateDone}</Badge>}
              {item.state === 'failed' && <Badge tone="warn">✕ {t.stateFailed}</Badge>}
              {current?.image_url && item.state === 'ready' && <Badge>{t.replacesCurrent}</Badge>}
            </div>
          </div>
        </div>
        {/* Full width under the pictures, so service names stay readable on a phone. */}
        <div className="mt-3 space-y-2">
          <select
              value={item.target}
              disabled={running || item.state === 'done'}
              onChange={(e) => setItems((all) => all.map((x) => (x.key === item.key ? { ...x, target: e.target.value, state: 'ready', error: undefined } : x)))}
              aria-label={item.file.name}
              className="block min-h-12 w-full rounded-xl border border-line bg-white px-3 text-base"
            >
              <option value="">{item.match.kind === 'none' ? t.chooseService : t.skipFile}</option>
              {categories?.map((c) => (
                <optgroup key={c.id} label={lang === 'ar' ? c.name_ar : c.name_en}>
                  {services
                    ?.filter((s) => s.category_id === c.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {name(s)} · {s.slug}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
            {item.error && <p className="text-sm text-red-700">{item.error}</p>}
        </div>
      </li>
    )
  }

  return (
    <div className="space-y-5 pb-24">
      <PageTitle title={t.photosTitle} />
      <p className="text-muted">{t.photosHelp}</p>
      {failed && <Notice>{t.loadFailed}</Notice>}

      <label
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center font-semibold text-navy ${
          dragOver ? 'border-orange bg-orange/10' : 'border-line bg-white'
        } ${running || !services ? 'pointer-events-none opacity-50' : ''}`}
      >
        {t.dropHere}
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </label>

      {matched.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-bold text-navy">
            {t.matched} ({matched.length})
          </h2>
          <ul className="space-y-2">{matched.map(row)}</ul>
        </section>
      )}
      {unmatched.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-bold text-navy">
            {t.unmatched} ({unmatched.length})
          </h2>
          <ul className="space-y-2">{unmatched.map(row)}</ul>
        </section>
      )}

      {duplicates.size > 0 && <Notice tone="warn">{t.duplicateWarning}</Notice>}
      {failedItems.length > 0 && !running && (
        <Notice>
          {t.failedFiles}{' '}
          {failedItems.map((i) => `${i.file.name} (${i.error})`).join(', ')}
        </Notice>
      )}

      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:bottom-0">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3">
            {running ? (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t.uploadProgress(Math.min(progress + 1, total), total)}</p>
                <progress className="h-2 w-full accent-navy" value={progress} max={total} />
              </div>
            ) : (
              <Button variant="secondary" onClick={startOver}>
                {t.startOver}
              </Button>
            )}
            <Button className="ms-auto" disabled={running || duplicates.size > 0 || toUpload.length === 0} onClick={upload}>
              {t.confirmUpload(toUpload.length)}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
