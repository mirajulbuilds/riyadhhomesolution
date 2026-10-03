import { useLocation } from 'react-router-dom'
import { Head } from 'vite-react-ssg'
import { hreflangOf, LANGS, localizePath, parsePath } from '@/i18n/lang'
import { absoluteUrl } from '@/lib/site-url'
import { useSite } from './site-context'

interface Props {
  /** Page name; the brand is appended. Ignored when `fullTitle` is set. */
  title?: string
  /** Complete <title>, for pages (like Home) that lead with the brand. */
  fullTitle?: string
  description: string
  /** 404 and similar: no canonical/hreflang, not indexed. */
  noindex?: boolean
}

/** Google shows roughly 60 characters of a title. */
const TITLE_MAX = 60

/** "Page | Brand", or just "Page" when the brand would push it past the limit. */
function withBrand(title: string | undefined, brand: string) {
  if (!title) return brand
  const branded = `${title} | ${brand}`
  return branded.length <= TITLE_MAX ? branded : title
}

/** Per-page <title>, description, canonical and hreflang alternates. */
export function Seo({ title, fullTitle, description, noindex = false }: Props) {
  const site = useSite()
  const { pathname } = useLocation()
  const { path } = parsePath(pathname)
  const pageTitle = fullTitle ?? withBrand(title, site.brand)

  // Helmet does not accept fragments, so the conditional tags are built as an array.
  const linkTags = noindex
    ? [<meta key="robots" name="robots" content="noindex, follow" />]
    : [
        <link key="canonical" rel="canonical" href={absoluteUrl(pathname)} />,
        ...LANGS.map((lang) => (
          <link key={lang} rel="alternate" hrefLang={hreflangOf(lang)} href={absoluteUrl(localizePath(path, lang))} />
        )),
        <link key="x-default" rel="alternate" hrefLang="x-default" href={absoluteUrl(localizePath(path, 'ar'))} />,
      ]

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      {linkTags}
    </Head>
  )
}
