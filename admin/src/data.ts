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
