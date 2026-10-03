import type { Lang } from '@/i18n/lang'
import type {
  Category,
  CategoryRow,
  CategorySummary,
  Faq,
  FaqRow,
  GalleryItem,
  GoogleSummary,
  Product,
  Review,
  ServiceCard,
  ServiceDetail,
  ServiceRow,
  Site,
  SiteContent,
} from './types'

/*
 * Turns bilingual database rows into one-language view models, and builds the data each
 * route loader returns. Runs at build time only; pages import just the `*Data` types.
 */

/** row.name_ar / row.name_en → the value for `lang` ('' when empty). */
function pick(row: object, key: string, lang: Lang): string {
  const value = (row as Record<string, unknown>)[`${key}_${lang}`]
  return typeof value === 'string' ? value : ''
}

function pickList(row: object, key: string, lang: Lang): string[] {
  const value = (row as Record<string, unknown>)[`${key}_${lang}`]
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && v.trim() !== '') : []
}

/** Paragraphs are separated by a blank line in the database. */
const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

const faqs = (rows: FaqRow[] | null | undefined, lang: Lang): Faq[] =>
  (rows ?? [])
    .map((f) => ({ q: lang === 'ar' ? f.q_ar : f.q_en, a: lang === 'ar' ? f.a_ar : f.a_en }))
    .filter((f) => f.q && f.a)

/* ----------------------------- site ----------------------------- */

export function toSite(content: SiteContent, lang: Lang): Site {
  const s = content.settings
  const address = {
    street: s.address.street[lang],
    district: s.address.district[lang],
    city: s.address.city[lang],
    postalCode: s.address.postal_code,
    country: s.address.country,
  }
  const sep = lang === 'ar' ? '، ' : ', '
  return {
    lang,
    brand: s.brand[lang],
    phoneDisplay: s.phone_display,
    phoneE164: s.phone_e164,
    whatsappNumber: s.whatsapp_number.replace(/\D/g, ''),
    address,
    addressLine: `${address.street}${sep}${address.district}${sep}${address.city} ${address.postalCode}`,
    plusCode: s.plus_code,
    mapsUrl: s.maps_url,
    geo: s.geo,
    hours: s.hours,
    emergency: s.emergency[lang],
    sinceYear: s.since_year,
    yearsInBuilding: s.years_in_building,
    technicians: s.technicians,
    areas: s.service_areas.map((a) => ({ key: a.key, name: a[lang], lat: a.lat, lng: a.lng })),
    areasNote: s.service_areas_note[lang],
    images: {
      aboutShop: s.site_images?.about_shop?.trim() || null,
      aboutTeam: s.site_images?.about_team?.trim() || null,
    },
    social: (['facebook', 'instagram', 'tiktok', 'snapchat'] as const)
      .map((name) => ({ name, url: s.social[name]?.trim() ?? '' }))
      .filter((x) => x.url !== ''),
    googlePlaceId: s.google_place_id,
    nav: content.categories.map((c) => ({ slug: c.slug, name: pick(c, 'name', lang), isPrimary: c.is_primary, icon: c.icon })),
    buildYear: new Date().getFullYear(),
  }
}

/* -------------------------- categories -------------------------- */

export function toCategorySummary(row: CategoryRow, lang: Lang): CategorySummary {
  const name = pick(row, 'name', lang)
  return {
    slug: row.slug,
    name,
    headline: pick(row, 'headline', lang) || name,
    intro: pick(row, 'intro', lang),
    icon: row.icon,
    imageUrl: row.image_url,
    isPrimary: row.is_primary,
  }
}

export function toCategory(row: CategoryRow, lang: Lang): Category {
  const summary = toCategorySummary(row, lang)
  return {
    ...summary,
    metaDescription: pick(row, 'meta_description', lang) || summary.intro,
    covers: pickList(row, 'covers', lang),
    faq: faqs(row.faq, lang),
  }
}

/* --------------------------- services --------------------------- */

export function toServiceCard(row: ServiceRow, categorySlug: string, lang: Lang): ServiceCard {
  return {
    slug: row.slug,
    categorySlug,
    name: pick(row, 'name', lang),
    short: pick(row, 'short', lang),
    imageUrl: row.image_url,
    hasDetailPage: row.has_detail_page,
    featured: row.featured,
    partsInStock: row.parts_in_stock,
    waExtraLines: pick(row, 'wa_extra_lines', lang) || null,
  }
}

export function toServiceDetail(row: ServiceRow, categorySlug: string, lang: Lang): ServiceDetail {
  return {
    ...toServiceCard(row, categorySlug, lang),
    body: paragraphs(pick(row, 'body', lang)),
    includes: pickList(row, 'includes', lang),
    excludes: pickList(row, 'excludes', lang),
    options: pickList(row, 'options', lang),
    parts: pickList(row, 'parts', lang),
    faq: faqs(row.faq, lang),
    updatedAt: row.updated_at,
  }
}

/** Active services of one category, in admin order. */
function servicesOf(content: SiteContent, category: CategoryRow) {
  return content.services.filter((s) => s.category_id === category.id)
}

/* ---------------------- gallery & reviews ----------------------- */

function areaName(content: SiteContent, district: string | null, lang: Lang): string | null {
  if (!district) return null
  const area = content.settings.service_areas.find((a) => a.key === district)
  return area ? area[lang] : district
}

function toGalleryItems(content: SiteContent, lang: Lang): GalleryItem[] {
  const slugById = new Map(content.categories.map((c) => [c.id, c.slug]))
  return content.gallery.map((g) => ({
    id: g.id,
    categorySlug: g.category_id ? (slugById.get(g.category_id) ?? null) : null,
    district: areaName(content, g.district, lang),
    caption: pick(g, 'caption', lang),
    imageUrl: g.image_url,
    thumbUrl: g.thumb_url,
    beforeImageUrl: g.before_image_url,
    takenOn: g.taken_on,
  }))
}

function toReviews(content: SiteContent, lang: Lang): Review[] {
  return content.reviews.map((r) => ({
    id: r.id,
    name: r.name,
    district: areaName(content, r.district, lang),
    service: r.service_text,
    rating: r.rating,
    body: r.body,
    photoUrl: r.photo_url,
    createdAt: r.created_at,
  }))
}

function toGoogleSummary(content: SiteContent): GoogleSummary | null {
  const cache = content.googleReviews
  if (!cache) return null
  return {
    rating: cache.payload.rating ?? null,
    count: cache.payload.userRatingCount ?? null,
    reviews: cache.payload.reviews ?? [],
    fetchedAt: cache.fetched_at,
  }
}

/* --------------------------- page data -------------------------- */

export const layoutData = (c: SiteContent, lang: Lang) => ({ site: toSite(c, lang) })

export const homeData = (c: SiteContent, lang: Lang) => ({
  categories: c.categories.map((row) => ({ ...toCategorySummary(row, lang), serviceCount: servicesOf(c, row).length })),
  faq: faqs(c.settings.home_faq, lang),
  gallery: toGalleryItems(c, lang).slice(0, 6),
  reviews: toReviews(c, lang).slice(0, 12),
  google: toGoogleSummary(c),
})

export const servicesHubData = (c: SiteContent, lang: Lang) => ({
  categories: c.categories.map((row) => ({
    ...toCategorySummary(row, lang),
    services: servicesOf(c, row).map((s) => toServiceCard(s, row.slug, lang)),
  })),
})

export function categoryData(c: SiteContent, lang: Lang, slug: string | undefined) {
  const row = c.categories.find((x) => x.slug === slug)
  if (!row) return null
  return {
    category: toCategory(row, lang),
    services: servicesOf(c, row).map((s) => toServiceCard(s, row.slug, lang)),
    others: c.categories.filter((x) => x.id !== row.id).map((x) => ({ slug: x.slug, name: pick(x, 'name', lang), icon: x.icon })),
  }
}

export function serviceData(c: SiteContent, lang: Lang, categorySlug: string | undefined, slug: string | undefined) {
  const category = c.categories.find((x) => x.slug === categorySlug)
  if (!category) return null
  const siblings = servicesOf(c, category)
  const row = siblings.find((s) => s.slug === slug && s.has_detail_page)
  if (!row) return null
  const related = siblings.filter((s) => s.id !== row.id)
  return {
    category: toCategorySummary(category, lang),
    faq: faqs(category.faq, lang),
    service: toServiceDetail(row, category.slug, lang),
    // Other detail pages first, then the rest, so "related" links lead somewhere useful.
    related: [...related.filter((s) => s.has_detail_page), ...related.filter((s) => !s.has_detail_page)]
      .slice(0, 6)
      .map((s) => toServiceCard(s, category.slug, lang)),
  }
}

export const productsData = (c: SiteContent, lang: Lang) => ({
  categories: c.productCategories.map((pc) => ({
    slug: pc.slug,
    name: pick(pc, 'name', lang),
    products: c.products
      .filter((p) => p.category_id === pc.id)
      .map((p): Product => ({ id: p.id, name: pick(p, 'name', lang), spec: pick(p, 'spec', lang), imageUrl: p.image_url })),
  })),
})

export const ourWorkData = (c: SiteContent, lang: Lang) => ({
  categories: c.categories.map((row) => ({ slug: row.slug, name: pick(row, 'name', lang) })),
  items: toGalleryItems(c, lang),
})

/** Category + service names, for the service select in the review and visit-request forms. */
const serviceOptions = (c: SiteContent, lang: Lang) =>
  c.categories.map((row) => ({
    category: pick(row, 'name', lang),
    services: servicesOf(c, row).map((s) => pick(s, 'name', lang)),
  }))

export const reviewsData = (c: SiteContent, lang: Lang) => ({
  reviews: toReviews(c, lang),
  google: toGoogleSummary(c),
  serviceOptions: serviceOptions(c, lang),
})

export const aboutData = (c: SiteContent, lang: Lang) => ({
  story: c.settings.story[lang],
})

export const contactData = (c: SiteContent, lang: Lang) => ({
  serviceOptions: serviceOptions(c, lang),
})

export type LayoutData = ReturnType<typeof layoutData>
export type HomeData = ReturnType<typeof homeData>
export type ServicesHubData = ReturnType<typeof servicesHubData>
export type CategoryData = NonNullable<ReturnType<typeof categoryData>>
export type ServiceData = NonNullable<ReturnType<typeof serviceData>>
export type ProductsData = ReturnType<typeof productsData>
export type OurWorkData = ReturnType<typeof ourWorkData>
export type ReviewsData = ReturnType<typeof reviewsData>
export type AboutData = ReturnType<typeof aboutData>
export type ContactData = ReturnType<typeof contactData>
