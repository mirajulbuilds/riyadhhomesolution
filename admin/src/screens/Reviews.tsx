import { MessageCircle, Phone, Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { normalizePhone } from '../../../src/lib/phone'
import { MANUAL_SOURCES, REVIEW_COLUMNS, otherReviewCounts, reviewWhatsAppLink, type ReviewRow, type ReviewSource, type ReviewStatus } from '../data'
import { DistrictField, districtName, useAreas, type Area } from '../district'
import { Badge, PageTitle, Select, TextArea } from '../form'
import { useT, type Strings } from '../i18n'
import { UnreadableImageError, photoVariants } from '../images'
import { useNav, useUnsavedGuard } from '../nav'
import { addManualReview, deleteReview, editReview, privatePhotoUrl, setReviewStatus, type ManualReview } from '../reviews'
import type { Supabase } from '../supabase'
import { useToast } from '../toast'
import { Button, Card, Field, Notice } from '../ui'
import { SaveBar } from './Categories'

/*
 * Review moderation. Phone numbers, sources, internal notes and original texts are shown here
 * only: the database lets nobody but a signed-in admin (with the authenticator code) read them.
 *   reviews?tab=pending|approved|rejected     reviews?new=1   add a review by hand
 */
export function Reviews({ sb }: { sb: Supabase }) {
  const { route } = useNav()
  return route.params.new ? <ManualReviewForm sb={sb} /> : <ReviewList sb={sb} />
}

const TABS: ReviewStatus[] = ['pending', 'approved', 'rejected']

export const sourceLabel = (t: Strings, s: ReviewSource) =>
  ({ website: t.sourceWebsite, whatsapp: t.sourceWhatsapp, in_person: t.sourceInPerson, phone: t.sourcePhone, other: t.sourceOther })[s]

const statusLabel = (t: Strings, s: ReviewStatus) => ({ pending: t.tabPending, approved: t.tabApproved, rejected: t.tabRejected })[s]

function ReviewList({ sb }: { sb: Supabase }) {
  const { t } = useT()
  const { route, go, refreshPending } = useNav()
  const areas = useAreas(sb)
  const [rows, setRows] = useState<ReviewRow[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [tab, setTab] = useState<ReviewStatus>(TABS.includes(route.params.tab as ReviewStatus) ? (route.params.tab as ReviewStatus) : 'pending')
  const [phone, setPhone] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await sb.from('reviews').select(REVIEW_COLUMNS).order('created_at', { ascending: false })
    if (error) return setFailed(true)
    setRows(data as ReviewRow[])
  }, [sb])
  useEffect(() => void load(), [load])

  const others = useMemo(() => otherReviewCounts(rows ?? []), [rows])
  const counts = useMemo(() => Object.fromEntries(TABS.map((s) => [s, (rows ?? []).filter((r) => r.status === s).length])) as Record<ReviewStatus, number>, [rows])
  const visible = (rows ?? []).filter((r) => (phone ? r.phone === phone : r.status === tab))

  const replace = (row: ReviewRow) => {
    setRows((all) => all && all.map((r) => (r.id === row.id ? row : r)))
    refreshPending()
  }
  const drop = (id: string) => {
    setRows((all) => all && all.filter((r) => r.id !== id))
    refreshPending()
  }

  return (
    <div className="space-y-4">
      <PageTitle title={t.navReviews}>
        <Button onClick={() => go('reviews', { new: '1' })}>
          <Plus className="me-1 size-5" aria-hidden="true" />
          {t.addReview}
        </Button>
      </PageTitle>

      {phone ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-navy/20 bg-navy/5 p-3">
          <span className="me-auto font-semibold text-navy">
            {t.reviewsFromNumber} <span dir="ltr">{phone}</span> ({visible.length})
          </span>
          <Button variant="secondary" onClick={() => setPhone(null)}>
            {t.showAllReviews}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 rounded-2xl border border-line bg-white p-1" role="tablist">
          {TABS.map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={tab === s}
              onClick={() => {
                setTab(s)
                window.history.replaceState(null, '', `?tab=${s}`)
              }}
              className={`min-h-12 rounded-xl px-2 text-sm font-semibold sm:text-base ${tab === s ? 'bg-navy text-white' : 'text-navy'}`}
            >
              {statusLabel(t, s)} ({rows ? counts[s] : '…'})
            </button>
          ))}
        </div>
      )}

      {failed && <Notice>{t.loadFailed}</Notice>}
      {!rows && !failed && <p className="text-muted">{t.loading}</p>}
      {rows && visible.length === 0 && <Notice tone="info">{t.noReviews}</Notice>}

      <ul className="space-y-3">
        {visible.map((r) => (
          <ReviewCard key={r.id} sb={sb} review={r} areas={areas} otherCount={others.get(r.id) ?? 0} showStatus={!!phone} onChange={replace} onDeleted={drop} onShowNumber={() => setPhone(r.phone)} />
        ))}
      </ul>
    </div>
  )
}

function Stars({ rating }: { rating: number }) {
  const { t } = useT()
  return (
    <span className="text-lg tracking-wide text-orange" aria-label={t.starsLabel(rating)} title={t.starsLabel(rating)}>
      {'★'.repeat(rating)}
      <span className="text-line">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

function ReviewCard({
  sb,
  review: r,
  areas,
  otherCount,
  showStatus,
  onChange,
  onDeleted,
  onShowNumber,
}: {
  sb: Supabase
  review: ReviewRow
  areas: Area[]
  otherCount: number
  showStatus: boolean
  onChange: (row: ReviewRow) => void
  onDeleted: (id: string) => void
  onShowNumber: () => void
}) {
  const { t, lang } = useT()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(r.body)
  const [note, setNote] = useState(r.admin_note ?? '')
  const [photo, setPhoto] = useState<string | null>(r.photo_url)
  useUnsavedGuard(editing && (body !== r.body || note !== (r.admin_note ?? '')))

  // The private original is shown through a link that expires after an hour.
  useEffect(() => {
    if (r.photo_url) return setPhoto(r.photo_url)
    if (!r.photo_path) return setPhoto(null)
    let live = true
    void privatePhotoUrl(sb, r.photo_path).then((url) => live && setPhoto(url))
    return () => void (live = false)
  }, [sb, r.photo_url, r.photo_path])

  const when = new Date(r.created_at).toLocaleString(lang === 'ar' ? 'ar-SA-u-nu-latn-ca-gregory' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })
  const wa = reviewWhatsAppLink(r)

  async function move(status: ReviewStatus) {
    if (status === 'rejected' && r.status === 'approved' && !confirm(t.unpublishConfirm)) return
    setBusy(true)
    try {
      const result = await setReviewStatus(sb, r, status)
      onChange(result.review)
      const message = status === 'approved' ? t.reviewApproved : status === 'rejected' ? t.reviewRejected : t.reviewToPending
      if (result.warning) toast('info', t.cleanupWarning(result.warning))
      else toast(result.photoMissing ? 'info' : 'ok', result.photoMissing ? `${message} ${t.photoMissing}` : message)
    } catch (e) {
      toast('error', t.saveFailed((e as Error).message))
    }
    setBusy(false)
  }

  async function saveEdit() {
    if (!body.trim()) return toast('error', t.reviewTextRequired)
    setBusy(true)
    try {
      onChange(await editReview(sb, r.id, { body: body.trim(), admin_note: note.trim() || null }))
      setEditing(false)
      toast('ok', t.saved)
    } catch (e) {
      toast('error', t.saveFailed((e as Error).message))
    }
    setBusy(false)
  }

  async function remove() {
    if (!confirm(t.deleteReviewConfirm(r.name))) return
    setBusy(true)
    try {
      const { warning } = await deleteReview(sb, r)
      onDeleted(r.id)
      toast(warning ? 'info' : 'ok', warning ? t.cleanupWarning(warning) : t.reviewDeleted)
    } catch (e) {
      toast('error', t.saveFailed((e as Error).message))
      setBusy(false)
    }
  }

  const actions: { status: ReviewStatus; label: string }[] = [
    { status: 'approved' as const, label: t.approve },
    { status: 'rejected' as const, label: t.reject },
    { status: 'pending' as const, label: t.backToPending },
  ].filter((a) => a.status !== r.status)

  return (
    <li className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
        <div className="me-auto min-w-0">
          <p className="text-lg font-bold text-navy">{r.name}</p>
          <p className="text-sm text-muted">{[districtName(r.district, areas, lang), r.service_text].filter(Boolean).join(' · ')}</p>
        </div>
        <Stars rating={r.rating} />
      </div>

      <div className="mt-1 flex flex-wrap gap-1">
        <Badge>{sourceLabel(t, r.source)}</Badge>
        <Badge>{when}</Badge>
        {showStatus && <Badge tone={r.status === 'approved' ? 'navy' : 'warn'}>{statusLabel(t, r.status)}</Badge>}
        {r.original_body !== null && r.original_body !== r.body && <Badge tone="warn">{t.editedBadge}</Badge>}
        {otherCount > 0 && (
          <button type="button" onClick={onShowNumber} className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900 underline">
            {t.otherReviews(otherCount)}
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-3 space-y-3">
          <TextArea label={t.reviewText} rows={5} value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} dir="auto" />
          <TextArea label={t.internalNote} rows={2} value={note} onChange={(e) => setNote(e.target.value)} dir="auto" />
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy} onClick={saveEdit}>
              {busy ? t.saving : t.save}
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setBody(r.body)
                setNote(r.admin_note ?? '')
                setEditing(false)
              }}
            >
              {t.cancel}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-3 whitespace-pre-line" dir="auto">
            {r.body}
          </p>
          {r.admin_note && (
            <p className="mt-2 rounded-xl bg-bg px-3 py-2 text-sm" dir="auto">
              <span className="font-semibold text-muted">{t.internalNote}: </span>
              {r.admin_note}
            </p>
          )}
        </>
      )}

      {r.original_body !== null && r.original_body !== r.body && (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer font-semibold text-muted">{t.originalText}</summary>
          <p className="mt-1 whitespace-pre-line rounded-xl bg-bg px-3 py-2" dir="auto">
            {r.original_body}
          </p>
        </details>
      )}

      {(r.photo_path || r.photo_url) && (
        <div className="mt-3">
          {photo ? (
            <a href={photo} target="_blank" rel="noreferrer noopener">
              <img src={photo} alt={t.customerPhoto} className="max-h-60 rounded-xl bg-bg object-cover" />
            </a>
          ) : (
            <p className="text-sm text-muted">{t.photoUnavailable}</p>
          )}
          <p className="mt-1 text-xs text-muted">{r.photo_url ? t.photoPublic : t.photoPrivate}</p>
        </div>
      )}

      {r.phone && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-semibold" dir="ltr">
            {r.phone}
          </span>
          <a href={`tel:${r.phone}`} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-line bg-white px-4 font-semibold text-navy">
            <Phone className="size-5" aria-hidden="true" />
            {t.call}
          </a>
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 font-semibold text-green-800">
              <MessageCircle className="size-5" aria-hidden="true" />
              {t.openWhatsApp}
            </a>
          )}
        </div>
      )}

      {!editing && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
          {actions.map((a) => (
            <Button key={a.status} variant={a.status === 'approved' ? 'primary' : 'secondary'} disabled={busy} onClick={() => void move(a.status)}>
              {a.label}
            </Button>
          ))}
          <Button variant="secondary" disabled={busy} onClick={() => setEditing(true)}>
            {t.editText}
          </Button>
          <Button variant="danger" disabled={busy} onClick={remove} className="ms-auto">
            {t.delete}
          </Button>
        </div>
      )}
    </li>
  )
}

interface ManualDraft {
  name: string
  district: string | null
  service_text: string
  rating: number
  body: string
  phone: string
  source: ManualReview['source'] | ''
  admin_note: string
}

const EMPTY: ManualDraft = { name: '', district: null, service_text: '', rating: 5, body: '', phone: '', source: '', admin_note: '' }

function ManualReviewForm({ sb }: { sb: Supabase }) {
  const { t, lang } = useT()
  const { go } = useNav()
  const toast = useToast()
  const areas = useAreas(sb)
  const [draft, setDraft] = useState<ManualDraft>(EMPTY)
  const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(null)
  const [services, setServices] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [tried, setTried] = useState(false)
  const dirty = JSON.stringify(draft) !== JSON.stringify(EMPTY) || !!photo
  useUnsavedGuard(dirty)

  useEffect(() => {
    void sb
      .from('categories')
      .select('name_ar, name_en')
      .order('sort_order')
      .then(({ data }) => setServices((data ?? []).map((c) => (lang === 'ar' ? c.name_ar : c.name_en))))
  }, [sb, lang])
  useEffect(() => () => void (photo && URL.revokeObjectURL(photo.preview)), [photo])

  const set = <K extends keyof ManualDraft>(key: K, value: ManualDraft[K]) => setDraft((d) => ({ ...d, [key]: value }))
  const phone = draft.phone.trim() ? normalizePhone(draft.phone) : null
  const phoneInvalid = !!draft.phone.trim() && !phone
  const missing = !draft.name.trim() || !draft.body.trim() || !draft.source

  async function save() {
    setTried(true)
    if (missing) return toast('error', t.manualRequired)
    if (phoneInvalid) return toast('error', t.phoneInvalid)
    setBusy(true)
    try {
      const files = photo ? await photoVariants(photo.file) : null
      await addManualReview(
        sb,
        {
          name: draft.name.trim().slice(0, 80),
          district: draft.district?.trim() || null,
          service_text: draft.service_text.trim().slice(0, 120) || null,
          rating: draft.rating,
          body: draft.body.trim(),
          phone,
          source: draft.source as ManualReview['source'],
          admin_note: draft.admin_note.trim() || null,
        },
        files,
      )
      setDraft(EMPTY)
      setPhoto(null)
      toast('ok', t.reviewAdded)
      go('reviews', { tab: 'approved' }, { force: true })
    } catch (e) {
      toast('error', e instanceof UnreadableImageError ? t.unreadableImage(e.fileName) : t.saveFailed((e as Error).message))
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5 pb-24">
      <PageTitle title={t.addReview} onBack={() => go('reviews')} />
      <Notice tone="warn">{t.realReviewsOnly}</Notice>

      <Card>
        <div className="space-y-4">
          <Field label={`${t.customerName} *`} value={draft.name} onChange={(e) => set('name', e.target.value)} maxLength={80} dir="auto" />
          <DistrictField value={draft.district} onChange={(v) => set('district', v)} areas={areas} />
          <div>
            <Field label={t.serviceDone} value={draft.service_text} onChange={(e) => set('service_text', e.target.value)} maxLength={120} list="rhs-services" dir="auto" />
            <datalist id="rhs-services">
              {services.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <fieldset>
            <legend className="mb-1 text-sm font-semibold text-muted">{t.stars} *</legend>
            <div className="flex gap-1" dir="ltr">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('rating', n)}
                  aria-label={t.starsLabel(n)}
                  aria-pressed={draft.rating === n}
                  className={`grid size-12 place-items-center rounded-xl border text-2xl ${n <= draft.rating ? 'border-orange bg-orange/10 text-orange' : 'border-line bg-white text-line'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </fieldset>
          <TextArea label={`${t.reviewText} *`} rows={5} value={draft.body} onChange={(e) => set('body', e.target.value)} maxLength={2000} dir="auto" />
          <Select label={`${t.source} *`} value={draft.source} onChange={(e) => set('source', e.target.value as ManualDraft['source'])}>
            <option value="">{t.chooseSource}</option>
            {MANUAL_SOURCES.map((s) => (
              <option key={s} value={s}>
                {sourceLabel(t, s)}
              </option>
            ))}
          </Select>
          <div>
            <Field label={t.phoneOptional} type="tel" inputMode="tel" dir="ltr" value={draft.phone} onChange={(e) => set('phone', e.target.value)} placeholder="05XXXXXXXX" />
            {phoneInvalid && <p className="mt-1 text-sm font-semibold text-red-700">{t.phoneInvalid}</p>}
            {phone && <p className="mt-1 text-xs text-muted" dir="ltr">{phone}</p>}
          </div>
          <TextArea label={t.internalNote} help={t.internalNoteHelp} rows={2} value={draft.admin_note} onChange={(e) => set('admin_note', e.target.value)} dir="auto" />
          {tried && missing && <Notice>{t.manualRequired}</Notice>}
        </div>
      </Card>

      <Card title={t.photoOptional}>
        {photo && <img src={photo.preview} alt="" className="mb-3 max-h-60 rounded-xl bg-bg object-cover" />}
        <div className="flex flex-wrap gap-3">
          <label className={`inline-flex min-h-12 cursor-pointer items-center rounded-xl border border-line bg-white px-5 font-semibold text-navy ${busy ? 'pointer-events-none opacity-50' : ''}`}>
            {photo ? t.replacePhoto : t.addPhoto}
            <input
              type="file"
              accept="image/*,.heic,.heif"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                if (photo) URL.revokeObjectURL(photo.preview)
                setPhoto({ file, preview: URL.createObjectURL(file) })
              }}
            />
          </label>
          {photo && (
            <Button variant="danger" disabled={busy} onClick={() => setPhoto(null)}>
              {t.removePhoto}
            </Button>
          )}
        </div>
      </Card>

      <SaveBar busy={busy} dirty onSave={save} />
    </div>
  )
}
