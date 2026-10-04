import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { useT } from './i18n'

const buttonStyles = {
  primary: 'bg-navy text-white hover:bg-navy/90',
  secondary: 'bg-white text-navy border border-line hover:bg-bg',
  danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-50',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonStyles }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyles[variant]} ${className}`}
    />
  )
}

export function Field({ label, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-muted">{label}</span>
      <input
        {...props}
        className={`block min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base text-ink focus:border-navy ${className}`}
      />
    </label>
  )
}

/** The 6-digit authenticator code input: number pad on phones, iOS can fill it from the app. */
export function CodeField({ value, onChange, label }: { value: string; onChange: (code: string) => void; label: string }) {
  return (
    <Field
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]{6}"
      maxLength={6}
      required
      dir="ltr"
      className="tracking-[0.4em]"
    />
  )
}

export function Notice({ tone = 'error', children }: { tone?: 'error' | 'warn' | 'info' | 'ok'; children: ReactNode }) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    info: 'border-line bg-white text-ink',
    ok: 'border-green-200 bg-green-50 text-green-800',
  }
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${styles[tone]}`}>
      {children}
    </p>
  )
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      {title && <h2 className="mb-3 text-lg font-bold text-navy">{title}</h2>}
      {children}
    </section>
  )
}

export function LangToggle({ className = '' }: { className?: string }) {
  const { t, toggle } = useT()
  return (
    <button type="button" onClick={toggle} className={`min-h-12 rounded-xl px-4 font-semibold ${className}`}>
      {t.otherLang}
    </button>
  )
}

/** Centered single-card page for the sign-in steps. */
export function AuthPage({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useT()
  return (
    <div className="min-h-dvh">
      <header className="flex items-center justify-between bg-navy px-4 py-2 text-white">
        <span className="text-lg font-bold">{t.appName}</span>
        <LangToggle className="text-white hover:bg-white/10" />
      </header>
      <main className="mx-auto max-w-md px-4 py-8">
        <h1 className="mb-5 text-2xl font-bold text-navy">{title}</h1>
        <div className="space-y-4">{children}</div>
      </main>
    </div>
  )
}
