import type { ProductCategoryRow } from '@/content/types'

export type SeedProductCategory = Omit<ProductCategoryRow, 'id'>

// Product categories from PROJECT_BRIEF.md §11. No brands, no prices.
// Items are added by the owner from the admin panel, so none are seeded.
export const seedProductCategories: SeedProductCategory[] = [
  { slug: 'plumbing-sanitary', name_ar: 'أدوات صحية وسباكة', name_en: 'Sanitary ware & plumbing', sort_order: 10, is_active: true },
  { slug: 'mixers-basins', name_ar: 'خلاطات ومغاسل', name_en: 'Mixer taps & basins', sort_order: 20, is_active: true },
  { slug: 'water-heaters', name_ar: 'سخانات', name_en: 'Water heaters', sort_order: 30, is_active: true },
  { slug: 'switches-sockets-panels', name_ar: 'مفاتيح وأفياش وطبلونات', name_en: 'Switches, sockets & breaker panels', sort_order: 40, is_active: true },
  {
    slug: 'lighting',
    name_ar: 'إنارة (سبوت، بانيل، لمبات، كشافات وإنارة شوارع)',
    name_en: 'Lighting (spotlights, panels, bulbs, flood & street lights)',
    sort_order: 50,
    is_active: true,
  },
  { slug: 'cameras-intercom', name_ar: 'كاميرات وإنتركم', name_en: 'Cameras & intercom', sort_order: 60, is_active: true },
  { slug: 'building-materials', name_ar: 'مواد بناء', name_en: 'Building materials', sort_order: 70, is_active: true },
]
