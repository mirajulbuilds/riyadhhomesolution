import { ChevronLeft, MapPin, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import type { GalleryItem } from '@/content/types'
import { useSite, useStrings } from '../site-context'

function formatDate(iso: string | null, lang: 'ar' | 'en') {
  if (!iso) return ''
  const date = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/**
 * Photo that fades in as it loads. Visible by default (so it works without JavaScript); only
 * images still downloading after hydration are hidden until their load event.
 */
function FadeImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const ref = useRef<HTMLImageElement>(null)
  const [pending, setPending] = useState(false)
  useEffect(() => {
    const img = ref.current
    if (!img || img.complete) return
    setPending(true)
    const done = () => setPending(false)
    img.addEventListener('load', done, { once: true })
    img.addEventListener('error', done, { once: true })
    return () => {
      img.removeEventListener('load', done)
      img.removeEventListener('error', done)
    }
  }, [src])
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={600}
      height={600}
      className={`transition-[opacity,transform] duration-500 motion-reduce:transition-none ${pending ? 'scale-[1.02] opacity-0' : 'scale-100 opacity-100'} ${className}`}
    />
  )
}

/** Before/after comparison: drag (or use the arrow keys on) the range to reveal the "after" photo. */
export function BeforeAfter({ before, after, alt }: { before: string; after: string; alt: string }) {
  const t = useStrings()
  const [pos, setPos] = useState(50)
  return (
    <div className="relative overflow-hidden rounded-2xl bg-bg" dir="ltr">
      <img src={after} alt={`${alt} — ${t.work.after}`} className="block max-h-[70vh] w-full object-contain" />
      <img
        src={before}
        alt={`${alt} — ${t.work.before}`}
        className="absolute inset-0 block h-full w-full object-contain"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }} />
      <span className="pointer-events-none absolute start-3 top-3 rounded-full bg-navy/80 px-2.5 py-1 text-xs font-semibold text-white">
        {t.work.before}
      </span>
      <span className="pointer-events-none absolute end-3 top-3 rounded-full bg-orange px-2.5 py-1 text-xs font-semibold text-navy">
        {t.work.after}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={t.work.compare}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  )
}

/** Filterable photo grid with a lightbox (brief §6.5). */
export function Gallery({
  items,
  categories,
  limit,
  showFilter = true,
}: {
  items: GalleryItem[]
  categories: { slug: string; name: string }[]
  limit?: number
  showFilter?: boolean
}) {
  const { lang } = useSite()
  const t = useStrings()
  const [filter, setFilter] = useState<string | null>(null)
  const [open, setOpen] = useState<number | null>(null)

  // Optional deep link: /our-work?category=plumbing
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('category')
    if (slug && categories.some((c) => c.slug === slug)) setFilter(slug)
  }, [categories])

  const usedCategories = useMemo(
    () => categories.filter((c) => items.some((i) => i.categorySlug === c.slug)),
    [categories, items],
  )
  const visible = useMemo(() => {
    const list = filter ? items.filter((i) => i.categorySlug === filter) : items
    return limit ? list.slice(0, limit) : list
  }, [items, filter, limit])

  const categoryName = (slug: string | null) => categories.find((c) => c.slug === slug)?.name ?? ''

  return (
    <div>
      {showFilter && usedCategories.length > 1 && (
        <div role="group" aria-label={t.work.filterLabel} className="mb-6 flex flex-wrap gap-2">
          {[{ slug: null as string | null, name: t.work.all }, ...usedCategories].map((c) => (
            <button
              key={c.slug ?? 'all'}
              type="button"
              aria-pressed={filter === c.slug}
              onClick={() => setFilter(c.slug)}
              className={`chip cursor-pointer ${filter === c.slug ? 'border-navy bg-navy text-white' : 'hover:border-navy'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="card p-6 text-muted">{items.length === 0 ? t.work.empty : t.work.emptyFilter}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {visible.map((item, i) => (
            <li key={item.id}>
              <a
                href={item.imageUrl}
                onClick={(e: MouseEvent) => {
                  e.preventDefault()
                  setOpen(i)
                }}
                className="group relative block overflow-hidden rounded-2xl bg-bg"
              >
                <FadeImage
                  src={item.thumbUrl ?? item.imageUrl}
                  alt={item.caption || categoryName(item.categorySlug) || t.work.open}
                  className="aspect-square w-full object-cover group-hover:scale-[1.03]"
                />
                {item.beforeImageUrl && (
                  <span className="absolute start-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-navy">
                    {t.work.before} / {t.work.after}
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-deep/85 to-transparent p-3 pt-10 text-start text-xs text-white sm:text-sm">
                  {item.caption && <span className="line-clamp-2 block font-semibold">{item.caption}</span>}
                  <span className="mt-0.5 flex flex-wrap gap-x-2 text-white/80">
                    {item.district && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin aria-hidden="true" className="size-3" />
                        {item.district}
                      </span>
                    )}
                    <span suppressHydrationWarning>{formatDate(item.takenOn, lang)}</span>
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {open !== null && visible[open] && (
        <Lightbox
          items={visible}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
          categoryName={categoryName}
        />
      )}
    </div>
  )
}

function Lightbox({
  items,
  index,
  onIndex,
  onClose,
  categoryName,
}: {
  items: GalleryItem[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
  categoryName: (slug: string | null) => string
}) {
  const { lang } = useSite()
  const t = useStrings()
  const dialog = useRef<HTMLDialogElement>(null)
  const item = items[index]!

  useEffect(() => {
    const el = dialog.current
    if (el && !el.open) el.showModal()
    const onKey = (e: KeyboardEvent) => {
      const rtl = document.documentElement.dir === 'rtl'
      if (e.key === 'ArrowRight') onIndex((index + (rtl ? -1 : 1) + items.length) % items.length)
      if (e.key === 'ArrowLeft') onIndex((index + (rtl ? 1 : -1) + items.length) % items.length)
    }
    el?.addEventListener('keydown', onKey)
    return () => el?.removeEventListener('keydown', onKey)
  }, [index, items.length, onIndex])

  const alt = item.caption || categoryName(item.categorySlug)
  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      className="m-auto w-[min(96vw,980px)] max-w-none rounded-[22px] bg-white p-0 backdrop:bg-navy-deep/80 backdrop:backdrop-blur-sm"
    >
      <div className="p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-muted" dir="ltr">
            {index + 1} / {items.length}
          </p>
          <button type="button" onClick={() => dialog.current?.close()} className="btn btn-outline btn-sm px-3" aria-label={t.common.close} autoFocus>
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="animate-[lb-zoom_220ms_ease-out] motion-reduce:animate-none">
          {item.beforeImageUrl ? (
            <BeforeAfter before={item.beforeImageUrl} after={item.imageUrl} alt={alt} />
          ) : (
            <img src={item.imageUrl} alt={alt} className="block max-h-[70vh] w-full rounded-2xl bg-bg object-contain" />
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="text-sm">
            {item.caption && <p className="font-semibold text-navy">{item.caption}</p>}
            <p className="text-muted">
              {[categoryName(item.categorySlug), item.district, formatDate(item.takenOn, lang)].filter(Boolean).join(' · ')}
            </p>
          </div>
          {items.length > 1 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onIndex((index - 1 + items.length) % items.length)}
                className="btn btn-outline btn-sm px-3"
                aria-label={t.common.previous}
              >
                <ChevronLeft aria-hidden="true" className="size-5 rtl:-scale-x-100" />
              </button>
              <button type="button" onClick={() => onIndex((index + 1) % items.length)} className="btn btn-outline btn-sm px-3" aria-label={t.common.next}>
                <ChevronLeft aria-hidden="true" className="size-5 ltr:-scale-x-100" />
              </button>
            </div>
          )}
        </div>
      </div>
    </dialog>
  )
}
