import { Check, Plus } from 'lucide-react'
import { Link, useLoaderData } from 'react-router-dom'
import { CategoryIllustration, categoryTone } from '@/components/CategoryIcon'
import { WhatsAppLink } from '@/components/ContactLinks'
import { CtaBand } from '@/components/HomeBlocks'
import { BrandIcon } from '@/components/icons/BrandIcon'
import { PageHeader } from '@/components/PageHeader'
import { Seo } from '@/components/Seo'
import { useSite, useStrings } from '@/components/site-context'
import type { ServicesHubData } from '@/content/view'
import { localizePath } from '@/i18n/lang'

/** Service chips shown per category before "+N more". */
const MAX_CHIPS = 8

/**
 * Services hub (brief §6.2): title band, a white panel with one illustrated tile per category,
 * then one section per category (alternating sides and backgrounds) with its main services.
 */
export function Component() {
  const data = useLoaderData() as ServicesHubData
  const { lang } = useSite()
  const t = useStrings()

  return (
    <>
      <Seo title={t.pages.servicesTitle} description={t.pages.servicesDescription} />
      <PageHeader title={t.pages.servicesTitle} lead={t.category.allCategoriesLead} tone="navy" />

      {/* Category grid, overlapping the title band */}
      <div className="container-x relative -mt-12 sm:-mt-16">
        <nav aria-label={t.servicesHub.gridLabel} className="rounded-[28px] bg-white p-2.5 shadow-[0_24px_60px_-28px_rgb(11_37_69/0.35)] ring-1 ring-line sm:p-5">
          <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-3">
            {data.categories.map((c) => (
              <li key={c.slug}>
                <Link
                  to={localizePath(`/services/${c.slug}`, lang)}
                  className="group flex h-full flex-col items-center rounded-[20px] px-2 pt-4 pb-5 text-center transition-[background-color,translate,box-shadow] duration-200 hover:-translate-y-1 hover:bg-bg hover:shadow-[0_14px_30px_-20px_rgb(11_37_69/0.45)] focus-visible:-translate-y-1 focus-visible:bg-bg sm:pt-5 sm:pb-6"
                >
                  <CategoryIllustration
                    src={c.imageUrl}
                    icon={c.icon}
                    size={110}
                    // Lazy even in the first screen: they load right after layout, and the Arabic
                    // font (the H1/lead text is the LCP) gets the bandwidth first.
                    className="art-bob size-[88px] sm:size-[110px]"
                  />
                  <span className="mt-3 text-[15px]/snug font-bold text-navy sm:text-lg/snug">{c.name}</span>
                  <span className="mt-1 text-xs font-semibold text-muted sm:text-sm">{t.common.servicesCount(c.services.length)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* One section per category */}
      <div className="mt-10 border-b border-line sm:mt-14">
        {data.categories.map((c, i) => {
          const path = localizePath(`/services/${c.slug}`, lang)
          const tone = categoryTone(c.icon)
          // Ads-priority services (featured) first, then the rest in admin order.
          const ordered = [...c.services.filter((s) => s.featured), ...c.services.filter((s) => !s.featured)]
          const chips = ordered.slice(0, MAX_CHIPS)
          const more = c.services.length - chips.length
          const flip = i % 2 === 1
          return (
            <section
              key={c.slug}
              id={c.slug}
              aria-labelledby={`cat-${c.slug}`}
              className={`scroll-mt-20 border-t border-line ${flip ? 'bg-[#F3F8FC]' : 'bg-white'}`}
            >
              <div className="container-x grid items-center gap-6 py-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10 lg:gap-16 lg:py-16">
                <Link
                  to={path}
                  tabIndex={-1}
                  aria-hidden="true"
                  className={`group relative mx-auto grid aspect-square w-[min(60vw,220px)] place-items-center md:w-full md:max-w-[340px] ${flip ? 'md:order-last' : ''}`}
                >
                  <span className={`absolute inset-[7%] rounded-full ${tone.bg}`} />
                  <span className="absolute inset-[7%] rounded-full ring-1 ring-navy/5" />
                  <CategoryIllustration src={c.imageUrl} icon={c.icon} size={340} sizes="(min-width: 768px) 340px, 220px" className="art-bob relative size-full" />
                </Link>

                <div>
                  <p className="text-sm font-semibold text-orange-text">{t.common.servicesCount(c.services.length)}</p>
                  <h2 id={`cat-${c.slug}`} className="mt-1 text-2xl/tight font-bold sm:text-3xl/tight">
                    <Link to={path} className="hover:text-orange-text">
                      {c.name}
                    </Link>
                  </h2>
                  <p className="mt-3 max-w-2xl text-base/relaxed text-muted">{c.intro}</p>

                  <ul className="mt-5 flex flex-wrap gap-2">
                    {chips.map((s) => {
                      const label = (
                        <>
                          <Check aria-hidden="true" className="size-3.5 shrink-0 text-wa" />
                          {s.name}
                        </>
                      )
                      return (
                        <li key={s.slug}>
                          {s.hasDetailPage ? (
                            <Link to={localizePath(`/services/${c.slug}/${s.slug}`, lang)} className="chip font-semibold hover:border-navy">
                              {label}
                            </Link>
                          ) : (
                            <span className="chip font-medium text-ink">{label}</span>
                          )}
                        </li>
                      )
                    })}
                    {more > 0 && (
                      <li>
                        <Link to={path} className="chip border-dashed text-orange-text hover:border-orange-text">
                          <Plus aria-hidden="true" className="size-3.5" />
                          {t.servicesHub.more(more)}
                        </Link>
                      </li>
                    )}
                  </ul>

                  <div className="mt-7 grid gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
                    <Link to={path} className="btn bg-navy text-white hover:bg-navy-deep">
                      {t.servicesHub.viewAll(c.services.length)}
                    </Link>
                    <WhatsAppLink
                      message={{ kind: 'category', message: c.waMessage }}
                      location="services_hub"
                      category={c.slug}
                      className="btn btn-wa"
                    >
                      <BrandIcon name="whatsapp" size={20} />
                      {t.cta.whatsappUs}
                    </WhatsAppLink>
                  </div>
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <CtaBand />
    </>
  )
}
