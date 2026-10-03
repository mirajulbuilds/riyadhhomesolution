import { useState, type FormEvent } from 'react'
import { authMessage, useTryLimit } from '../auth'
import { useT } from '../i18n'
import type { Supabase } from '../supabase'
import { AuthPage, Button, Field, Notice } from '../ui'

/** Email + password. There is deliberately no sign-up and no "forgot password" link. */
export function Login({ sb, notice, onSignedIn }: { sb: Supabase; notice?: 'notAdmin'; onSignedIn: () => void }) {
  const { t } = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const limit = useTryLimit()

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy || limit.wait) return
    setBusy(true)
    setError('')
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (error) {
      setError(authMessage(error, t, t.wrongPassword))
      limit.failed()
      return
    }
    limit.passed()
    setPassword('')
    onSignedIn()
  }

  return (
    <AuthPage title={t.signInTitle}>
      {notice === 'notAdmin' && !error && <Notice>{t.notAdmin}</Notice>}
      <form onSubmit={submit} className="space-y-4">
        <Field
          label={t.email}
          type="email"
          autoComplete="username"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          label={t.password}
          type="password"
          autoComplete="current-password"
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <Notice>{error}</Notice>}
        {limit.wait > 0 && <Notice>{t.wait(limit.wait)}</Notice>}
        <Button type="submit" className="w-full" disabled={busy || limit.wait > 0}>
          {t.signIn}
        </Button>
      </form>
    </AuthPage>
  )
}
