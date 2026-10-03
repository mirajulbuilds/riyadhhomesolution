import type { CategoryRow, ServiceRow } from '@/content/types'

export type SeedCategory = Omit<CategoryRow, 'id'>

export type SeedService = Omit<ServiceRow, 'id' | 'category_id' | 'updated_at'> & {
  /** Category slug; resolved to category_id when seeding. */
  category: string
}

type ServiceInput = Pick<SeedService, 'slug' | 'name_ar' | 'name_en' | 'short_ar' | 'short_en'> &
  Partial<Omit<SeedService, 'category' | 'sort_order'>>

/** Fills the defaults so seed files only list what differs per service. */
export function defineServices(category: string, list: ServiceInput[]): SeedService[] {
  return list.map((s, i) => ({
    category,
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
    image_url: null,
    faq: [],
    has_detail_page: false,
    is_active: true,
    ...s,
    featured: s.featured ?? s.has_detail_page ?? false,
    sort_order: (i + 1) * 10,
  }))
}
