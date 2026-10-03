import { useLoaderData } from 'react-router-dom'
import { PageHeader, Phase2Note } from '@/components/PageHeader'
import { Seo } from '@/components/Seo'
import { useStrings } from '@/components/site-context'
import { TrustRow } from '@/components/TrustRow'
import type { AboutData } from '@/content/view'

export function Component() {
  const data = useLoaderData() as AboutData
  const t = useStrings()
  return (
    <>
      <Seo title={t.pages.aboutTitle} description={t.pages.aboutDescription} />
      <PageHeader title={t.pages.aboutTitle}>
        <div className="mt-6 max-w-2xl space-y-4 text-lg/relaxed text-ink">
          {data.story.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="mt-8">
          <TrustRow tone="light" />
        </div>
      </PageHeader>
      <Phase2Note what="numbers, shop & team cards, “Where we are” map block, service areas" />
    </>
  )
}
