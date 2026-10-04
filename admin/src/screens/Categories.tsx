import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Badge, DragHandle, ListEditor, MoveButtons, PageTitle, Pair, TextArea, Toggle, useDragList } from '../form'
import { CATEGORY_COLUMNS, cleanCategory, move, renumber, type CategoryRow } from '../data'
import { useT } from '../i18n'
import { categoryFolder, clearImage, illustrationVariant, storeImage } from '../images'
import { useNav, useUnsavedGuard } from '../nav'
import type { Supabase } from '../supabase'
import { useToast } from '../toast'
import { Button, Card, Field, Notice } from '../ui'

/** The 6 categories: reorder in the list, edit (no create/delete) on the detail screen. */
export function Categories({ sb }: { sb: Supabase }) {
  const { route } = useNav()
  return route.params.id ? <CategoryForm sb={sb} id={route.params.id} /> : <CategoryList sb={sb} />
}

const orderCategories = (rows: CategoryRow[]) => rows.slice().sort((a, b) => a.sort_order - b.sort_order)

function CategoryList({ sb }: { sb: Supabase }) {
  const { t, lang } = useT()
  const { go } = useNav()
  const toast = useToast()
  const [rows, setRows] = useState<CategoryRow[] | null>(null)
  const [failed, setFailed] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await sb.from('categories').select(CATEGORY_COLUMNS)
    if (error) return setFailed(true)
    setRows(orderCategories(data as CategoryRow[]))
  }, [sb])
  useEffect(() => void load(), [load])

  async function reorder(from: number, to: number) {
    if (!rows) return
    const next = move(rows, from, to)
    const changes = renumber(next)
    setRows(next.map((r, i) => ({ ...r, sort_order: (i + 1) * 10 })))
    const results = await Promise.all(changes.map((c) => sb.from('categories').update({ sort_order: c.sort_order }).eq('id', c.id).select('id')))
    const bad = results.find((r) => r.error || !r.data?.length)
    if (bad) {
      toast('error', t.saveFailed(bad.error?.message ?? '—'))
      void load()
    } else toast('ok', t.orderSaved)
  }
  const drag = useDragList((a, b) => void reorder(a, b))

  return (
    <div>
      <PageTitle title={t.navCategories} />
      <p className="mb-4 text-muted">{t.categoriesHelp}</p>
      {failed && <Notice>{t.loadFailed}</Notice>}
      {!rows && !failed && <p className="text-muted">{t.loading}</p>}
      <ul className="space-y-2">
        {rows?.map((c, i) => {
          const row = drag.row(i)
          return (
            <li key={c.id} onDragOver={row.onDragOver} onDrop={row.onDrop} className={`flex items-center gap-2 rounded-2xl border border-line bg-white p-2 ${row.className}`}>
              <DragHandle {...drag.handle(i)} />
              <button type="button" onClick={() => go('categories', { id: c.id })} className="flex min-h-12 min-w-0 flex-1 items-center gap-3 text-start">
                {c.image_url && <img src={c.image_url} alt="" className="size-12 shrink-0 object-contain" />}
                <span className="min-w-0">
                  <span className="block font-semibold">{lang === 'ar' ? c.name_ar : c.name_en}</span>
                  <span className="flex flex-wrap gap-1 pt-1">
                    {c.is_primary && <Badge tone="navy">{t.primaryBadge}</Badge>}
                    {!c.is_active && <Badge tone="warn">{t.hiddenBadge}</Badge>}
                  </span>
                </span>
              </button>
              <MoveButtons index={i} count={rows.length} onMove={(a, b) => void reorder(a, b)} className="sm:hidden" />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function CategoryForm({ sb, id }: { sb: Supabase; id: string }) {
  const { t } = useT()
  const { go } = useNav()
  const toast = useToast()
  const [row, setRow] = useState<CategoryRow | null>(null)
  const saved = useRef('')
  const [busy, setBusy] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    void (async () => {
      const { data, error } = await sb.from('categories').select(CATEGORY_COLUMNS).eq('id', id).maybeSingle()
      if (error || !data) return setFailed(true)
      saved.current = JSON.stringify(cleanCategory(data as CategoryRow))
      setRow(data as CategoryRow)
    })()
  }, [sb, id])

  const dirty = Boolean(row && JSON.stringify(cleanCategory(row)) !== saved.current)
  useUnsavedGuard(dirty)

  if (failed) return <Notice>{t.loadFailed}</Notice>
  if (!row) return <p className="text-muted">{t.loading}</p>
  const set = <K extends keyof CategoryRow>(key: K, value: CategoryRow[K]) => setRow({ ...row, [key]: value })

  async function save() {
    if (!row) return
    if (!row.name_ar.trim() || !row.name_en.trim()) return toast('error', t.namesRequired)
    setBusy(true)
    const clean = cleanCategory(row)
    const { error } = await sb.from('categories').update(clean).eq('id', row.id).select('id').single()
    setBusy(false)
    if (error) return toast('error', t.saveFailed(error.message))
    saved.current = JSON.stringify(clean)
    setRow({ ...row })
    toast('ok', t.saved)
  }

  async function uploadIllustration(file: File) {
    if (!row) return
    setPhotoBusy(true)
    try {
      const files = await illustrationVariant(file)
      const { url, warning } = await storeImage(sb, categoryFolder(row.id), files, (u) => sb.from('categories').update({ image_url: u }).eq('id', row.id).select('id').single())
      setRow((r) => (r ? { ...r, image_url: url } : r))
      toast(warning ? 'info' : 'ok', warning ? t.cleanupWarning(warning) : t.photoSaved)
    } catch (e) {
      toast('error', t.photoFailed((e as Error).message))
    }
    setPhotoBusy(false)
  }

  async function resetIllustration() {
    if (!row || !confirm(t.resetIllustrationConfirm)) return
    setPhotoBusy(true)
    const original = `/illustrations/${row.slug}.png`
    try {
      const { warning } = await clearImage(sb, categoryFolder(row.id), () => sb.from('categories').update({ image_url: original }).eq('id', row.id).select('id').single())
      setRow((r) => (r ? { ...r, image_url: original } : r))
      toast(warning ? 'info' : 'ok', warning ? t.cleanupWarning(warning) : t.saved)
    } catch (e) {
      toast('error', t.saveFailed((e as Error).message))
    }
    setPhotoBusy(false)
  }

  return (
    <div className="space-y-5 pb-24">
      <PageTitle title={`${t.editCategory}: ${row.name_en}`} onBack={() => go('categories')} />

      <Card title={t.basics}>
        <div className="space-y-4">
          <Pair>
            <Field label={`${t.name} · ${t.langAr}`} dir="rtl" value={row.name_ar} onChange={(e) => set('name_ar', e.target.value)} required />
            <Field label={`${t.name} · ${t.langEn}`} dir="ltr" value={row.name_en} onChange={(e) => set('name_en', e.target.value)} required />
          </Pair>
          <Pair>
            <TextArea label={`${t.intro} · ${t.langAr}`} dir="rtl" rows={4} value={row.intro_ar ?? ''} onChange={(e) => set('intro_ar', e.target.value)} />
            <TextArea label={`${t.intro} · ${t.langEn}`} dir="ltr" rows={4} value={row.intro_en ?? ''} onChange={(e) => set('intro_en', e.target.value)} />
          </Pair>
          <Field label={t.sortOrder} type="number" inputMode="numeric" value={row.sort_order} onChange={(e) => set('sort_order', Number(e.target.value) || 0)} />
          <Toggle label={t.shownOnSite} checked={row.is_active} onChange={(v) => set('is_active', v)} />
          <Toggle label={t.isPrimary} checked={row.is_primary} onChange={(v) => set('is_primary', v)} />
        </div>
      </Card>

      <Card title={t.covers}>
        <div className="space-y-6">
          <ListEditor label={t.langAr} dir="rtl" items={row.covers_ar} onChange={(v) => set('covers_ar', v)} />
          <ListEditor label={t.langEn} dir="ltr" items={row.covers_en} onChange={(v) => set('covers_en', v)} />
        </div>
      </Card>

      <Card title={t.waMessage}>
        <p className="mb-3 text-sm text-muted">{t.waMessageHelp}</p>
        <Pair>
          <TextArea label={t.langAr} dir="rtl" value={row.wa_message_ar ?? ''} onChange={(e) => set('wa_message_ar', e.target.value)} />
          <TextArea label={t.langEn} dir="ltr" value={row.wa_message_en ?? ''} onChange={(e) => set('wa_message_en', e.target.value)} />
        </Pair>
      </Card>

      <Card title={t.illustration}>
        {row.image_url && <img src={row.image_url} alt="" className="mb-4 size-40 rounded-xl border border-line bg-bg object-contain p-2" />}
        {photoBusy && <p className="mb-3 text-muted">{t.photoWorking}</p>}
        <div className="flex flex-wrap gap-3">
          <label className={`inline-flex min-h-12 cursor-pointer items-center rounded-xl border border-line bg-white px-5 font-semibold text-navy ${photoBusy ? 'pointer-events-none opacity-50' : ''}`}>
            {t.uploadIllustration}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) void uploadIllustration(file)
              }}
            />
          </label>
          {row.image_url !== `/illustrations/${row.slug}.png` && (
            <Button variant="secondary" disabled={photoBusy} onClick={resetIllustration}>
              {t.resetIllustration}
            </Button>
          )}
        </div>
      </Card>

      <SaveBar busy={busy} dirty={dirty} onSave={save} />
    </div>
  )
}

/** Save button pinned above the phone navigation bar. */
export function SaveBar({ busy, dirty, onSave, children }: { busy: boolean; dirty: boolean; onSave: () => void; children?: ReactNode }) {
  const { t } = useT()
  return (
    <div className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:bottom-0">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        {children}
        <Button className="ms-auto min-w-32" disabled={busy || !dirty} onClick={onSave}>
          {busy ? t.saving : t.save}
        </Button>
      </div>
    </div>
  )
}
