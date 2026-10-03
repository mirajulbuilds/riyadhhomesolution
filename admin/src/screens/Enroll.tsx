import { useEffect, useRef, useState, type FormEvent } from 'react'
import { authMessage, useTryLimit } from '../auth'
import { useT } from '../i18n'
import type { Supabase } from '../supabase'
import { AuthPage, Button, CodeField, Notice } from '../ui'

const ISSUER = 'Riyadh Home Solution'

type Pending = { id: string; qr: string; secret: string }

/**
 * Adds a Google Authenticator app: QR code + plain setup key, then the first code to confirm it.
 * Used for the first app (right after the first login) and for backup phones (Security page).
 */
export function EnrollForm({
  sb,
  name,
  onDone,
  onCancel,
}: {
  sb: Supabase
  name: string
  onDone: () => void
  onCancel?: () => void
}) {
  const { t } = useT()
  const [pending, setPending] = useState<Pending | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const limit = useTryLimit()
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    void (async () => {
      const list = await sb.auth.mfa.listFactors()
      if (list.error) return setError(authMessage(list.error, t, t.somethingWrong))
      // Drop setups that were started but never confirmed (they also block reusing a name).
      for (const f of list.data.all) if (f.status === 'unverified') await sb.auth.mfa.unenroll({ factorId: f.id })
      const taken = new Set(list.data.all.filter((f) => f.status === 'verified').map((f) => f.friendly_name))
      const base = name.trim() || t.backupName
      let friendlyName = base
      for (let n = 2; taken.has(friendlyName); n++) friendlyName = `${base} ${n}`

      const { data, error } = await sb.auth.mfa.enroll({ factorType: 'totp', friendlyName, issuer: ISSUER })
      if (error) return setError(authMessage(error, t, t.somethingWrong))
      setPending({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret })
    })()
    // Runs once per form: switching the language must not restart the setup.
  }, [])

  async function copyKey() {
    if (!pending) return
    try {
      await navigator.clipboard.writeText(pending.secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked: the key is selectable text, so it can still be copied by hand.
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!pending || busy || limit.wait || code.length !== 6) return
    setBusy(true)
    setError('')
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: pending.id, code })
    setBusy(false)
    if (error) {
      setError(authMessage(error, t, t.wrongCode))
      setCode('')
      limit.failed()
      return
    }
    limit.passed()
    onDone()
  }

  async function cancel() {
    if (pending) await sb.auth.mfa.unenroll({ factorId: pending.id })
    onCancel?.()
  }

  return (
    <div className="space-y-4">
      <ol className="list-decimal space-y-4 ps-5">
        <li>{t.enrollStep1}</li>
        <li>
          <p>{t.enrollStep2}</p>
          {pending ? (
            <div className="mt-3 space-y-3">
              <img src={pending.qr} alt={t.qrAlt} width={200} height={200} className="rounded-xl border border-line bg-white p-2" />
              <div>
                <span className="mb-1 block text-sm font-semibold text-muted">{t.setupKey}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <code dir="ltr" className="select-all rounded-lg bg-bg px-3 py-2 font-mono text-base break-all">
                    {pending.secret.replace(/(.{4})/g, '$1 ').trim()}
                  </code>
                  <Button variant="secondary" onClick={copyKey}>
                    {copied ? t.copied : t.copy}
                  </Button>
                </div>
              </div>
              <Notice tone="info">
                <strong>{t.keyWarning}</strong>
              </Notice>
            </div>
          ) : (
            !error && <p className="mt-3 text-muted">{t.loading}</p>
          )}
        </li>
        <li>{t.enrollStep3}</li>
      </ol>
      <form onSubmit={submit} className="space-y-4">
        <CodeField label={t.code} value={code} onChange={setCode} />
        {error && <Notice>{error}</Notice>}
        {limit.wait > 0 && <Notice>{t.wait(limit.wait)}</Notice>}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" className="grow" disabled={!pending || busy || limit.wait > 0 || code.length !== 6}>
            {t.verify}
          </Button>
          {onCancel && (
            <Button variant="secondary" onClick={cancel}>
              {t.cancel}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

/** First login of an admin without an authenticator: setting one up is mandatory. */
export function EnrollFirst({ sb, onDone }: { sb: Supabase; onDone: () => void }) {
  const { t } = useT()
  return (
    <AuthPage title={t.enrollTitle}>
      <p className="text-muted">{t.enrollIntro}</p>
      <EnrollForm sb={sb} name={t.firstAppName} onDone={onDone} />
      <Button variant="secondary" className="w-full" onClick={() => void sb.auth.signOut({ scope: 'local' })}>
        {t.otherAccount}
      </Button>
    </AuthPage>
  )
}
