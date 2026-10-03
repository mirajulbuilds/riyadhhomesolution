import { seedCategories } from './categories'
import type { SeedService } from './define'
import { seedProductCategories } from './products'
import { cctvServices } from './services-cctv'
import { electricalServices } from './services-electrical'
import { cleaningServices, paintingServices, tilesServices } from './services-other'
import { plumbingServices } from './services-plumbing'
import { seedSettings } from './settings'

export const seedServices: SeedService[] = [
  ...plumbingServices,
  ...electricalServices,
  ...cctvServices,
  ...paintingServices,
  ...tilesServices,
  ...cleaningServices,
]

export { seedCategories, seedProductCategories, seedSettings }
export type { SeedCategory, SeedService } from './define'
export type { SeedProductCategory } from './products'
