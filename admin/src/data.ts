/*
 * Rows of the content tables as the admin panel edits them, plus the small pure helpers shared by
 * the screens (and by the test scripts). Every read and write goes through the signed-in admin's
 * session, so the database rules (admins table + authenticator code + live session) apply.
 */

export interface FaqItem {
  q_ar: string
  a_ar: string
  q_en: string
  a_en: string
}

export interface CategoryRow {
  id: string
  slug: string
  name_ar: string
  name_en: string
  intro_ar: string | null
  intro_en: string | null
  covers_ar: string[]
  covers_en: string[]
  wa_message_ar: string | null
  wa_message_en: string | null
  image_url: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
  is_primary: boolean
}

export interface ServiceRow {
  id: string
  category_id: string
  slug: string
  name_ar: string
  name_en: string
  short_ar: string | null
  short_en: string | null
  body_ar: string | null
  body_en: string | null
  includes_ar: string[]
  includes_en: string[]
  excludes_ar: string[]
  excludes_en: string[]
  options_ar: string[]
  options_en: string[]
  parts_ar: string[]
  parts_en: string[]
  parts_in_stock: boolean
  wa_message_ar: string | null
  wa_message_en: string | null
  faq: FaqItem[]
  has_detail_page: boolean
  featured: boolean
  is_active: boolean
  image_url: string | null
  sort_order: number
}

export const CATEGORY_COLUMNS =
  'id, slug, name_ar, name_en, intro_ar, intro_en, covers_ar, covers_en, wa_message_ar, wa_message_en, image_url, icon, sort_order, is_active, is_primary'

export const SERVICE_COLUMNS =
  'id, category_id, slug, name_ar, name_en, short_ar, short_en, body_ar, body_en, includes_ar, includes_en, excludes_ar, excludes_en, options_ar, options_en, parts_ar, parts_en, parts_in_stock, wa_message_ar, wa_message_en, faq, has_detail_page, featured, is_active, image_url, sort_order'

/** The same rule as the database check on services.slug / categories.slug. */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** "Mixer tap (wall) & valve" → "mixer-tap-wall-and-valve". Empty for Arabic-only text. */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')
}

/** Detail page switched on but a long description missing in either language. */
export const missingLongText = (s: Pick<ServiceRow, 'has_detail_page' | 'body_ar' | 'body_en'>) =>
  s.has_detail_page && (!s.body_ar?.trim() || !s.body_en?.trim())

const text = (value: string | null) => {
  const trimmed = (value ?? '').trim()
  return trimmed ? trimmed : null
}
const list = (items: string[]) => items.map((item) => item.trim()).filter(Boolean)

/** Tidies a service before saving: trimmed text, empty optional text → null, empty list rows dropped. */
export function cleanService(s: ServiceRow) {
  return {
    category_id: s.category_id,
    slug: s.slug.trim(),
    name_ar: s.name_ar.trim(),
    name_en: s.name_en.trim(),
    short_ar: text(s.short_ar),
    short_en: text(s.short_en),
    body_ar: text(s.body_ar),
    body_en: text(s.body_en),
    includes_ar: list(s.includes_ar),
    includes_en: list(s.includes_en),
    excludes_ar: list(s.excludes_ar),
    excludes_en: list(s.excludes_en),
    options_ar: list(s.options_ar),
    options_en: list(s.options_en),
    parts_ar: list(s.parts_ar),
    parts_en: list(s.parts_en),
    parts_in_stock: s.parts_in_stock,
    wa_message_ar: text(s.wa_message_ar),
    wa_message_en: text(s.wa_message_en),
    faq: s.faq
      .map((f) => ({ q_ar: f.q_ar.trim(), a_ar: f.a_ar.trim(), q_en: f.q_en.trim(), a_en: f.a_en.trim() }))
      .filter((f) => f.q_ar || f.a_ar || f.q_en || f.a_en),
    has_detail_page: s.has_detail_page,
    featured: s.featured,
    is_active: s.is_active,
    sort_order: s.sort_order,
  }
}

export function cleanCategory(c: CategoryRow) {
  return {
    name_ar: c.name_ar.trim(),
    name_en: c.name_en.trim(),
    intro_ar: text(c.intro_ar),
    intro_en: text(c.intro_en),
    covers_ar: list(c.covers_ar),
    covers_en: list(c.covers_en),
    wa_message_ar: text(c.wa_message_ar),
    wa_message_en: text(c.wa_message_en),
    sort_order: c.sort_order,
    is_active: c.is_active,
    is_primary: c.is_primary,
  }
}

export function emptyService(categoryId: string, sortOrder: number): ServiceRow {
  return {
    id: '',
    category_id: categoryId,
    slug: '',
    name_ar: '',
    name_en: '',
    short_ar: null,
    short_en: null,
    body_ar: null,
    body_en: null,
    includes_ar: [],
    includes_en: [],
    excludes_ar: [],
    excludes_en: [],
    options_ar: [],
    options_en: [],
    parts_ar: [],
    parts_en: [],
    parts_in_stock: true,
    wa_message_ar: null,
    wa_message_en: null,
    faq: [],
    has_detail_page: false,
    featured: false,
    is_active: true,
    image_url: null,
    sort_order: sortOrder,
  }
}

/** New sort_order values (10, 20, 30 …) for a reordered list; returns only the rows that changed. */
export function renumber<T extends { id: string; sort_order: number }>(ordered: T[]): { id: string; sort_order: number }[] {
  return ordered.flatMap((row, i) => ((i + 1) * 10 === row.sort_order ? [] : [{ id: row.id, sort_order: (i + 1) * 10 }]))
}

/** Moves one item in an array (used by drag and by the up/down buttons). */
export function move<T>(items: T[], from: number, to: number): T[] {
  const next = items.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/* ---------------------------------------------------------------- gallery, products, reviews */

export interface GalleryRow {
  id: string
  category_id: string | null
  /** A service-area key from settings.service_areas, or free text. */
  district: string | null
  caption_ar: string | null
  caption_en: string | null
  image_url: string
  thumb_url: string | null
  before_image_url: string | null
  taken_on: string | null
  sort_order: number
  is_active: boolean
}

export const GALLERY_COLUMNS = 'id, category_id, district, caption_ar, caption_en, image_url, thumb_url, before_image_url, taken_on, sort_order, is_active'

/** The editable fields of a gallery photo (the image URLs are written by the photo actions only). */
export function cleanGallery(g: GalleryRow) {
  return {
    category_id: g.category_id || null,
    district: text(g.district),
    caption_ar: text(g.caption_ar),
    caption_en: text(g.caption_en),
    taken_on: g.taken_on || null,
    sort_order: g.sort_order,
    is_active: g.is_active,
  }
}

export interface ProductCategoryRow {
  id: string
  slug: string
  name_ar: string
  name_en: string
  sort_order: number
  is_active: boolean
}

export interface ProductRow {
  id: string
  category_id: string
  name_ar: string
  name_en: string
  spec_ar: string | null
  spec_en: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
}

export const PRODUCT_CATEGORY_COLUMNS = 'id, slug, name_ar, name_en, sort_order, is_active'
export const PRODUCT_COLUMNS = 'id, category_id, name_ar, name_en, spec_ar, spec_en, image_url, sort_order, is_active'

export function cleanProductCategory(c: ProductCategoryRow) {
  return { slug: c.slug.trim(), name_ar: c.name_ar.trim(), name_en: c.name_en.trim(), sort_order: c.sort_order, is_active: c.is_active }
}

export function cleanProduct(p: ProductRow) {
  return {
    category_id: p.category_id,
    name_ar: p.name_ar.trim(),
    name_en: p.name_en.trim(),
    spec_ar: text(p.spec_ar),
    spec_en: text(p.spec_en),
    sort_order: p.sort_order,
    is_active: p.is_active,
  }
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected'
export type ReviewSource = 'website' | 'whatsapp' | 'in_person' | 'phone' | 'other'
export const MANUAL_SOURCES: ReviewSource[] = ['whatsapp', 'in_person', 'phone', 'other']

export interface ReviewRow {
  id: string
  name: string
  district: string | null
  service_text: string | null
  rating: number
  body: string
  original_body: string | null
  /** Public copy (bucket "site"), only while approved. */
  photo_url: string | null
  /** Private original (bucket "reviews"). */
  photo_path: string | null
  source: ReviewSource
  status: ReviewStatus
  admin_note: string | null
  phone: string | null
  created_at: string
}

export const REVIEW_COLUMNS = 'id, name, district, service_text, rating, body, original_body, photo_url, photo_path, source, status, admin_note, phone, created_at'

/** How many OTHER reviews share each review's phone number (phones are stored normalized, E.164). */
export function otherReviewCounts(reviews: Pick<ReviewRow, 'id' | 'phone'>[]): Map<string, number> {
  const perPhone = new Map<string, number>()
  for (const r of reviews) if (r.phone) perPhone.set(r.phone, (perPhone.get(r.phone) ?? 0) + 1)
  return new Map(reviews.map((r) => [r.id, r.phone ? perPhone.get(r.phone)! - 1 : 0]))
}

/** "+966501234567" → "966501234567" for wa.me links. */
export const waNumber = (phone: string) => phone.replace(/\D/g, '')

/** Contains Arabic letters (used to pick the language of the WhatsApp message to a customer). */
export const hasArabic = (s: string) => /[؀-ۿ]/.test(s)

/** A wa.me link with a short neutral message, in Arabic unless the review is written in another script. */
export function reviewWhatsAppLink(r: Pick<ReviewRow, 'phone' | 'body' | 'name'>): string | null {
  if (!r.phone) return null
  const message = hasArabic(r.body + r.name)
    ? 'السلام عليكم، معك رياض هوم سوليوشن بخصوص تقييمك.'
    : 'Hello, this is Riyadh Home Solution about your review.'
  return `https://wa.me/${waNumber(r.phone)}?text=${encodeURIComponent(message)}`
}
