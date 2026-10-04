import { X } from 'lucide-react'
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

/* Short success / error messages at the bottom of the screen, above the phone navigation bar. */

type Tone = 'ok' | 'error' | 'info'
type Toast = { id: number; tone: Tone; text: string }

const ToastContext = createContext<(tone: Tone, text: string) => void>(() => {})
export const useToast = () => useContext(ToastContext)

/** Success messages fade after 4 s; errors stay until closed. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const next = useRef(1)
  const close = useCallback((id: number) => setToasts((all) => all.filter((x) => x.id !== id)), [])
  const notify = useCallback(
    (tone: Tone, text: string) => {
      const id = next.current++
      setToasts((all) => [...all.slice(-2), { id, tone, text }])
      if (tone !== 'error') setTimeout(() => close(id), 4000)
    },
    [close],
  )
  const styles: Record<Tone, string> = { ok: 'bg-green-700', error: 'bg-red-700', info: 'bg-navy' }
  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6">
        {toasts.map((x) => (
          <div
            key={x.id}
            role={x.tone === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full max-w-xl items-start gap-3 rounded-xl px-4 py-3 text-white shadow-lg ${styles[x.tone]}`}
          >
            <span className="flex-1">{x.text}</span>
            <button type="button" onClick={() => close(x.id)} className="-m-2 grid size-10 place-items-center" aria-label="Close">
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
