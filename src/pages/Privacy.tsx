import { WhatsAppLink } from '@/components/ContactLinks'
import { BrandIcon } from '@/components/icons/BrandIcon'
import { PageHeader } from '@/components/PageHeader'
import { Seo } from '@/components/Seo'
import { useSite, useStrings } from '@/components/site-context'
import { privacyContent, privacyUpdated } from './privacy-content'

export function Component() {
  const { lang } = useSite()
  const t = useStrings()
  return (
    <>
      <Seo title={t.pages.privacyTitle} description={t.pages.privacyDescription} />
      <PageHeader title={t.pages.privacyTitle} lead={t.pages.privacyDescription}>
        <p className="mt-4 text-sm text-muted">{privacyUpdated[lang]}</p>
      </PageHeader>
      <div className="container-x py-10 lg:py-14">
        <div className="card mx-auto max-w-3xl space-y-8 p-6 sm:p-10">
          {privacyContent[lang].map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold">{section.title}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-ink">
                {section.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
          <WhatsAppLink message={{ kind: 'general' }} location="privacy" className="btn btn-wa">
            <BrandIcon name="whatsapp" size={20} />
            {t.cta.whatsappUs}
          </WhatsAppLink>
        </div>
      </div>
    </>
  )
}
