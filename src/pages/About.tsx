import { MapPin, Navigation, Store, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLoaderData } from 'react-router-dom'
import { AreasBlock } from '@/components/AreasMap'
import { DirectionsLink } from '@/components/ContactLinks'
import { CtaBand, HoursList, MapEmbed } from '@/components/HomeBlocks'
import { PageHeader } from '@/components/PageHeader'
import { Seo } from '@/components/Seo'
import { useSite, useStrings } from '@/components/site-context'
import { Section } from '@/components/ui/Section'
import type { AboutData } from '@/content/view'

/** About (brief §6.8): story, numbers, shop & team, where we are (map), service areas. */
export function Component() {
  const data = useLoaderData() as AboutData
  const site = useSite()
  const t = useStrings()
  const stats = [
    { value: String(site.sinceYear), label: t.about.stats.since },
    { value: plus(site.yearsInBuilding, site.lang), label: t.about.stats.years },
    { value: plus(site.technicians, site.lang), label: t.about.stats.technicians },
    { value: plus(site.areasCount, site.lang), label: t.about.stats.areas },
  ]

  return (
    <>
      <Seo title={t.pages.aboutTitle} description={t.pages.aboutDescription} />
      <PageHeader title={t.pages.aboutTitle} lead={t.about.lead} />

      <div className="container-x grid gap-6 py-10 lg:grid-cols-[1.3fr_1fr] lg:py-14">
        <section aria-labelledby="story-title" className="card p-6 sm:p-8">
          <h2 id="story-title" className="text-2xl font-bold">
            {t.about.storyTitle}
          </h2>
          <div className="mt-4 space-y-4 text-lg/relaxed text-ink">
            {data.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>
        <ul className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <li key={s.label} className="card flex flex-col justify-center p-5 sm:p-6">
              {/* Phase 4 counts these up on scroll; the final value is always in the HTML. */}
              <span className="text-3xl font-bold text-navy sm:text-4xl" data-count={s.value}>
                {s.value}
              </span>
              <span className="mt-1 text-sm text-muted">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-x grid gap-6 pb-4 md:grid-cols-2">
        <PhotoCard image={site.images.aboutShop} icon={<Store className="size-12 text-navy/30" />} title={t.about.shopTitle} body={t.about.shopBody} />
        <PhotoCard image={site.images.aboutTeam} icon={<Users className="size-12 text-navy/30" />} title={t.about.teamTitle} body={t.about.teamBody} />
      </div>

      <Section id="where-title" title={t.about.whereTitle}>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <MapEmbed />
          <div className="card space-y-5 p-6 sm:p-8">
            <div className="flex items-start gap-2">
              <MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-orange-text" />
              <div>
                <address className="text-lg font-semibold text-navy not-italic">{site.addressLine}</address>
                <p className="mt-1 text-sm text-muted">
                  {t.about.plusCode}: <span dir="ltr">{site.plusCode}</span>
                </p>
              </div>
            </div>
            <HoursList />
            <DirectionsLink location="about_where" className="btn bg-navy text-white hover:bg-navy-deep">
              <Navigation aria-hidden="true" className="size-5" />
              {t.cta.directions}
            </DirectionsLink>
          </div>
        </div>
      </Section>

      <div className="border-y border-line bg-white">
        <Section id="about-areas" title={t.home.areasTitle} lead={t.home.areasLead}>
          <AreasBlock />
        </Section>
      </div>

      <CtaBand />
    </>
  )
}

const plus = (n: number, lang: 'ar' | 'en') => (lang === 'ar' ? `+${n}` : `${n}+`)

function PhotoCard({ image, icon, title, body }: { image: string | null; icon: ReactNode; title: string; body: string }) {
  return (
    <article className="card overflow-hidden">
      {image ? (
        <img src={image} alt={title} width={800} height={600} loading="lazy" decoding="async" className="aspect-[4/3] w-full bg-bg object-cover" />
      ) : (
        // Short banner until the real photo is uploaded from the admin panel.
        <div aria-hidden="true" className="grid aspect-[16/6] w-full place-items-center bg-[linear-gradient(135deg,var(--bg),#E9EEF4)]">
          {icon}
        </div>
      )}
      <div className="p-6">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-2 leading-relaxed text-muted">{body}</p>
      </div>
    </article>
  )
}
