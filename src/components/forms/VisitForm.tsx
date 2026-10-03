import { useId, useState, type FormEvent } from 'react'
import { buildWhatsAppMessage, whatsappHref } from '@/lib/contact'
import { track } from '@/lib/track'
import { BrandIcon } from '../icons/BrandIcon'
import { useLeadTag, usePageType, useSite, useStrings } from '../site-context'
import { Field, inputClass } from './Field'

type Errors = Partial<Record<'name' | 'district' | 'service', string>>

/**
 * "Request a visit" (brief §6.9): composes a WhatsApp message from the form and opens wa.me.
 * Nothing is sent to our servers.
 */
export function VisitForm({ serviceOptions }: { serviceOptions: { category: string; services: string[] }[] }) {
  const site = useSite()
  const t = useStrings()
  const c = t.contact
  const tag = useLeadTag()
  const pageType = usePageType()
  const uid = useId()
  const [errors, setErrors] = useState<Errors>({})

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const districtKey = String(data.get('district') ?? '')
    const service = String(data.get('service') ?? '')
    const description = String(data.get('description') ?? '').trim()

    const next: Errors = {}
    if (!name) next.name = t.reviewForm.required
    if (!districtKey) next.district = t.reviewForm.required
    if (!service) next.service = t.reviewForm.required
    setErrors(next)
    const first = (['name', 'district', 'service'] as const).find((k) => next[k])
    if (first) {
      ;(e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus()
      return
    }

    const district = site.areas.find((a) => a.key === districtKey)?.name ?? districtKey
    const text = buildWhatsAppMessage({ kind: 'visit', name, district, service, description }, site.lang, tag)
    const params = { language: site.lang, page_type: pageType, link_location: 'visit_form', service }
    track('contact_form_submit', params)
    track('whatsapp_click', params)
    window.open(whatsappHref(site.whatsappNumber, text), '_blank', 'noopener')
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card space-y-5 p-6 sm:p-8">
      <div>
        <h2 className="text-xl font-bold">{c.formTitle}</h2>
        <p className="mt-1 text-sm text-muted">{c.formLead}</p>
      </div>

      <Field id={`${uid}-name`} label={c.name} error={errors.name} required>
        {(p) => <input {...p} name="name" type="text" autoComplete="name" maxLength={80} className={inputClass} />}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${uid}-district`} label={c.district} error={errors.district} required>
          {(p) => (
            <select {...p} name="district" defaultValue="" className={inputClass}>
              <option value="">{t.reviewForm.choose}</option>
              {site.areas.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.name}
                </option>
              ))}
              <option value={t.reviewForm.areaOther}>{t.reviewForm.areaOther}</option>
            </select>
          )}
        </Field>
        <Field id={`${uid}-service`} label={c.service} error={errors.service} required>
          {(p) => (
            <select {...p} name="service" defaultValue="" className={inputClass}>
              <option value="">{t.reviewForm.choose}</option>
              {serviceOptions.map((g) => (
                <optgroup key={g.category} label={g.category}>
                  {g.services.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value={c.otherService}>{c.otherService}</option>
            </select>
          )}
        </Field>
      </div>

      <Field id={`${uid}-description`} label={c.description}>
        {(p) => <textarea {...p} name="description" rows={4} maxLength={1000} placeholder={c.descriptionHint} className={inputClass} />}
      </Field>

      <button type="submit" className="btn btn-wa w-full sm:w-auto">
        <BrandIcon name="whatsapp" size={20} />
        {c.submit}
      </button>
      <p className="text-xs text-muted">{c.note}</p>
    </form>
  )
}
