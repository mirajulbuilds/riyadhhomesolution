import type { LoaderFunctionArgs } from 'react-router-dom'
import type { RouteRecord } from 'vite-react-ssg'
import type { RouteHandle } from '@/components/site-context'
import { SiteLayout } from '@/components/layout/SiteLayout'
import type { SiteContent } from '@/content/types'
import type { CategoryData, ServiceData } from '@/content/view'
import type { Lang } from '@/i18n/lang'

/*
 * Arabic lives at the root, English under /en — same slugs in both (brief §4).
 *
 * Data: every loader runs at BUILD time only. vite-react-ssg bakes the result into each
 * page's HTML (for hydration) and into a JSON file (for client-side navigation), and replaces
 * the loaders in the browser. The `import.meta.env.SSR` guards keep the content code, seed
 * data and Supabase client out of the browser bundle entirely.
 */

type Builder = (content: SiteContent, lang: Lang, params: LoaderFunctionArgs['params']) => unknown

function load(lang: Lang, pick: (view: typeof import('@/content/view')) => Builder) {
  return async ({ params }: LoaderFunctionArgs) => {
    if (!import.meta.env.SSR) return null
    const [{ getContent }, view] = await Promise.all([import('@/content/server'), import('@/content/view')])
    return pick(view)(await getContent(), lang, params)
  }
}

function staticPaths(kind: 'category' | 'service') {
  return async () => {
    if (!import.meta.env.SSR) return []
    const { staticPaths } = await import('@/content/server')
    return staticPaths(kind)
  }
}

const handle = (pageType: string, cta?: RouteHandle['cta']): RouteHandle => ({ pageType, cta })

/** Header + sticky-bar WhatsApp on a category page: "I need: Plumbing". */
const categoryCta = (data: CategoryData) => ({
  message: { kind: 'service' as const, name: data.category.name },
  category: data.category.slug,
})

/** …and on a service page: "I need: Mixer tap replacement" (+ its extra lines). */
const serviceCta = (data: ServiceData) => ({
  message: { kind: 'service' as const, name: data.service.name, extraLines: data.service.waExtraLines },
  category: data.category.slug,
  service: data.service.slug,
})

function pageRoutes(lang: Lang): RouteRecord[] {
  return [
    {
      index: true,
      lazy: () => import('@/pages/Home'),
      loader: load(lang, (v) => (c, l) => v.homeData(c, l)),
      handle: handle('home'),
    },
    {
      path: 'services',
      lazy: () => import('@/pages/ServicesHub'),
      loader: load(lang, (v) => (c, l) => v.servicesHubData(c, l)),
      handle: handle('services'),
    },
    {
      path: 'services/:category',
      lazy: () => import('@/pages/Category'),
      loader: load(lang, (v) => (c, l, p) => v.categoryData(c, l, p.category)),
      getStaticPaths: staticPaths('category'),
      handle: handle('category', categoryCta as RouteHandle['cta']),
    },
    {
      path: 'services/:category/:service',
      lazy: () => import('@/pages/ServiceDetail'),
      loader: load(lang, (v) => (c, l, p) => v.serviceData(c, l, p.category, p.service)),
      getStaticPaths: staticPaths('service'),
      handle: handle('service', serviceCta as RouteHandle['cta']),
    },
    {
      path: 'products',
      lazy: () => import('@/pages/Products'),
      loader: load(lang, (v) => (c, l) => v.productsData(c, l)),
      handle: handle('products'),
    },
    {
      path: 'our-work',
      lazy: () => import('@/pages/OurWork'),
      loader: load(lang, (v) => (c, l) => v.ourWorkData(c, l)),
      handle: handle('our_work'),
    },
    {
      path: 'reviews',
      lazy: () => import('@/pages/Reviews'),
      loader: load(lang, (v) => (c, l) => v.reviewsData(c, l)),
      handle: handle('reviews'),
    },
    {
      path: 'about',
      lazy: () => import('@/pages/About'),
      loader: load(lang, (v) => (c, l) => v.aboutData(c, l)),
      handle: handle('about'),
    },
    {
      path: 'contact',
      lazy: () => import('@/pages/Contact'),
      loader: load(lang, (v) => (c, l) => v.contactData(c, l)),
      handle: handle('contact'),
    },
    {
      path: 'privacy',
      lazy: () => import('@/pages/Privacy'),
      handle: handle('privacy'),
    },
    {
      // Prerendered as /404 and /en/404 (see vite.config.ts); Cloudflare serves those for misses.
      path: '*',
      lazy: () => import('@/pages/NotFound'),
      handle: handle('404'),
    },
  ]
}

export const routes: RouteRecord[] = [
  {
    id: 'en',
    path: '/en',
    element: <SiteLayout lang="en" />,
    loader: load('en', (v) => (c, l) => v.layoutData(c, l)),
    children: pageRoutes('en'),
  },
  {
    id: 'ar',
    path: '/',
    element: <SiteLayout lang="ar" />,
    loader: load('ar', (v) => (c, l) => v.layoutData(c, l)),
    children: pageRoutes('ar'),
  },
]
