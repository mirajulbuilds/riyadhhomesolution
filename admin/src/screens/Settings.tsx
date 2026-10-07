import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { SiteImages } from '../../../src/content/types'
import { DragHandle, MoveButtons, PageTitle, Pair, RemoveButton, AddButton, useDragList } from '../form'
import { move } from '../data'
import { useT } from '../i18n'
import { useUnsavedGuard } from '../nav'
import {
  DEFAULTS,
  changedRows,
  loadSettings,
  normalizeShopPhone,
  removeAboutPhoto,
  saveRows,
  toForm,
  uploadAboutPhoto,
  validate,
  type AboutPhoto,
  type AreaForm,
  type Edited,
  type ErrorCode,
  type Errors,
  type FieldId,
  type SettingsForm,
} from '../settings'
import type { Supabase } from '../supabase'
import { useToast } from '../toast'
import { Button, Card, Notice } from '../ui'
import { SaveBar } from './Categories'

const inputClass = 'block min-h-12 w-full rounded-xl border bg-white px-4 text-base text-ink focus:border-navy'
const clip = (text: string) => (text.length > 70 ? `${text.slice(0, 70)}…` : text)

/** Everything in the `settings` table the owner edits, grouped; one Save for the form, photos save at once. */
export function Settings({ sb }: { sb: Supabase }) {
  const { t } = useT()
  const toast = useToast()
  const [saved, setSaved] = useState<Edited | null>(null)
  const [form, setForm] = useState<SettingsForm | null>(null)
  const [images, setImages] = useState<SiteImages | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)
  const [photoBusy, setPhotoBusy] = useState<AboutPhoto | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    void loadSettings(sb).then((loaded) => {
      if (!loaded) return setFailed(true)
      setSaved(loaded.values)
      setForm(toForm(loaded.values))
      setImages(loaded.images)
    })
  }, [sb])

  const savedForm = useMemo(() => (saved ? toForm(saved) : null), [saved])
  const original = useMemo(() => toForm(DEFAULTS), [])
  const dirty = Boolean(form && savedForm && JSON.stringify(form) !== JSON.stringify(savedForm))
  useUnsavedGuard(dirty)
  const drag = useDragList((a, b) => setAreas((areas) => move(areas, a, b)))

  if (failed) return <Notice>{t.loadFailed}</Notice>
  if (!form || !savedForm || !saved || !images) return <p className="text-muted">{t.loading}</p>

  const set = (id: FieldId, value: string) => setForm((f) => (f ? { ...f, [id]: value } : f))
  function setAreas(update: (areas: AreaForm[]) => AreaForm[]) {
    setForm((f) => (f ? { ...f, areas: update(f.areas) } : f))
  }

  /** Error, or "Saved now: …" while edited, or "Original: … · Use original" when the saved value was changed. */
  const hint = (id: FieldId) => (
    <Hint error={errors[id]} current={form[id]} saved={savedForm[id]} original={original[id]} onOriginal={() => set(id, original[id])} />
  )

  /** One labelled text input with its hint. */
  const input = (id: FieldId, label: string, options: { dir?: 'rtl' | 'ltr'; type?: string; inputMode?: 'numeric' | 'tel' | 'url' | 'decimal'; help?: ReactNode } = {}) => (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-muted">{label}</span>
      <input
        value={form[id]}
        onChange={(e) => set(id, e.target.value)}
        dir={options.dir ?? 'ltr'}
        type={options.type ?? 'text'}
        inputMode={options.inputMode}
        aria-invalid={errors[id] ? true : undefined}
        className={`${inputClass} ${errors[id] ? 'border-red-400' : 'border-line'}`}
      />
      {options.help && <span className="mt-1 block text-xs text-muted">{options.help}</span>}
      {hint(id)}
    </label>
  )

  const textarea = (id: FieldId, label: string, dir: 'rtl' | 'ltr', rows = 3) => (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-muted">{label}</span>
      <textarea
        value={form[id]}
        onChange={(e) => set(id, e.target.value)}
        dir={dir}
        rows={rows}
        aria-invalid={errors[id] ? true : undefined}
        className={`${inputClass} min-h-24 py-3 ${errors[id] ? 'border-red-400' : 'border-line'}`}
      />
      {hint(id)}
    </label>
  )

  async function save() {
    if (!form || !saved) return
    const result = validate(form)
    setErrors(result.errors)
    if (!result.values) {
      toast('error', t.fixErrors)
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    const rows = changedRows(result.values, saved)
    setBusy(true)
    const { error } = await saveRows(sb, rows)
    setBusy(false)
    if (error) return toast('error', t.saveFailed(error.message))
    setSaved(result.values)
    setForm(toForm(result.values))
    toast('ok', t.saved)
  }

  async function removeArea(index: number) {
    const area = form?.areas[index]
    if (!area) return
    let uses = 0
    if (area.key) {
      const [gallery, reviews] = await Promise.all([
        sb.from('gallery').select('id', { count: 'exact', head: true }).eq('district', area.key),
        sb.from('reviews').select('id', { count: 'exact', head: true }).eq('district', area.key),
      ])
      uses = (gallery.count ?? 0) + (reviews.count ?? 0)
    }
    if (!confirm(t.removeAreaConfirm(area.ar || area.en || '—', uses, area.key))) return
    setAreas((areas) => areas.filter((_, i) => i !== index))
  }

  async function photo(kind: AboutPhoto, file: File | null) {
    if (!file && !confirm(t.removeAboutConfirm)) return
    setPhotoBusy(kind)
    try {
      const { warning } = file ? await uploadAboutPhoto(sb, kind, file) : await removeAboutPhoto(sb, kind)
      const loaded = await loadSettings(sb)
      if (loaded) setImages(loaded.images)
      toast(warning ? 'info' : 'ok', warning ? t.cleanupWarning(warning) : file ? t.photoSaved : t.saved)
    } catch (e) {
      toast('error', t.photoFailed((e as Error).message))
    }
    setPhotoBusy(null)
  }

  const phone = normalizeShopPhone(form.phone)
  const whatsapp = normalizeShopPhone(form.whatsapp)
  const areasChanged = JSON.stringify(form.areas) !== JSON.stringify(savedForm.areas)
  const areasNotOriginal = JSON.stringify(savedForm.areas) !== JSON.stringify(original.areas)

  return (
    <div className="space-y-5 pb-24">
      <PageTitle title={t.navSettings} />
      <p className="text-muted">{t.settingsHelp}</p>

      <Card title={t.setContact}>
        <div className="space-y-4">
          {input('phone', t.setPhone, { type: 'tel', inputMode: 'tel', help: t.setPhoneHelp })}
          {phone && <p className="text-sm text-muted" dir="auto">{t.shownAs(phone.display, `tel:${phone.e164}`)}</p>}
          {input('whatsapp', t.setWhatsapp, { type: 'tel', inputMode: 'tel', help: t.setWhatsappHelp })}
          {whatsapp && <p className="text-sm text-muted" dir="auto">{t.shownAs(whatsapp.display, `wa.me/${whatsapp.e164.slice(1)}`)}</p>}
          {form.whatsapp !== form.phone && (
            <Button variant="secondary" onClick={() => set('whatsapp', form.phone)}>
              {t.useAsWhatsapp}
            </Button>
          )}
          <Pair>
            {input('emergency_ar', `${t.setEmergency} · ${t.langAr}`, { dir: 'rtl' })}
            {input('emergency_en', `${t.setEmergency} · ${t.langEn}`)}
          </Pair>
        </div>
      </Card>

      <Card title={t.setHours}>
        <div className="space-y-4">
          {(
            [
              [t.satThu, 'week_opens', 'week_closes'],
              [t.friday, 'fri_opens', 'fri_closes'],
            ] as const
          ).map(([label, opens, closes]) => (
            <fieldset key={opens}>
              <legend className="mb-1 font-semibold text-navy">{label}</legend>
              <div className="grid grid-cols-2 gap-3">
                {input(opens, t.opens, { type: 'time' })}
                {input(closes, t.closes, { type: 'time' })}
              </div>
            </fieldset>
          ))}
          <p className="text-xs text-muted">{t.hoursNoteHelp}</p>
          <Pair>
            {input('hours_note_ar', `${t.hoursNote} · ${t.langAr}`, { dir: 'rtl' })}
            {input('hours_note_en', `${t.hoursNote} · ${t.langEn}`)}
          </Pair>
        </div>
      </Card>

      <Card title={t.setNumbers}>
        <div className="grid gap-4 sm:grid-cols-2">
          {input('since_year', t.sinceYear, { inputMode: 'numeric' })}
          {input('years_in_building', t.yearsInBuilding, { inputMode: 'numeric' })}
          {input('technicians', t.technicians, { inputMode: 'numeric' })}
          {input('areas_count', t.areasCount, { inputMode: 'numeric', help: t.areasCountHelp(form.areas.length) })}
        </div>
      </Card>

      <Card title={t.setAreas}>
        <p className="mb-4 text-sm text-muted">{t.setAreasHelp}</p>
        {errors.areas && <FieldError code={errors.areas} />}
        <ul className="space-y-3">
          {form.areas.map((area, i) => {
            const row = drag.row(i)
            const error = errors.areaRows?.[i]
            const update = (patch: Partial<AreaForm>) => setAreas((areas) => areas.map((a, j) => (j === i ? { ...a, ...patch } : a)))
            return (
              <li
                key={area.key || `new-${i}`}
                onDragOver={row.onDragOver}
                onDrop={row.onDrop}
                className={`flex gap-2 rounded-2xl border p-3 ${error ? 'border-red-400' : 'border-line'} ${row.className}`}
              >
                <DragHandle {...drag.handle(i)} />
                <div className="min-w-0 flex-1 space-y-2">
                  <Pair>
                    <input value={area.ar} onChange={(e) => update({ ar: e.target.value })} dir="rtl" aria-label={`${t.name} · ${t.langAr}`} placeholder={`${t.name} · ${t.langAr}`} className={`${inputClass} border-line`} />
                    <input value={area.en} onChange={(e) => update({ en: e.target.value })} dir="ltr" aria-label={`${t.name} · ${t.langEn}`} placeholder={`${t.name} · ${t.langEn}`} className={`${inputClass} border-line`} />
                  </Pair>
                  <input value={area.coords} onChange={(e) => update({ coords: e.target.value })} dir="ltr" inputMode="decimal" aria-label={t.areaCoords} placeholder={t.areaCoords} className={`${inputClass} border-line`} />
                  {error && <FieldError code={error} />}
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <MoveButtons index={i} count={form.areas.length} onMove={(a, b) => setAreas((areas) => move(areas, a, b))} className="flex-col" />
                  <RemoveButton label={t.removeRow} onClick={() => void removeArea(i)} />
                </div>
              </li>
            )
          })}
        </ul>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <AddButton label={t.addArea} onClick={() => setAreas((areas) => [...areas, { key: '', ar: '', en: '', coords: '' }])} />
          {areasChanged && <span className="text-xs text-muted">{t.savedNow(`${savedForm.areas.length}`)}</span>}
          {!areasChanged && areasNotOriginal && (
            <span className="flex items-center gap-2 text-xs text-muted">
              {t.originalAreas(original.areas.length)}
              <button type="button" onClick={() => setAreas(() => original.areas)} className="min-h-10 rounded-lg px-2 font-semibold text-navy underline">
                {t.useOriginal}
              </button>
            </span>
          )}
        </div>
        <div className="mt-4">
          <Pair>
            {input('areas_note_ar', `${t.areasNote} · ${t.langAr}`, { dir: 'rtl' })}
            {input('areas_note_en', `${t.areasNote} · ${t.langEn}`)}
          </Pair>
        </div>
      </Card>

      <Card title={t.setShop}>
        <div className="space-y-3">
          {input('shop_coords', t.shopCoords, { inputMode: 'decimal', help: t.shopCoordsHelp })}
          {form.shop_coords !== original.shop_coords && (
            <Button variant="secondary" onClick={() => set('shop_coords', original.shop_coords)}>
              {t.restoreVerified}
            </Button>
          )}
        </div>
      </Card>

      <Card title={t.setSocial}>
        <p className="mb-4 text-sm text-muted">{t.setSocialHelp}</p>
        <div className="space-y-4">
          {input('facebook', 'Facebook', { type: 'url', inputMode: 'url' })}
          {input('instagram', 'Instagram', { type: 'url', inputMode: 'url' })}
          {input('tiktok', 'TikTok', { type: 'url', inputMode: 'url' })}
          {input('snapchat', 'Snapchat', { type: 'url', inputMode: 'url' })}
        </div>
      </Card>

      <Card title={t.setStory}>
        <p className="mb-4 text-sm text-muted">{t.setStoryHelp}</p>
        <div className="space-y-4">
          {textarea('story_ar', t.langAr, 'rtl', 8)}
          {textarea('story_en', t.langEn, 'ltr', 8)}
        </div>
      </Card>

      <Card title={t.setPhotos}>
        <div className="grid gap-5 sm:grid-cols-2">
          {(
            [
              ['shop', t.photoShop, images.about_shop],
              ['team', t.photoTeam, images.about_team],
            ] as const
          ).map(([kind, label, url]) => (
            <div key={kind}>
              <p className="mb-2 font-semibold text-navy">{label}</p>
              {url ? <img src={url} alt="" className="mb-3 aspect-[4/3] w-full rounded-xl bg-bg object-cover" /> : <p className="mb-3 text-sm text-muted">{t.noPhotoYet}</p>}
              {photoBusy === kind && <p className="mb-3 text-muted">{t.photoWorking}</p>}
              <div className="flex flex-wrap gap-2">
                <label className={`inline-flex min-h-12 cursor-pointer items-center rounded-xl border border-line bg-white px-5 font-semibold text-navy ${photoBusy ? 'pointer-events-none opacity-50' : ''}`}>
                  {url ? t.replacePhoto : t.addPhoto}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      e.target.value = ''
                      if (file) void photo(kind, file)
                    }}
                  />
                </label>
                {url && (
                  <Button variant="danger" disabled={Boolean(photoBusy)} onClick={() => void photo(kind, null)}>
                    {t.removePhoto}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title={t.setGoogle}>
        <div className="space-y-3">
          {input('google_place_id', t.placeId, { help: t.placeIdHelp })}
          <a
            href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center font-semibold text-navy underline"
          >
            {t.placeIdFinder}
          </a>
        </div>
      </Card>

      <SaveBar busy={busy} dirty={dirty} onSave={() => void save()} />
    </div>
  )
}

function FieldError({ code }: { code: ErrorCode }) {
  const { t } = useT()
  return <span className="mt-1 block text-sm font-semibold text-red-700">{t.errors[code]}</span>
}

function Hint({ error, current, saved, original, onOriginal }: { error?: ErrorCode; current: string; saved: string; original: string; onOriginal: () => void }) {
  const { t } = useT()
  if (error) return <FieldError code={error} />
  const show = (v: string) => clip(v.trim() ? v.replace(/\s*\n\s*/g, ' ') : t.emptyValue)
  if (current !== saved) return <span className="mt-1 block text-xs text-muted" dir="auto">{t.savedNow(show(saved))}</span>
  if (saved === original) return null
  return (
    <span className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted" dir="auto">
      {t.original(show(original))}
      <button type="button" onClick={onOriginal} className="min-h-10 rounded-lg px-2 font-semibold text-navy underline">
        {t.useOriginal}
      </button>
    </span>
  )
}
