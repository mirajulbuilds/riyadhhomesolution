import { ChevronLeft, MapPin } from 'lucide-react'
import { Link, useLoaderData } from 'react-router-dom'
import { AreasBlock } from '@/components/AreasMap'
import { CategoryIcon, categoryTone } from '@/components/CategoryIcon'
import { CtaButtons } from '@/components/CtaButtons'
import { Gallery } from '@/components/gallery/Gallery'
import { HeroScene } from '@/components/home/HeroScene'
import { CtaBand, HowWeWork, WhyUs } from '@/components/HomeBlocks'
import { Carousel, GoogleReviewCard, GoogleSummary, ReviewCard } from '@/components/reviews/ReviewCards'
import { Seo } from '@/components/Seo'
import { useSite, useStrings } from '@/components/site-context'
import { TrustRow } from '@/components/TrustRow'
import { Faq } from '@/components/ui/Faq'
import { Section } from '@/components/ui/Section'
import type { HomeData } from '@/content/view'
import { localizePath } from '@/i18n/lang'

export function Component() {
  const data = useLoaderData() as HomeData
  const site = useSite()
  const t = useStrings()
  const lang = site.lang
  const primary = data.categories.filter((c) => c.isPrimary)
  const secondary = data.categories.filter((c) => !c.isPrimary)
  const reviewCards = [
    ...(data.google?.reviews ?? []).map((r, i) => <GoogleReviewCard key={`g${i}`} review={r} />),
    ...data.reviews.map((r) => <ReviewCard key={r.id} review={r} />),
  ]

  return (
    <>
      <Seo fullTitle={t.pages.homeTitle} description={t.pages.homeDescription} />

      {/* Hero: copy first (LCP is the H1), static story scene beside/below it. */}
      <section className="relative overflow-hidden bg-navy">
        <span aria-hidden="true" className="absolute -end-40 -top-40 size-[34rem] rounded-full bg-orange/10 blur-3xl" />
        <div className="container-x relative grid items-center gap-10 pt-10 pb-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white/90">
              <MapPin aria-hidden="true" className="size-4 text-orange" />
              {site.address.district}{lang === 'ar' ? '، ' : ', '}{site.address.city}
            </p>
            <h1 className="mt-4 max-w-2xl text-[2rem]/tight font-bold text-white sm:text-5xl/tight">{t.hero.title}</h1>
            <p className="mt-4 max-w-xl text-lg/relaxed text-white/80">{t.hero.sub}</p>
            <CtaButtons location="hero" className="mt-7" />
            <div className="mt-8 border-t border-white/10 pt-6">
              <TrustRow />
            </div>
          </div>
          <div className="overflow-hidden rounded-[22px] bg-[#F6F2EB] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)] ring-1 ring-white/10">
            <HeroScene label={t.home.sceneLabel} />
          </div>
        </div>
      </section>

      <Section
        id="home-services"
        title={t.home.servicesTitle}
        lead={t.home.servicesLead}
        action={{ to: localizePath('/services', lang), label: t.home.allServices }}
      >
        <ul className="grid gap-4 lg:grid-cols-3">
          {primary.map((c) => {
            const tone = categoryTone(c.icon)
            return (
              <li key={c.slug}>
                <Link
                  to={localizePath(`/services/${c.slug}`, lang)}
                  className="card group flex h-full flex-col p-6 transition-shadow hover:shadow-[0_18px_40px_-20px_rgb(11_37_69/0.4)]"
                >
                  <span className={`grid size-14 place-items-center rounded-2xl ${tone.bg}`}>
                    <CategoryIcon icon={c.icon} className={`size-7 ${tone.fg}`} />
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{c.name}</h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm/relaxed text-muted">{c.intro}</p>
                  <span className="mt-5 flex items-center justify-between text-sm font-semibold">
                    <span className="text-muted">{t.common.servicesCount(c.serviceCount)}</span>
                    <span className="inline-flex items-center gap-1 text-orange-text">
                      {t.details}
                      <ChevronLeft aria-hidden="true" className="size-4 ltr:-scale-x-100" />
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {secondary.map((c) => {
            const tone = categoryTone(c.icon)
            return (
              <li key={c.slug}>
                <Link
                  to={localizePath(`/services/${c.slug}`, lang)}
                  className="card flex items-center gap-4 p-4 transition-shadow hover:shadow-[0_14px_30px_-18px_rgb(11_37_69/0.4)]"
                >
                  <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone.bg}`}>
                    <CategoryIcon icon={c.icon} className={`size-5 ${tone.fg}`} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-navy">{c.name}</span>
                    <span className="text-sm text-muted">{t.common.servicesCount(c.serviceCount)}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </Section>

      <div className="border-y border-line bg-white">
        <Section id="home-why" title={t.home.whyTitle}>
          <WhyUs />
        </Section>
      </div>

      <Section id="home-how" title={t.steps.title}>
        <HowWeWork />
      </Section>

      {data.gallery.length > 0 && (
        <div className="border-y border-line bg-white">
          <Section
            id="home-work"
            title={t.home.workTitle}
            lead={t.home.workLead}
            action={{ to: localizePath('/our-work', lang), label: t.home.allWork }}
          >
            <Gallery items={data.gallery} categories={data.categories} limit={6} showFilter={false} />
          </Section>
        </div>
      )}

      <Section id="home-reviews" title={t.home.reviewsTitle} action={{ to: localizePath('/reviews', lang), label: t.common.seeAll }}>
        <GoogleSummary google={data.google} />
        {reviewCards.length > 0 && (
          <div className="mt-6">
            <Carousel label={t.home.reviewsTitle}>{reviewCards}</Carousel>
          </div>
        )}
      </Section>

      <div className="border-y border-line bg-white">
        <Section id="home-areas" title={t.home.areasTitle} lead={t.home.areasLead}>
          <AreasBlock />
        </Section>
      </div>

      <Section id="home-faq" title={t.common.faqTitle}>
        <Faq items={data.faq} />
      </Section>

      <CtaBand />
    </>
  )
}
