import { seedCategories, seedProductCategories, seedServices, seedSettings } from './seed'
import type {
  CategoryRow,
  GalleryRow,
  GoogleReviewsPayload,
  ProductCategoryRow,
  ProductRow,
  PublicReviewRow,
  ServiceRow,
  SettingsValues,
  SiteContent,
} from './types'

/*
 * Build-time content source. Imported only from route loaders behind `import.meta.env.SSR`,
 * so neither the seed data nor the Supabase client ends up in the browser bundle.
 *
 * - Supabase keys set   → read published content with the public (anon) key; RLS only
 *                         returns active / approved rows. Any error fails the build, so a
 *                         broken connection can never publish a half-empty site.
 * - Supabase keys empty → use the seed data in ./seed (local development, first deploys).
 */

let contentPromise: Promise<SiteContent> | undefined

export function getContent(): Promise<SiteContent> {
  contentPromise ??= loadContent()
  return contentPromise
}

async function loadContent(): Promise<SiteContent> {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    if (import.meta.env.VITE_DEMO_CONTENT === 'true') return contentWithDemo()
    console.warn('[content] Supabase keys not set — building from seed data (src/content/seed).')
    return contentFromSeed()
  }
  const content = await contentFromSupabase(url, key)
  console.info(
    `[content] Supabase: ${content.categories.length} categories, ${content.services.length} services, ` +
      `${content.gallery.length} gallery photos, ${content.reviews.length} approved reviews.`,
  )
  return content
}

/** The seed in database shape, with stable fake ids. */
export function contentFromSeed(): SiteContent {
  const categories: CategoryRow[] = seedCategories.map((c) => ({ ...c, id: `cat:${c.slug}` }))
  const services: ServiceRow[] = seedServices.map(({ category, ...s }) => ({
    ...s,
    id: `svc:${category}/${s.slug}`,
    category_id: `cat:${category}`,
    updated_at: null,
  }))
  const productCategories: ProductCategoryRow[] = seedProductCategories.map((c) => ({ ...c, id: `pcat:${c.slug}` }))
  return {
    source: 'seed',
    settings: seedSettings,
    categories: categories.filter((c) => c.is_active).sort(bySortOrder),
    services: services.filter((s) => s.is_active && categories.some((c) => c.id === s.category_id)).sort(bySortOrder),
    productCategories,
    products: [],
    gallery: [],
    reviews: [],
    googleReviews: null,
  }
}

/** Seed + sample gallery/reviews, for checking those layouts locally (VITE_DEMO_CONTENT=true). */
async function contentWithDemo(): Promise<SiteContent> {
  const { demoGallery, demoGoogle, demoReviews } = await import('./seed/demo')
  console.warn('[content] DEMO content enabled — sample gallery photos and reviews. Never use for a real build.')
  return { ...contentFromSeed(), gallery: demoGallery, reviews: demoReviews, googleReviews: demoGoogle }
}

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order

async function contentFromSupabase(url: string, key: string): Promise<SiteContent> {
  const { createClient } = await import('@supabase/supabase-js')
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const [settings, categories, services, productCategories, products, gallery, reviews, google] = await Promise.all([
    db.from('settings').select('key, value'),
    db.from('categories').select('*').eq('is_active', true).order('sort_order'),
    db.from('services').select('*').eq('is_active', true).order('sort_order'),
    db.from('product_categories').select('*').eq('is_active', true).order('sort_order'),
    db.from('products').select('*').eq('is_active', true).order('sort_order'),
    db
      .from('gallery')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .order('taken_on', { ascending: false, nullsFirst: false }),
    // No status filter: the public key cannot read the status column at all, and Row Level
    // Security already limits it to approved reviews.
    db
      .from('reviews')
      .select('id, name, district, service_text, rating, body, photo_url, created_at')
      .order('created_at', { ascending: false })
      .limit(200),
    db.from('google_reviews_cache').select('payload, fetched_at').order('fetched_at', { ascending: false }).limit(1),
  ])

  const failed = Object.entries({ settings, categories, services, productCategories, products, gallery, reviews, google })
    .filter(([, res]) => res.error)
    .map(([name, res]) => `${name}: ${res.error?.message}`)
  if (failed.length > 0) {
    throw new Error(`[content] Could not read from Supabase — ${failed.join('; ')}`)
  }

  const categoryRows = (categories.data ?? []) as CategoryRow[]
  const activeCategoryIds = new Set(categoryRows.map((c) => c.id))
  const productCategoryRows = (productCategories.data ?? []) as ProductCategoryRow[]
  const activeProductCategoryIds = new Set(productCategoryRows.map((c) => c.id))
  const googleRow = google.data?.[0] as { payload: GoogleReviewsPayload; fetched_at: string } | undefined

  return {
    source: 'supabase',
    settings: mergeSettings((settings.data ?? []) as { key: string; value: unknown }[]),
    categories: categoryRows,
    // Hide services whose category is switched off.
    services: ((services.data ?? []) as ServiceRow[]).filter((s) => activeCategoryIds.has(s.category_id)),
    productCategories: productCategoryRows,
    products: ((products.data ?? []) as ProductRow[]).filter((p) => activeProductCategoryIds.has(p.category_id)),
    gallery: (gallery.data ?? []) as GalleryRow[],
    reviews: (reviews.data ?? []) as PublicReviewRow[],
    googleReviews: googleRow ?? null,
  }
}

/** Database values win; any key missing from the table falls back to the seed value. */
function mergeSettings(rows: { key: string; value: unknown }[]): SettingsValues {
  const merged: Record<string, unknown> = { ...seedSettings }
  for (const { key, value } of rows) {
    if (key in seedSettings && value !== null && value !== undefined) merged[key] = value
  }
  return merged as unknown as SettingsValues
}

/** Paths for getStaticPaths, relative to the language root ('services/plumbing'). */
export async function staticPaths(kind: 'category' | 'service'): Promise<string[]> {
  const content = await getContent()
  if (kind === 'category') return content.categories.map((c) => `services/${c.slug}`)
  const slugById = new Map(content.categories.map((c) => [c.id, c.slug]))
  return content.services
    .filter((s) => s.has_detail_page && slugById.has(s.category_id))
    .map((s) => `services/${slugById.get(s.category_id)}/${s.slug}`)
}
