import { useLoaderData } from 'react-router-dom'
import { CtaButtons } from '@/components/CtaButtons'
import { PageHeader, Phase2Note } from '@/components/PageHeader'
import { Seo } from '@/components/Seo'
import { useLeadTag, useSite, useStrings } from '@/components/site-context'
import type { ServiceData } from '@/content/view'
import { buildWhatsAppMessage, type WhatsAppMessage } from '@/lib/contact'
import { NotFoundView } from './NotFound'

export function Component() {
  const data = useLoaderData() as ServiceData | null
  const { lang } = useSite()
  const tag = useLeadTag()
  const t = useStrings()
  if (!data) return <NotFoundView />
  const { category, service } = data
  const message: WhatsAppMessage = { kind: 'service', name: service.name, extraLines: service.waExtraLines }

  return (
    <>
      <Seo title={service.name} description={service.short} />
      <PageHeader title={service.name} lead={service.short}>
        <CtaButtons message={message} location="service_hero" category={category.slug} service={service.slug} className="mt-6" />
      </PageHeader>

      <div className="container-x grid gap-6 py-10 lg:grid-cols-[1fr_360px]">
        <div className="card space-y-4 p-6 text-base/relaxed">
          {service.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <aside className="card p-6">
          <h2 className="text-sm font-semibold">{t.messagePreview}</h2>
          <pre className="mt-3 rounded-xl bg-bg p-4 font-[inherit] text-sm/relaxed whitespace-pre-wrap text-ink">
            {buildWhatsAppMessage(message, lang, tag)}
          </pre>
        </aside>
      </div>

      <Phase2Note what="badges, image, options, includes/excludes, parts, process, FAQ, related services, sticky CTA" />
    </>
  )
}
