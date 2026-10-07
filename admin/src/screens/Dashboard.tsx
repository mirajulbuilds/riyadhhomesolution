import { useCallback, useEffect, useState } from 'react'
import { missingLongText, type ServiceRow } from '../data'
import { useT } from '../i18n'
import { useNav, type Params } from '../nav'
import { COOLDOWN_SECONDS, cooldownLeft, hasUnpublished, isNewer, liveBuildTime, loadPublishState, publishSite, type PublishState } from '../publish'
import type { Supabase } from '../supabase'
import { Button, Card, Notice } from '../ui'

type Counts = { total: number; active: number; noPhoto: number; noLongText: number }

/** Counts that need attention + "Unpublished changes" with the Publish button. */
export function Dashboard({ sb }: { sb: Supabase }) {
  const { t, lang } = useT()
  const { go, pending } = useNav()
  const [counts, setCounts] = useState<Counts | null>(null)
  const [pub, setPub] = useState<PublishState | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    void (async () => {
      const [services, settings] = await Promise.all([
        sb.from('services').select('id, is_active, image_url, has_detail_page, body_ar, body_en'),
        loadPublishState(sb),
      ])
      if (services.error || !settings) return setFailed(true)
      const rows = services.data as Pick<ServiceRow, 'is_active' | 'image_url' | 'has_detail_page' | 'body_ar' | 'body_en'>[]
      setCounts({
        total: rows.length,
        active: rows.filter((s) => s.is_active).length,
        noPhoto: rows.filter((s) => !s.image_url).length,
        noLongText: rows.filter(missingLongText).length,
      })
      setPub(settings)
    })()
  }, [sb])

  const unpublished = Boolean(pub && hasUnpublished(pub))
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

      <button
        type="button"
        onClick={() => go('reviews', { tab: 'pending' })}
        className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-start shadow-sm ${pending ? 'border-orange bg-orange/10' : 'border-line bg-white'} hover:border-navy`}
      >
        <span className={`text-4xl font-bold ${pending ? 'text-orange' : 'text-navy'}`}>{pending}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-navy">{t.dashPendingReviews}</span>
          <span className="block text-sm text-muted">{pending ? t.dashPendingHelp : t.dashNoPending}</span>
        </span>
        <span aria-hidden="true" className="text-2xl text-navy">{lang === 'ar' ? '←' : '→'}</span>
      </button>

      <PublishCard sb={sb} pub={pub} setPub={setPub} unpublished={unpublished} when={when} />

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

type Message = { tone: 'ok' | 'error' | 'warn' | 'info'; text: string }

/**
 * "Unpublished changes" + Publish. Disabled when nothing changed, while a publish runs and for 60 s
 * after one (the database enforces the same pause). After a publish, the panel's build.json is
 * checked every 20 s to tell when the new version is live (up to 15 minutes).
 */
function PublishCard({ sb, pub, setPub, unpublished, when }: { sb: Supabase; pub: PublishState | null; setPub: (p: PublishState) => void; unpublished: boolean; when: (iso: string) => string }) {
  const { t } = useT()
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [waitUntil, setWaitUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  // The pause left from a publish made earlier (on any device), never more than 60 s even if this
  // phone's clock is off; after a click this tab counts from the server's answer instead.
  useEffect(() => {
    if (pub?.lockAt) setWaitUntil((w) => Math.max(w, Date.now() + Math.min(COOLDOWN_SECONDS, cooldownLeft(pub.lockAt)) * 1000))
  }, [pub?.lockAt])
  const cooldown = Math.max(0, Math.ceil((waitUntil - now) / 1000))
  useEffect(() => {
    if (waitUntil <= Date.now()) return
    const id = setInterval(() => {
      setNow(Date.now())
      if (Date.now() >= waitUntil) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [waitUntil])

  const refresh = useCallback(async () => {
    const fresh = await loadPublishState(sb)
    if (fresh) setPub(fresh)
  }, [sb, setPub])

  // After a publish: wait for a build newer than the click to be served.
  const [watching, setWatching] = useState(false)
  useEffect(() => {
    if (!watching || !publishedAt) return
    const started = Date.now()
    const id = setInterval(async () => {
      const built = await liveBuildTime()
      if (built && isNewer(built, publishedAt)) {
        setWatching(false)
        setMessage({ tone: 'ok', text: t.publishLive })
      } else if (Date.now() - started > 15 * 60_000) {
        setWatching(false)
        setMessage({ tone: 'warn', text: t.publishNotConfirmed })
      }
    }, 20_000)
    return () => clearInterval(id)
  }, [watching, publishedAt, t])

  async function publish() {
    setPublishing(true)
    setMessage(null)
    const result = await publishSite(sb)
    setPublishing(false)
    setNow(Date.now())
    await refresh()
    switch (result.kind) {
      case 'ok':
        setWaitUntil(Date.now() + COOLDOWN_SECONDS * 1000)
        setPublishedAt(result.publishedAt)
        setMessage({ tone: 'ok', text: result.recorded ? t.publishStarted : `${t.publishStarted} ${t.publishNotRecorded}` })
        setWatching(true)
        break
      case 'cooldown':
        setWaitUntil(Date.now() + result.retryAfter * 1000)
        setMessage({ tone: 'warn', text: t.publishCooldown(result.retryAfter) })
        break
      case 'not_configured':
        setMessage({ tone: 'error', text: t.publishNotConfigured })
        break
      case 'refused':
        setMessage({ tone: 'error', text: t.publishRefused(result.status) })
        break
      case 'network':
        setMessage({ tone: 'error', text: t.publishNetwork })
        break
      case 'denied':
        setMessage({ tone: 'error', text: t.publishDenied })
        break
      default:
        setMessage({ tone: 'error', text: t.publishError })
    }
  }

  const editedSince = Boolean(publishedAt && unpublished && isNewer(pub?.lastEdit ?? null, publishedAt))
  return (
    <Card title={unpublished ? `● ${t.unpublished}` : t.unpublished}>
      <p className={unpublished ? 'mb-1 font-semibold text-amber-800' : 'mb-1 text-muted'}>
        {editedSince ? t.editedDuringPublish : unpublished && pub?.lastEdit ? t.unpublishedHelp(when(pub.lastEdit)) : t.allPublished}
      </p>
      <p className="mb-4 text-sm text-muted">{pub?.lastPublish ? t.lastPublished(when(pub.lastPublish)) : t.neverPublished}</p>
      <Button disabled={!unpublished || publishing || cooldown > 0} onClick={() => void publish()} className="w-full sm:w-auto">
        {publishing ? t.publishWorking : cooldown > 0 ? `${t.publish} · ${t.publishWait(cooldown)}` : t.publish}
      </Button>
      {message && (
        <div className="mt-3">
          <Notice tone={message.tone}>{message.text}</Notice>
        </div>
      )}
    </Card>
  )
}
