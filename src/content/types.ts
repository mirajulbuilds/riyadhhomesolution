import type { Lang } from '@/i18n/lang'

/* ------------------------------------------------------------------ */
/* Database rows — mirror supabase/migrations (snake_case, bilingual). */
/* ------------------------------------------------------------------ */

export interface Bilingual {
  ar: string
  en: string
}

export interface FaqRow {
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
  /** H1 on the category landing page, e.g. «سباك في الرياض — غرناطة والأحياء المجاورة». */
  headline_ar: string | null
  headline_en: string | null
  intro_ar: string | null
  intro_en: string | null
  meta_description_ar: string | null
  meta_description_en: string | null
  covers_ar: string[]
  covers_en: string[]
  faq: FaqRow[]
  icon: string | null
  image_url: string | null
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
  /** Paragraphs separated by a blank line. */
  body_ar: string | null
  body_en: string | null
  includes_ar: string[]
  includes_en: string[]
  excludes_ar: string[]
  excludes_en: string[]
  options_ar: string[]
  options_en: string[]
  /** "Parts we stock" list on the detail page (no brand names). */
  parts_ar: string[]
  parts_en: string[]
  parts_in_stock: boolean
  /** Extra lines added to the WhatsApp message, one per line, e.g. "المقاس: \nالعدد: ". */
  wa_extra_lines_ar: string | null
  wa_extra_lines_en: string | null
  image_url: string | null
  faq: FaqRow[]
  has_detail_page: boolean
  featured: boolean
  sort_order: number
  is_active: boolean
  updated_at: string | null
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

export interface GalleryRow {
  id: string
  category_id: string | null
  /** Service-area key from settings.service_areas when picked from the list, otherwise free text. */
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

/** Columns the public may read (admin_note, source and client_hash stay private). */
export interface PublicReviewRow {
  id: string
  name: string
  district: string | null
  service_text: string | null
  rating: number
  body: string
  photo_url: string | null
  created_at: string
}

export interface GoogleReviewsPayload {
  rating?: number
  userRatingCount?: number
  reviews?: Array<{
    authorName: string
    authorPhotoUri?: string
    authorUri?: string
    rating: number
    text?: string
    relativePublishTimeDescription?: string
    publishTime?: string
  }>
}

/* ------------------------------------------------------------------ */
/* Settings — one row per key in the `settings` table.                */
/* ------------------------------------------------------------------ */

export type Weekday = 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri'

export interface OpeningHours {
  days: Weekday[]
  /** 24h "HH:MM" */
  opens: string
  closes: string
}

export interface ServiceArea {
  key: string
  ar: string
  en: string
  /** Approximate district centre, used to place the pin on the areas map. Optional. */
  lat?: number
  lng?: number
}

/** Photos the owner uploads from the admin panel; empty until then. */
export interface SiteImages {
  about_shop: string
  about_team: string
}

export interface SettingsValues {
  brand: Bilingual
  /** Shown to people, e.g. "0500569163". */
  phone_display: string
  /** Used in tel: links, e.g. "+966500569163". */
  phone_e164: string
  /** Digits only, used in wa.me links, e.g. "966500569163". */
  whatsapp_number: string
  address: {
    street: Bilingual
    district: Bilingual
    city: Bilingual
    postal_code: string
    country: string
  }
  plus_code: string
  maps_url: string
  geo: { lat: number; lng: number }
  hours: OpeningHours[]
  emergency: Bilingual
  since_year: number
  /** Shown as "20+". */
  years_in_building: number
  /** Shown as "10+". */
  technicians: number
  service_areas: ServiceArea[]
  service_areas_note: Bilingual
  social: { facebook: string; instagram: string; tiktok: string; snapchat: string }
  story: { ar: string[]; en: string[] }
  google_place_id: string
  home_faq: FaqRow[]
  site_images: SiteImages
}

export type SettingsKey = keyof SettingsValues

/** Everything the build reads, in database shape. */
export interface SiteContent {
  source: 'supabase' | 'seed'
  settings: SettingsValues
  categories: CategoryRow[]
  services: ServiceRow[]
  productCategories: ProductCategoryRow[]
  products: ProductRow[]
  gallery: GalleryRow[]
  reviews: PublicReviewRow[]
  googleReviews: { payload: GoogleReviewsPayload; fetched_at: string } | null
}

/* ------------------------------------------------------------------ */
/* View models — one language, what pages actually render.            */
/* ------------------------------------------------------------------ */

export interface Faq {
  q: string
  a: string
}

export interface Site {
  lang: Lang
  brand: string
  phoneDisplay: string
  phoneE164: string
  whatsappNumber: string
  addressLine: string
  address: { street: string; district: string; city: string; postalCode: string; country: string }
  plusCode: string
  mapsUrl: string
  geo: { lat: number; lng: number }
  hours: OpeningHours[]
  emergency: string
  sinceYear: number
  yearsInBuilding: number
  technicians: number
  areas: { key: string; name: string; lat?: number; lng?: number }[]
  areasNote: string
  images: { aboutShop: string | null; aboutTeam: string | null }
  social: { name: 'facebook' | 'instagram' | 'tiktok' | 'snapchat'; url: string }[]
  googlePlaceId: string
  /** Category links for the header menu and footer. */
  nav: { slug: string; name: string; isPrimary: boolean; icon: string | null }[]
  buildYear: number
}

export interface CategorySummary {
  slug: string
  name: string
  headline: string
  intro: string
  icon: string | null
  imageUrl: string | null
  isPrimary: boolean
}

export interface Category extends CategorySummary {
  metaDescription: string
  covers: string[]
  faq: Faq[]
}

export interface ServiceCard {
  slug: string
  categorySlug: string
  name: string
  short: string
  imageUrl: string | null
  hasDetailPage: boolean
  featured: boolean
  partsInStock: boolean
  waExtraLines: string | null
}

export interface ServiceDetail extends ServiceCard {
  body: string[]
  includes: string[]
  excludes: string[]
  options: string[]
  parts: string[]
  faq: Faq[]
  updatedAt: string | null
}

export interface Product {
  id: string
  name: string
  spec: string
  imageUrl: string | null
}

export interface GalleryItem {
  id: string
  categorySlug: string | null
  district: string | null
  caption: string
  imageUrl: string
  thumbUrl: string | null
  beforeImageUrl: string | null
  takenOn: string | null
}

export interface Review {
  id: string
  name: string
  district: string | null
  service: string | null
  rating: number
  body: string
  photoUrl: string | null
  createdAt: string
}

export interface GoogleSummary {
  rating: number | null
  count: number | null
  reviews: NonNullable<GoogleReviewsPayload['reviews']>
  fetchedAt: string | null
}
