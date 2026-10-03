import type { Factor } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import { authMessage } from '../auth'
import { useT } from '../i18n'
import type { Supabase } from '../supabase'
import { Button, Card, Field, Notice } from '../ui'
import { EnrollForm } from './Enroll'

/** Authenticator apps (add a backup phone, remove one while another remains) and signing out. */
export function Security({ sb, email, onLevelChange }: { sb: Supabase; email: string; onLevelChange: () => void }) {
  const { t, lang } = useT()
  const [factors, setFactors] = useState<Factor[]>([])
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await sb.auth.mfa.listFactors()
    if (error) setMessage({ tone: 'error', text: authMessage(error, t, t.somethingWrong) })
    else setFactors(data.totp)
  }, [sb, t])

  useEffect(() => {
    void load()
  }, [load])

  async function remove(factor: Factor) {
    if (factors.length < 2 || !confirm(t.removeConfirm(factor.friendly_name || 'Authenticator'))) return
    setBusy(true)
    setMessage(null)
    const { error } = await sb.auth.mfa.unenroll({ factorId: factor.id })
    if (error) {
      setBusy(false)
      setMessage({ tone: 'error', text: authMessage(error, t, t.somethingWrong) })
      return
    }
    // Removing the app this login was confirmed with lowers the session to password-only;
    // the panel then asks for a code from the remaining app.
    await sb.auth.refreshSession()
    setBusy(false)
    setMessage({ tone: 'ok', text: t.removed_ok })
    await load()
    onLevelChange()
  }

  async function logOutEverywhere() {
    if (!confirm(t.logOutEverywhereConfirm)) return
    const { error } = await sb.auth.signOut({ scope: 'global' })
    if (error) setMessage({ tone: 'error', text: authMessage(error, t, t.somethingWrong) })
  }

  async function logOut() {
    const { error } = await sb.auth.signOut({ scope: 'local' })
    if (error) setMessage({ tone: 'error', text: authMessage(error, t, t.somethingWrong) })
  }

  const date = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-navy">{t.security}</h1>
      {message && <Notice tone={message.tone}>{message.text}</Notice>}

      <Card title={t.apps}>
        <p className="mb-3 text-muted">{t.appsHelp}</p>
        <ul className="divide-y divide-line">
          {factors.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-semibold">{f.friendly_name || 'Authenticator'}</p>
                <p className="text-sm text-muted">{t.added(date(f.created_at))}</p>
              </div>
              <Button variant="danger" disabled={busy || factors.length < 2} onClick={() => remove(f)}>
                {t.remove}
              </Button>
            </li>
          ))}
        </ul>
        {factors.length < 2 && <p className="mt-2 text-sm text-muted">{t.removeHint}</p>}
      </Card>

      <Card title={t.addApp}>
        {!adding ? (
          <>
            <p className="mb-4 text-muted">{t.addAppHelp}</p>
            <Button
              variant="secondary"
              onClick={() => {
                setName(t.backupName)
                setEnrolling(false)
                setAdding(true)
                setMessage(null)
              }}
            >
              {t.addAppButton}
            </Button>
          </>
        ) : !enrolling ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              setEnrolling(true)
            }}
          >
            <Field label={t.nameLabel} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required />
            <div className="flex flex-wrap gap-3">
              <Button type="submit">{t.start}</Button>
              <Button variant="secondary" onClick={() => setAdding(false)}>
                {t.cancel}
              </Button>
            </div>
          </form>
        ) : (
          <EnrollForm
            sb={sb}
            name={name}
            onDone={() => {
              setAdding(false)
              setMessage({ tone: 'ok', text: t.added_ok })
              void load()
            }}
            onCancel={() => setAdding(false)}
          />
        )}
      </Card>

      <Card title={t.sessions}>
        <p className="mb-1">{t.signedInAs(email)}</p>
        <p className="text-sm text-muted">{t.logOutHelp}</p>
        <p className="mb-4 text-sm text-muted">{t.logOutEverywhereHelp}</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={logOut}>
            {t.logOut}
          </Button>
          <Button variant="danger" onClick={logOutEverywhere}>
            {t.logOutEverywhere}
          </Button>
        </div>
      </Card>
    </div>
  )
}
