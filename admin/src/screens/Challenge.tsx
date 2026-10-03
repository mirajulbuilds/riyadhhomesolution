import type { Factor } from '@supabase/supabase-js'
import { useState, type FormEvent } from 'react'
import { authMessage, useTryLimit } from '../auth'
import { useT } from '../i18n'
import type { Supabase } from '../supabase'
import { AuthPage, Button, CodeField, Notice } from '../ui'

/** Second step of every fresh login: the 6-digit code from an enrolled authenticator app. */
export function Challenge({ sb, factors, onVerified }: { sb: Supabase; factors: Factor[]; onVerified: () => void }) {
  const { t } = useT()
  const [factorId, setFactorId] = useState(factors[0].id)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const limit = useTryLimit()

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy || limit.wait || code.length !== 6) return
    setBusy(true)
    setError('')
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId, code })
    setBusy(false)
    if (error) {
      setError(authMessage(error, t, t.wrongCode))
      setCode('')
      limit.failed()
      return
    }
    limit.passed()
    onVerified()
  }

  return (
    <AuthPage title={t.codeTitle}>
      <p className="text-muted">{t.codeHelp}</p>
      <form onSubmit={submit} className="space-y-4">
        {factors.length > 1 && (
          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-semibold text-muted">{t.whichApp}</legend>
            {factors.map((f) => (
              <label key={f.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-line bg-white px-4">
                <input type="radio" name="factor" checked={f.id === factorId} onChange={() => setFactorId(f.id)} className="size-5" />
                <span>{f.friendly_name || 'Authenticator'}</span>
              </label>
            ))}
          </fieldset>
        )}
        <CodeField label={t.code} value={code} onChange={setCode} />
        {error && <Notice>{error}</Notice>}
        {limit.wait > 0 && <Notice>{t.wait(limit.wait)}</Notice>}
        <Button type="submit" className="w-full" disabled={busy || limit.wait > 0 || code.length !== 6}>
          {t.verify}
        </Button>
      </form>
      <Button variant="secondary" className="w-full" onClick={() => void sb.auth.signOut({ scope: 'local' })}>
        {t.otherAccount}
      </Button>
    </AuthPage>
  )
}
