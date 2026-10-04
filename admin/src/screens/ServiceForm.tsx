import { useEffect, useMemo, useRef, useState } from 'react'
import { SLUG_PATTERN, cleanService, emptyService, missingLongText, move, slugify, type FaqItem, type ServiceRow } from '../data'
import { AddButton, ListEditor, MoveButtons, PageTitle, Pair, RemoveButton, Select, TextArea, Toggle } from '../form'
import { useT } from '../i18n'
import { clearImage, removeFolder, serviceFolder, serviceVariants, storeImage, thumbOf } from '../images'
import { useNav, useUnsavedGuard } from '../nav'
import type { Supabase } from '../supabase'
import { useToast } from '../toast'
import { Button, Card, Field, Notice } from '../ui'
import { SaveBar } from './Categories'
import { useCatalog } from './Services'

type ListKey = 'includes' | 'excludes' | 'options' | 'parts'

/** Create / edit / delete one service. Photo changes on an existing service are saved at once. */
export function ServiceForm({ sb, id, categoryId }: { sb: Supabase; id: string | null; categoryId: string | null }) {
  const { t, lang } = useT()
  const { go } = useNav()
  const toast = useToast()
  const { categories, services, failed } = useCatalog(sb)
  const [row, setRow] = useState<ServiceRow | null>(null)
  const saved = useRef('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [busy, setBusy] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [pendingPhoto, setPendingPhoto] = useState<{ file: File; preview: string } | null>(null)
  const [tried, setTried] = useState(false)

  // Fill the form once the lists are loaded.
  useEffect(() => {
    if (!categories || !services || row) return
    if (id) {
      const found = services.find((s) => s.id === id)
      if (!found) return
      saved.current = JSON.stringify(cleanService(found))
      setRow(found)
      setSlugEdited(true)
    } else {
      const cat = categoryId && categories.some((c) => c.id === categoryId) ? categoryId : categories[0]?.id
      const last = services.filter((s) => s.category_id === cat).reduce((max, s) => Math.max(max, s.sort_order), 0)
      const blank = emptyService(cat, last + 10)
      saved.current = JSON.stringify(cleanService(blank))
      setRow(blank)
    }
  }, [categories, services, id, categoryId, row])

  useEffect(() => () => void (pendingPhoto && URL.revokeObjectURL(pendingPhoto.preview)), [pendingPhoto])

  const dirty = Boolean(row && (JSON.stringify(cleanService(row)) !== saved.current || pendingPhoto))
  useUnsavedGuard(dirty)

  const slugError = useMemo(() => {
    if (!row || !services) return null
    if (!SLUG_PATTERN.test(row.slug)) return t.slugInvalid
    return services.some((s) => s.id !== row.id && s.category_id === row.category_id && s.slug === row.slug) ? t.slugTaken : null
  }, [row, services, t])

  if (failed) return <Notice>{t.loadFailed}</Notice>
  if (id && services && !services.some((s) => s.id === id)) return <Notice>{t.loadFailed}</Notice>
  if (!row || !categories) return <p className="text-muted">{t.loading}</p>

  const set = <K extends keyof ServiceRow>(key: K, value: ServiceRow[K]) => setRow((r) => (r ? { ...r, [key]: value } : r))
  const isNew = !row.id
  const namesMissing = !row.name_ar.trim() || !row.name_en.trim()

  function setNameEn(value: string) {
    setRow((r) => (r ? { ...r, name_en: value, slug: slugEdited ? r.slug : slugify(value) } : r))
  }

  async function save() {
    if (!row) return
    setTried(true)
    if (namesMissing) return toast('error', t.namesRequired)
    if (slugError) return toast('error', slugError)
    setBusy(true)
    const clean = cleanService(row)
    const result = isNew
      ? await sb.from('services').insert(clean).select('id').single()
      : await sb.from('services').update(clean).eq('id', row.id).select('id').single()
    if (result.error) {
      setBusy(false)
      return toast('error', result.error.code === '23505' ? t.slugTaken : t.saveFailed(result.error.message))
    }
    const newId = result.data.id as string
    let imageUrl = row.image_url
    if (pendingPhoto) {
      try {
        const files = await serviceVariants(pendingPhoto.file)
        imageUrl = (await storeImage(sb, serviceFolder(newId), files, (u) => sb.from('services').update({ image_url: u }).eq('id', newId).select('id').single())).url
      } catch (e) {
        toast('error', t.photoFailed((e as Error).message))
      }
      setPendingPhoto(null)
    }
    saved.current = JSON.stringify(clean)
    setRow({ ...row, id: newId, image_url: imageUrl })
    setBusy(false)
    toast('ok', isNew ? t.serviceCreated : t.saved)
    if (isNew) go('services', { id: newId }, { replace: true, force: true })
  }

  async function remove() {
    if (!row || !confirm(t.deleteServiceConfirm(lang === 'ar' ? row.name_ar : row.name_en))) return
    setBusy(true)
    const { error } = await sb.from('services').delete().eq('id', row.id).select('id').single()
    if (error) {
      setBusy(false)
      return toast('error', t.saveFailed(error.message))
    }
    const warning = await removeFolder(sb, serviceFolder(row.id))
    saved.current = JSON.stringify(cleanService(row))
    setPendingPhoto(null)
    toast(warning ? 'info' : 'ok', warning ? t.cleanupWarning(warning) : t.serviceDeleted)
    go('services', { category: row.category_id }, { force: true })
  }

  async function pickPhoto(file: File) {
    if (!row) return
    if (isNew) {
      if (pendingPhoto) URL.revokeObjectURL(pendingPhoto.preview)
      return setPendingPhoto({ file, preview: URL.createObjectURL(file) })
    }
    setPhotoBusy(true)
    try {
      const files = await serviceVariants(file)
      const { url, warning } = await storeImage(sb, serviceFolder(row.id), files, (u) => sb.from('services').update({ image_url: u }).eq('id', row.id).select('id').single())
      setRow((r) => (r ? { ...r, image_url: url } : r))
      toast(warning ? 'info' : 'ok', warning ? t.cleanupWarning(warning) : t.photoSaved)
    } catch (e) {
      toast('error', t.photoFailed((e as Error).message))
    }
    setPhotoBusy(false)
  }

  async function removePhoto() {
    if (!row) return
    if (pendingPhoto) {
      URL.revokeObjectURL(pendingPhoto.preview)
      return setPendingPhoto(null)
    }
    if (!confirm(t.removePhotoConfirm)) return
    setPhotoBusy(true)
    try {
      const { warning } = await clearImage(sb, serviceFolder(row.id), () => sb.from('services').update({ image_url: null }).eq('id', row.id).select('id').single())
      setRow((r) => (r ? { ...r, image_url: null } : r))
      toast(warning ? 'info' : 'ok', warning ? t.cleanupWarning(warning) : t.photoRemoved)
    } catch (e) {
      toast('error', t.photoFailed((e as Error).message))
    }
    setPhotoBusy(false)
  }

  const preview = pendingPhoto?.preview ?? thumbOf(row.image_url)
  const lists: { key: ListKey; label: string }[] = [
    { key: 'includes', label: t.includes },
    { key: 'excludes', label: t.excludes },
    { key: 'options', label: t.options },
    { key: 'parts', label: t.parts },
  ]

  return (
    <div className="space-y-5 pb-24">
      <PageTitle title={isNew ? t.newService : `${t.editService}: ${row.name_en || row.name_ar}`} onBack={() => go('services', { category: row.category_id })} />

      <Card title={t.basics}>
        <div className="space-y-4">
          <Select label={t.category} value={row.category_id} onChange={(e) => set('category_id', e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {lang === 'ar' ? c.name_ar : c.name_en}
              </option>
            ))}
          </Select>
          <Pair>
            <Field label={`${t.name} · ${t.langAr}`} dir="rtl" value={row.name_ar} onChange={(e) => set('name_ar', e.target.value)} required />
            <Field label={`${t.name} · ${t.langEn}`} dir="ltr" value={row.name_en} onChange={(e) => setNameEn(e.target.value)} required />
          </Pair>
          {tried && namesMissing && <Notice>{t.namesRequired}</Notice>}
          <div>
            <Field
              label={t.slug}
              dir="ltr"
              value={row.slug}
              onChange={(e) => {
                setSlugEdited(true)
                set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
              }}
              autoCapitalize="none"
              spellCheck={false}
            />
            <p className="mt-1 text-xs text-muted">{t.slugHelp}</p>
            {slugError && (row.slug || tried) && <p className="mt-1 text-sm font-semibold text-red-700">{slugError}</p>}
          </div>
          <Pair>
            <TextArea label={`${t.shortText} · ${t.langAr}`} dir="rtl" value={row.short_ar ?? ''} onChange={(e) => set('short_ar', e.target.value)} />
            <TextArea label={`${t.shortText} · ${t.langEn}`} dir="ltr" value={row.short_en ?? ''} onChange={(e) => set('short_en', e.target.value)} />
          </Pair>
          <Pair>
            <TextArea label={`${t.longText} · ${t.langAr}`} dir="rtl" rows={8} value={row.body_ar ?? ''} onChange={(e) => set('body_ar', e.target.value)} />
            <TextArea label={`${t.longText} · ${t.langEn}`} dir="ltr" rows={8} value={row.body_en ?? ''} onChange={(e) => set('body_en', e.target.value)} />
          </Pair>
        </div>
      </Card>

      <Card title={t.display}>
        <div className="space-y-3">
          <Toggle label={t.shownOnSite} checked={row.is_active} onChange={(v) => set('is_active', v)} />
          <Toggle label={t.hasDetailPage} checked={row.has_detail_page} onChange={(v) => set('has_detail_page', v)} />
          {missingLongText(row) && <Notice tone="warn">{t.warnLongText}</Notice>}
          <Toggle label={t.featured} checked={row.featured} onChange={(v) => set('featured', v)} />
          <Toggle label={t.partsInStock} checked={row.parts_in_stock} onChange={(v) => set('parts_in_stock', v)} />
        </div>
      </Card>

      <Card title={t.photo}>
        {preview && <img src={preview} alt="" className="mb-3 aspect-[4/3] w-full max-w-sm rounded-xl bg-bg object-cover" />}
        {photoBusy && <p className="mb-3 text-muted">{t.photoWorking}</p>}
        {isNew && pendingPhoto && <p className="mb-3 text-sm text-muted">{t.photoOnSave}</p>}
        <div className="flex flex-wrap gap-3">
          <label className={`inline-flex min-h-12 cursor-pointer items-center rounded-xl border border-line bg-white px-5 font-semibold text-navy ${photoBusy || busy ? 'pointer-events-none opacity-50' : ''}`}>
            {preview ? t.replacePhoto : t.addPhoto}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) void pickPhoto(file)
              }}
            />
          </label>
          {preview && (
            <Button variant="danger" disabled={photoBusy || busy} onClick={removePhoto}>
              {t.removePhoto}
            </Button>
          )}
        </div>
      </Card>

      <Card title={t.lists}>
        <div className="space-y-8">
          {lists.map(({ key, label }) => (
            <div key={key} className="space-y-4">
              <h3 className="font-bold text-navy">{label}</h3>
              <ListEditor label={t.langAr} dir="rtl" items={row[`${key}_ar`]} onChange={(v) => set(`${key}_ar`, v)} />
              <ListEditor label={t.langEn} dir="ltr" items={row[`${key}_en`]} onChange={(v) => set(`${key}_en`, v)} />
            </div>
          ))}
        </div>
      </Card>

      <Card title={t.waOverride}>
        <p className="mb-3 text-sm text-muted">{t.waOverrideHelp}</p>
        <Pair>
          <TextArea label={t.langAr} dir="rtl" value={row.wa_message_ar ?? ''} onChange={(e) => set('wa_message_ar', e.target.value)} />
          <TextArea label={t.langEn} dir="ltr" value={row.wa_message_en ?? ''} onChange={(e) => set('wa_message_en', e.target.value)} />
        </Pair>
      </Card>

      <Card title={t.faq}>
        <FaqEditor items={row.faq} onChange={(v) => set('faq', v)} />
      </Card>

      {!isNew && (
        <Card title={t.deleteService}>
          <Button variant="danger" disabled={busy} onClick={remove}>
            {t.deleteService}
          </Button>
        </Card>
      )}

      <SaveBar busy={busy} dirty={dirty || isNew} onSave={save}>
        {missingLongText(row) && <span className="text-sm font-semibold text-amber-800">⚠ {t.badgeMissingText}</span>}
      </SaveBar>
    </div>
  )
}

function FaqEditor({ items, onChange }: { items: FaqItem[]; onChange: (items: FaqItem[]) => void }) {
  const { t } = useT()
  const set = (i: number, key: keyof FaqItem, value: string) => onChange(items.map((f, j) => (j === i ? { ...f, [key]: value } : f)))
  return (
    <div className="space-y-4">
      {items.length === 0 && <p className="text-sm text-muted">{t.emptyList}</p>}
      {items.map((f, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-line p-3">
          <div className="flex items-center gap-2">
            <span className="me-auto font-bold text-navy">#{i + 1}</span>
            <MoveButtons index={i} count={items.length} onMove={(a, b) => onChange(move(items, a, b))} />
            <RemoveButton label={t.removeQuestion} onClick={() => onChange(items.filter((_, j) => j !== i))} />
          </div>
          <Pair>
            <Field label={`${t.question} · ${t.langAr}`} dir="rtl" value={f.q_ar} onChange={(e) => set(i, 'q_ar', e.target.value)} />
            <Field label={`${t.question} · ${t.langEn}`} dir="ltr" value={f.q_en} onChange={(e) => set(i, 'q_en', e.target.value)} />
          </Pair>
          <Pair>
            <TextArea label={`${t.answer} · ${t.langAr}`} dir="rtl" value={f.a_ar} onChange={(e) => set(i, 'a_ar', e.target.value)} />
            <TextArea label={`${t.answer} · ${t.langEn}`} dir="ltr" value={f.a_en} onChange={(e) => set(i, 'a_en', e.target.value)} />
          </Pair>
        </div>
      ))}
      <AddButton label={t.addQuestion} onClick={() => onChange([...items, { q_ar: '', a_ar: '', q_en: '', a_en: '' }])} />
    </div>
  )
}
