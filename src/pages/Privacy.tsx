import { PageHeader, Phase2Note } from '@/components/PageHeader'
import { Seo } from '@/components/Seo'
import { useStrings } from '@/components/site-context'

export function Component() {
  const t = useStrings()
  return (
    <>
      <Seo title={t.pages.privacyTitle} description={t.pages.privacyDescription} />
      <PageHeader title={t.pages.privacyTitle} lead={t.pages.privacyDescription} />
      <Phase2Note what="plain-language policy in Arabic and English" />
    </>
  )
}
