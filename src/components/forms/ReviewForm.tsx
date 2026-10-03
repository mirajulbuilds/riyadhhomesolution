import { CheckCircle2, Star } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { localizePath } from '@/i18n/lang'
import { normalizePhone } from '@/lib/phone'
import { track } from '@/lib/track'
import { WhatsAppLink } from '../ContactLinks'
import { BrandIcon } from '../icons/BrandIcon'
import { usePageType, useSite, useStrings } from '../site-context'
import { Field, inputClass } from './Field'

const MAX_NAME = 80
const MAX_BODY = 2000
const MAX_PHOTO = 10 * 1024 * 1024

type Errors = Partial<Record<'name' | 'phone' | 'rating' | 'body' | 'photo' | 'form', string>>

/**
 * Website review form (brief §6.6): name, phone (required, private), area, service, 1–5 stars,
 * text, optional photo. Spam control: a hidden honeypot field; every review stays pending until
 * the owner approves it. Repeat phone numbers are allowed (a customer can have several jobs).
 */
export function ReviewForm({ serviceOptions }: { serviceOptions: { category: string; services: string[] }[] }) {
  const site = useSite()
  const t = useStrings()
  const f = t.reviewForm
  const pageType = usePageType()
  const uid = useId()
  const [rating, setRating] = useState(0)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const phoneInput = String(data.get('phone') ?? '').trim()
    const phone = normalizePhone(phoneInput)
    const body = String(data.get('body') ?? '').trim()
    const area = String(data.get('area') ?? '')
    const service = String(data.get('service') ?? '')
    const photo = data.get('photo')
    const file = photo instanceof File && photo.size > 0 ? photo : null

    const next: Errors = {}
    if (!name) next.name = f.required
    else if (name.length > MAX_NAME) next.name = f.tooLong(MAX_NAME)
    if (!phoneInput) next.phone = f.required
    else if (!phone) next.phone = f.phoneInvalid
    if (rating < 1) next.rating = f.ratingRequired
    if (!body) next.body = f.required
    else if (body.length > MAX_BODY) next.body = f.tooLong(MAX_BODY)
    if (file && !file.type.startsWith('image/')) next.photo = f.photoType
    else if (file && file.size > MAX_PHOTO) next.photo = f.photoTooBig
    setErrors(next)
    const first = (['name', 'phone', 'rating', 'body', 'photo'] as const).find((k) => next[k])
    if (first || !phone) {
      // Focus the first problem (by name: React hasn't re-rendered the error state yet).
      const el = form.elements.namedItem(first ?? 'phone')
      ;(el instanceof RadioNodeList ? (el[0] as HTMLElement | undefined) : (el as HTMLElement | null))?.focus()
      return
    }

    // Honeypot: real people never see this field. Pretend it worked.
    if (String(data.get('website') ?? '')) {
      setStatus('done')
      return
    }

    setStatus('sending')
    try {
      const { submitReview } = await import('@/lib/reviews')
      await submitReview({ name, phone, body, rating, district: area || null, service: service || null, photo: file })
      track('review_submit', { language: site.lang, page_type: pageType, link_location: 'review_form' })
      form.reset()
      setRating(0)
      setStatus('done')
    } catch (err) {
      const reason = (err as { reason?: string }).reason
      setErrors({ form: reason === 'unavailable' ? f.unavailable : f.failed })
      setStatus('idle')
    }
  }

  if (status === 'done') {
    return (
      <div role="status" className="card p-8 text-center">
        <CheckCircle2 aria-hidden="true" className="mx-auto size-12 text-wa" />
        <p className="mt-4 text-lg font-bold text-navy">{f.thanks}</p>
        <button type="button" onClick={() => setStatus('idle')} className="btn btn-outline mt-6">
          {f.another}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card space-y-5 p-6 sm:p-8">
      <Field id={`${uid}-name`} label={f.name} error={errors.name} required>
        {(p) => <input {...p} name="name" type="text" autoComplete="given-name" maxLength={MAX_NAME + 20} className={inputClass} />}
      </Field>

      <Field id={`${uid}-phone`} label={f.phone} hint={f.phoneHint} error={errors.phone} required>
        {(p) => (
          <input
            {...p}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            placeholder="05XXXXXXXX"
            maxLength={24}
            className={`${inputClass} rtl:text-right`}
          />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${uid}-area`} label={f.area}>
          {(p) => (
            <select {...p} name="area" defaultValue="" className={inputClass}>
              <option value="">{f.choose}</option>
              {site.areas.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.name}
                </option>
              ))}
              <option value={f.areaOther}>{f.areaOther}</option>
            </select>
          )}
        </Field>
        <Field id={`${uid}-service`} label={f.service}>
          {(p) => (
            <select {...p} name="service" defaultValue="" className={inputClass}>
              <option value="">{f.choose}</option>
              {serviceOptions.map((g) => (
                <optgroup key={g.category} label={g.category}>
                  {g.services.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
        </Field>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold text-navy">
          {f.rating}
          <span aria-hidden="true" className="ms-0.5 text-orange-text">
            *
          </span>
        </legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer rounded-lg p-1 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-orange">
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                aria-describedby={errors.rating ? `${uid}-rating-error` : undefined}
                className="sr-only"
              />
              <Star aria-hidden="true" className={`size-9 ${n <= rating ? 'fill-orange text-orange' : 'text-line'}`} />
              <span className="sr-only">{t.reviews.stars(n)}</span>
            </label>
          ))}
        </div>
        {errors.rating && (
          <p id={`${uid}-rating-error`} className="mt-1.5 text-xs font-semibold text-[#B42318]">
            {errors.rating}
          </p>
        )}
      </fieldset>

      <Field id={`${uid}-body`} label={f.body} error={errors.body} required>
        {(p) => <textarea {...p} name="body" rows={5} maxLength={MAX_BODY + 50} className={inputClass} />}
      </Field>

      <Field id={`${uid}-photo`} label={f.photo} hint={f.photoHint} error={errors.photo}>
        {(p) => (
          <input
            {...p}
            name="photo"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-muted file:me-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-navy file:px-4 file:py-2.5 file:font-semibold file:text-white"
          />
        )}
      </Field>

      {/* Honeypot — hidden from people and screen readers; bots tend to fill it. */}
      <div aria-hidden="true" className="sr-only">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <p className="text-xs text-muted">
        {f.consent}{' '}
        <Link to={localizePath('/privacy', site.lang)} className="underline hover:text-navy">
          {t.nav.privacy}
        </Link>
      </p>

      {errors.form && (
        <div role="alert" className="rounded-xl border border-[#B42318]/30 bg-[#FEF3F2] p-4 text-sm text-[#B42318]">
          <p className="font-semibold">{errors.form}</p>
          <WhatsAppLink message={{ kind: 'general' }} location="review_form_error" className="mt-3 inline-flex items-center gap-2 font-semibold text-wa underline">
            <BrandIcon name="whatsapp" size={16} />
            {t.cta.whatsappUs}
          </WhatsAppLink>
        </div>
      )}

      <button type="submit" disabled={status === 'sending'} className="btn btn-call w-full disabled:opacity-70 sm:w-auto">
        {status === 'sending' ? f.sending : f.submit}
      </button>
    </form>
  )
}
