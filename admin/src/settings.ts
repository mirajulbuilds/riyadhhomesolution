import { seedSettings } from '../../src/content/seed/settings'
import type { OpeningHours, ServiceArea, SettingsValues, SiteImages, Weekday } from '../../src/content/types'
import { slugify } from './data'
import { photoVariants, storeImage, clearImage } from './images'
import type { Supabase } from './supabase'

/*
 * The Settings screen's data: the rows of the `settings` table it edits (one row per key, JSON
 * values), the form model (every input is a string while typing), validation, and saving.
 * The public site reads the same keys at build time (src/content/server.ts); a key missing from
 * the table falls back to the seed value (src/content/seed/settings.ts), which is also the
 * "original" value the screen offers to restore.
 */

export const EDITED_KEYS = [
  'phone_display',
  'phone_e164',
  'whatsapp_number',
  'emergency',
  'hours',
  'hours_note',
  'since_year',
  'years_in_building',
  'technicians',
  'areas_count',
  'service_areas',
  'service_areas_note',
  'shop_lat',
  'shop_lng',
  'social',
  'story',
  'google_place_id',
] as const satisfies readonly (keyof SettingsValues)[]

export type EditedKey = (typeof EDITED_KEYS)[number]
export type Edited = Pick<SettingsValues, EditedKey>
export const DEFAULTS: Edited = Object.fromEntries(EDITED_KEYS.map((k) => [k, seedSettings[k]])) as Edited

/** Database rows over the seed defaults (a key missing from the table = its seed value). */
export function fromRows(rows: { key: string; value: unknown }[]): Edited {
  const values: Record<string, unknown> = { ...DEFAULTS }
  for (const { key, value } of rows) if ((EDITED_KEYS as readonly string[]).includes(key) && value !== null && value !== undefined) values[key] = value
  return values as Edited
}

export const siteImagesFrom = (rows: { key: string; value: unknown }[]): SiteImages => ({
  ...seedSettings.site_images,
  ...((rows.find((r) => r.key === 'site_images')?.value as Partial<SiteImages> | undefined) ?? {}),
})

/* ------------------------------------------------------------------ phone numbers */

/**
 * The shop's phone / WhatsApp number → E.164 + the way it is shown, or null when invalid.
 *   Saudi mobile    05XXXXXXXX · 5XXXXXXXX · 9665XXXXXXXX · +9665… · 009665…  → shown 05XXXXXXXX
 *   Saudi landline  011XXXXXXX (area codes 011–017), with or without +966      → shown 011XXXXXXX
 *   International   + or 00 and the country code, 8–15 digits                 → shown +<digits>
 * Spaces, dashes, dots and brackets are ignored; Arabic-Indic digits are read as 0–9.
 */
export function normalizeShopPhone(input: string): { e164: string; display: string } | null {
  const ascii = input
    .trim()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\s\-.()‎‏‪-‮]/g, '')
  if (!/^\+?\d+$/.test(ascii)) return null
  const plus = ascii.startsWith('+')
  let digits = ascii.replace(/^\+/, '')
  let international = plus
  if (!plus && digits.startsWith('00')) {
    digits = digits.slice(2)
    international = true
  }
  if (!international) {
    if (/^05\d{8}$/.test(digits)) digits = `966${digits.slice(1)}`
    else if (/^5\d{8}$/.test(digits)) digits = `966${digits}`
    else if (/^01[1-7]\d{7}$/.test(digits)) digits = `966${digits.slice(1)}`
    else if (!digits.startsWith('966')) return null
  }
  if (digits.startsWith('966')) {
    const local = digits.slice(3)
    return /^5\d{8}$/.test(local) || /^1[1-7]\d{7}$/.test(local) ? { e164: `+${digits}`, display: `0${local}` } : null
  }
  return /^[1-9]\d{7,14}$/.test(digits) ? { e164: `+${digits}`, display: `+${digits}` } : null
}

/* ------------------------------------------------------------------ form model */

export interface AreaForm {
  /** Stable id used by gallery photos and the website forms; '' for a new area (made on save). */
  key: string
  ar: string
  en: string
  /** "24.7919, 46.7443" or '' (no pin on the map). */
  coords: string
}

export interface SettingsForm {
  phone: string
  whatsapp: string
  emergency_ar: string
  emergency_en: string
  week_opens: string
  week_closes: string
  fri_opens: string
  fri_closes: string
  hours_note_ar: string
  hours_note_en: string
  since_year: string
  years_in_building: string
  technicians: string
  areas_count: string
  areas: AreaForm[]
  areas_note_ar: string
  areas_note_en: string
  shop_coords: string
  facebook: string
  instagram: string
  tiktok: string
  snapchat: string
  story_ar: string
  story_en: string
  google_place_id: string
}

export type FieldId = Exclude<keyof SettingsForm, 'areas'>

const WEEK_DAYS: Weekday[] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu']
const coordsText = (lat: number | undefined, lng: number | undefined) => (typeof lat === 'number' && typeof lng === 'number' ? `${lat}, ${lng}` : '')
const whatsappDisplay = (digits: string) => normalizeShopPhone(`+${digits.replace(/\D/g, '')}`)?.display ?? digits

export function toForm(v: Edited): SettingsForm {
  const week = v.hours.find((h) => h.days.includes('sat')) ?? DEFAULTS.hours[0]
  const fri = v.hours.find((h) => h.days.includes('fri')) ?? DEFAULTS.hours[1]
  return {
    phone: v.phone_display,
    whatsapp: whatsappDisplay(v.whatsapp_number),
    emergency_ar: v.emergency.ar,
    emergency_en: v.emergency.en,
    week_opens: week.opens,
    week_closes: week.closes,
    fri_opens: fri.opens,
    fri_closes: fri.closes,
    hours_note_ar: v.hours_note?.ar ?? '',
    hours_note_en: v.hours_note?.en ?? '',
    since_year: String(v.since_year),
    years_in_building: String(v.years_in_building),
    technicians: String(v.technicians),
    areas_count: String(v.areas_count ?? 0),
    areas: v.service_areas.map((a) => ({ key: a.key, ar: a.ar, en: a.en, coords: coordsText(a.lat, a.lng) })),
    areas_note_ar: v.service_areas_note.ar,
    areas_note_en: v.service_areas_note.en,
    shop_coords: coordsText(v.shop_lat, v.shop_lng),
    facebook: v.social.facebook,
    instagram: v.social.instagram,
    tiktok: v.social.tiktok,
    snapchat: v.social.snapchat,
    story_ar: v.story.ar.join('\n\n'),
    story_en: v.story.en.join('\n\n'),
    google_place_id: v.google_place_id,
  }
}

/* ------------------------------------------------------------------ validation */

export type ErrorCode =
  | 'required'
  | 'phone'
  | 'time'
  | 'sameTime'
  | 'year'
  | 'number'
  | 'coords'
  | 'riyadh'
  | 'url'
  | 'urlHost'
  | 'placeId'
  | 'noAreas'
  | 'areaNames'
  | 'areaCoords'

export type Errors = Partial<Record<FieldId | 'areas', ErrorCode>> & { areaRows?: Record<number, ErrorCode> }

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

/** "24.7950505, 46.7489991" (comma, Arabic comma or space between) → numbers, or null. */
export function parseCoords(text: string): { lat: number; lng: number } | null {
  const m = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*[,،\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/.exec(text.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/٫/g, '.'))
  if (!m) return null
  const lat = Number(m[1])
  const lng = Number(m[2])
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
}

/** The map and the directions link only make sense for places in and around Riyadh. */
export const inRiyadh = ({ lat, lng }: { lat: number; lng: number }) => lat >= 23.5 && lat <= 26 && lng >= 45.5 && lng <= 48

export const SOCIAL_HOSTS = {
  facebook: ['facebook.com', 'fb.com', 'fb.me'],
  instagram: ['instagram.com', 'instagr.am'],
  tiktok: ['tiktok.com'],
  snapchat: ['snapchat.com'],
} as const
export type SocialName = keyof typeof SOCIAL_HOSTS

/** '' (icon hidden) or an https link to that network → null; otherwise the error. */
export function socialError(name: SocialName, value: string): ErrorCode | null {
  const text = value.trim()
  if (!text) return null
  let url: URL
  try {
    url = new URL(text)
  } catch {
    return 'url'
  }
  if (url.protocol !== 'https:' || !url.hostname.includes('.')) return 'url'
  const host = url.hostname.toLowerCase()
  return SOCIAL_HOSTS[name].some((h) => host === h || host.endsWith(`.${h}`)) ? null : 'urlHost'
}

/** Google Place IDs look like "ChIJ…" (letters, digits, - and _). Empty = not set yet. */
export const placeIdError = (value: string): ErrorCode | null => (!value.trim() || /^[A-Za-z0-9_-]{10,300}$/.test(value.trim()) ? null : 'placeId')

const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

function intIn(text: string, min: number, max: number): number | null {
  const t = text.trim()
  if (!/^\d+$/.test(t)) return null
  const n = Number(t)
  return n >= min && n <= max ? n : null
}

/** A unique key for a new area, from its English name ("Al Nakheel" → "al-nakheel"). */
function newAreaKey(en: string, taken: Set<string>): string {
  const base = slugify(en) || 'area'
  let key = base
  for (let i = 2; taken.has(key); i++) key = `${base}-${i}`
  return key
}

/** Checks every field; returns the values to store, or the errors (by field) when any. */
export function validate(form: SettingsForm, now = new Date()): { values: Edited | null; errors: Errors } {
  const errors: Errors = {}
  const req = (id: FieldId) => {
    if (!form[id].trim()) errors[id] = 'required'
  }

  const phone = normalizeShopPhone(form.phone)
  if (!phone) errors.phone = form.phone.trim() ? 'phone' : 'required'
  const whatsapp = normalizeShopPhone(form.whatsapp)
  if (!whatsapp) errors.whatsapp = form.whatsapp.trim() ? 'phone' : 'required'

  req('emergency_ar')
  req('emergency_en')

  for (const id of ['week_opens', 'week_closes', 'fri_opens', 'fri_closes'] as const) if (!TIME.test(form[id])) errors[id] = 'time'
  if (!errors.week_closes && !errors.week_opens && form.week_opens === form.week_closes) errors.week_closes = 'sameTime'
  if (!errors.fri_closes && !errors.fri_opens && form.fri_opens === form.fri_closes) errors.fri_closes = 'sameTime'

  const sinceYear = intIn(form.since_year, 1900, now.getFullYear())
  if (sinceYear === null) errors.since_year = 'year'
  const years = intIn(form.years_in_building, 0, 150)
  if (years === null) errors.years_in_building = 'number'
  const technicians = intIn(form.technicians, 1, 999)
  if (technicians === null) errors.technicians = 'number'
  const areasCount = form.areas_count.trim() === '' ? 0 : intIn(form.areas_count, 0, 999)
  if (areasCount === null) errors.areas_count = 'number'

  const rows: Record<number, ErrorCode> = {}
  const taken = new Set(form.areas.map((a) => a.key).filter(Boolean))
  const areas: ServiceArea[] = []
  form.areas.forEach((a, i) => {
    if (!a.ar.trim() || !a.en.trim()) return void (rows[i] = 'areaNames')
    let point: { lat: number; lng: number } | null = null
    if (a.coords.trim()) {
      point = parseCoords(a.coords)
      if (!point || !inRiyadh(point)) return void (rows[i] = 'areaCoords')
    }
    let key = a.key
    if (!key) {
      key = newAreaKey(a.en, taken)
      taken.add(key)
    }
    areas.push({ key, ar: a.ar.trim(), en: a.en.trim(), ...(point ? { lat: point.lat, lng: point.lng } : {}) })
  })
  if (form.areas.length === 0) errors.areas = 'noAreas'
  if (Object.keys(rows).length) errors.areaRows = rows

  const shop = parseCoords(form.shop_coords)
  if (!shop) errors.shop_coords = form.shop_coords.trim() ? 'coords' : 'required'
  else if (!inRiyadh(shop)) errors.shop_coords = 'riyadh'

  for (const name of Object.keys(SOCIAL_HOSTS) as SocialName[]) {
    const error = socialError(name, form[name])
    if (error) errors[name] = error
  }

  const storyAr = paragraphs(form.story_ar)
  const storyEn = paragraphs(form.story_en)
  if (!storyAr.length) errors.story_ar = 'required'
  if (!storyEn.length) errors.story_en = 'required'

  const placeError = placeIdError(form.google_place_id)
  if (placeError) errors.google_place_id = placeError

  if (Object.keys(errors).length) return { values: null, errors }
  return {
    errors,
    values: {
      phone_display: phone!.display,
      phone_e164: phone!.e164,
      whatsapp_number: whatsapp!.e164.slice(1),
      emergency: { ar: form.emergency_ar.trim(), en: form.emergency_en.trim() },
      hours: [
        { days: WEEK_DAYS, opens: form.week_opens, closes: form.week_closes },
        { days: ['fri'], opens: form.fri_opens, closes: form.fri_closes },
      ] satisfies OpeningHours[],
      hours_note: { ar: form.hours_note_ar.trim(), en: form.hours_note_en.trim() },
      since_year: sinceYear!,
      years_in_building: years!,
      technicians: technicians!,
      areas_count: areasCount!,
      service_areas: areas,
      service_areas_note: { ar: form.areas_note_ar.trim(), en: form.areas_note_en.trim() },
      shop_lat: shop!.lat,
      shop_lng: shop!.lng,
      social: {
        facebook: form.facebook.trim(),
        instagram: form.instagram.trim(),
        tiktok: form.tiktok.trim(),
        snapchat: form.snapchat.trim(),
      },
      story: { ar: storyAr, en: storyEn },
      google_place_id: form.google_place_id.trim(),
    },
  }
}

/* ------------------------------------------------------------------ saving */

/** JSON with object keys sorted: the database (jsonb) stores keys in its own order. */
export const canonical = (value: unknown): string =>
  JSON.stringify(value, (_, v: unknown) =>
    v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([x], [y]) => (x < y ? -1 : 1))) : v,
  )

/** The rows that differ from what is stored (only those are written). */
export function changedRows(values: Edited, saved: Edited): { key: EditedKey; value: unknown }[] {
  return EDITED_KEYS.filter((k) => canonical(values[k]) !== canonical(saved[k])).map((key) => ({ key, value: values[key] }))
}

/** Writes the rows (insert or update by key). Fails unless every row was written. */
export async function saveRows(sb: Supabase, rows: { key: string; value: unknown }[]): Promise<{ error: { message: string } | null }> {
  if (!rows.length) return { error: null }
  const { data, error } = await sb.from('settings').upsert(rows, { onConflict: 'key' }).select('key')
  if (error) return { error }
  return (data ?? []).length === rows.length ? { error: null } : { error: { message: 'no permission' } }
}

export async function loadSettings(sb: Supabase): Promise<{ values: Edited; images: SiteImages } | null> {
  const { data, error } = await sb.from('settings').select('key, value').in('key', [...EDITED_KEYS, 'site_images'])
  if (error) return null
  return { values: fromRows(data), images: siteImagesFrom(data) }
}

/* ------------------------------------------------------------------ About page photos */

/*
 * Bucket "site" (public): about/shop/<stamp>.webp and about/team/<stamp>.webp (+ -thumb, 600 px)
 * → settings.site_images.about_shop / about_team. Saved at once (like the other photo screens):
 * the new URL is stored first, then the folder's old files are deleted, so nothing is left behind.
 */
export type AboutPhoto = 'shop' | 'team'
export const aboutFolder = (kind: AboutPhoto) => `about/${kind}`

/** Stores one About photo URL ('' = none), keeping the other one as it is in the database now. */
async function setAboutPhoto(sb: Supabase, kind: AboutPhoto, url: string) {
  const { data, error } = await sb.from('settings').select('key, value').eq('key', 'site_images')
  if (error) return { error }
  const images = siteImagesFrom(data ?? [])
  return saveRows(sb, [{ key: 'site_images', value: { ...images, [`about_${kind}`]: url } }])
}

export async function uploadAboutPhoto(sb: Supabase, kind: AboutPhoto, file: File | { files: Awaited<ReturnType<typeof photoVariants>> }) {
  const files = file instanceof File ? await photoVariants(file) : file.files
  return storeImage(sb, aboutFolder(kind), files, (url) => setAboutPhoto(sb, kind, url), 'site')
}

export const removeAboutPhoto = (sb: Supabase, kind: AboutPhoto) => clearImage(sb, aboutFolder(kind), () => setAboutPhoto(sb, kind, ''), 'site')
