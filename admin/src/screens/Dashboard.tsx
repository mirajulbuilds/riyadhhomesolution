import { useEffect, useState } from 'react'
import { missingLongText, type ServiceRow } from '../data'
import { useT } from '../i18n'
import { useNav, type Params } from '../nav'
import type { Supabase } from '../supabase'
import { Button, Card, Notice } from '../ui'

type Counts = { total: number; active: number; noPhoto: number; noLongText: number }

/** Counts that need attention + the "Unpublished changes" indicator (Publish comes in step 4). */
export function Dashboard({ sb }: { sb: Supabase }) {
  const { t, lang } = useT()
  const { go } = useNav()
  const [counts, setCounts] = useState<Counts | null>(null)
  const [lastEdit, setLastEdit] = useState<string | null>(null)
  const [lastPublish, setLastPublish] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    void (async () => {
      const [services, settings] = await Promise.all([
        sb.from('services').select('id, is_active, image_url, has_detail_page, body_ar, body_en'),
        sb.from('settings').select('key, value').in('key', ['last_admin_edit', 'last_publish']),
      ])
      if (services.error || settings.error) return setFailed(true)
      const rows = services.data as Pick<ServiceRow, 'is_active' | 'image_url' | 'has_detail_page' | 'body_ar' | 'body_en'>[]
      setCounts({
        total: rows.length,
        active: rows.filter((s) => s.is_active).length,
        noPhoto: rows.filter((s) => !s.image_url).length,
        noLongText: rows.filter(missingLongText).length,
      })
      const value = (key: string) => (settings.data.find((r) => r.key === key)?.value as string | undefined) ?? null
      setLastEdit(value('last_admin_edit'))
      setLastPublish(value('last_publish'))
    })()
  }, [sb])

  const unpublished = Boolean(lastEdit && (!lastPublish || Date.parse(lastEdit) > Date.parse(lastPublish)))
  const when = (iso: string) =>
    new Date(iso).toLocaleString(lang === 'ar' ? 'ar-SA-u-nu-latn-ca-gregory' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })

  const tiles: { label: string; value: number | undefined; params?: Params; warn?: boolean }[] = [
    { label: t.dashServices, value: counts?.total },
    { label: t.dashActive, value: counts?.active, params: { status: 'active' } },
    { label: t.dashNoImage, value: counts?.noPhoto, params: { photo: 'no' }, warn: true },
    { label: t.dashNoLongText, value: counts?.noLongText, params: { detail: 'missing' }, warn: true },
  ]

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-navy">{t.dashboard}</h1>
      {failed && <Notice>{t.loadFailed}</Notice>}

      <Card title={unpublished ? `● ${t.unpublished}` : t.unpublished}>
        <p className={unpublished ? 'mb-4 font-semibold text-amber-800' : 'mb-4 text-muted'}>
          {unpublished && lastEdit ? t.unpublishedHelp(when(lastEdit)) : t.allPublished}
        </p>
        <Button disabled className="w-full sm:w-auto">
          {t.publish}
        </Button>
        <p className="mt-2 text-sm text-muted">{t.publishSoon}</p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <button
            key={tile.label}
            type="button"
            onClick={() => go('services', tile.params)}
            className="rounded-2xl border border-line bg-white p-4 text-start shadow-sm hover:border-navy"
          >
            <span className={`block text-3xl font-bold ${tile.warn && tile.value ? 'text-amber-700' : 'text-navy'}`}>{tile.value ?? '…'}</span>
            <span className="mt-1 block text-sm text-muted">{tile.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
