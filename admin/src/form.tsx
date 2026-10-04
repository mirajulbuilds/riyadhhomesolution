import { ArrowDown, ArrowUp, GripVertical, Plus, X } from 'lucide-react'
import { useRef, useState, type DragEvent, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { move } from './data'
import { useT } from './i18n'

/* Form controls for the content screens: one column, 48 px tap targets. */

const fieldClass = 'block w-full rounded-xl border border-line bg-white px-4 text-base text-ink focus:border-navy'

/** Label + optional help line around any control. */
export function Labeled({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-muted">{label}</span>
      {children}
      {help && <span className="mt-1 block text-xs text-muted">{help}</span>}
    </div>
  )
}

export function TextArea({
  label,
  help,
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; help?: string }) {
  return (
    <label className="block">
      <Labeled label={label} help={help}>
        <textarea rows={3} {...props} className={`${fieldClass} min-h-24 py-3 ${className}`} />
      </Labeled>
    </label>
  )
}

export function Select({ label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="block">
      <Labeled label={label}>
        <select {...props} className={`${fieldClass} min-h-12`}>
          {children}
        </select>
      </Labeled>
    </label>
  )
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 py-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5 shrink-0 accent-navy" />
      <span>{label}</span>
    </label>
  )
}

export function Badge({ tone = 'muted', children }: { tone?: 'muted' | 'warn' | 'navy'; children: ReactNode }) {
  const styles = {
    muted: 'border-line bg-bg text-muted',
    warn: 'border-amber-200 bg-amber-50 text-amber-800',
    navy: 'border-navy/20 bg-navy/5 text-navy',
  }
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${styles[tone]}`}>{children}</span>
}

/** Up/down buttons for one row of a reorderable list (the way to reorder on a phone). */
export function MoveButtons({ index, count, onMove, className = '' }: { index: number; count: number; onMove: (from: number, to: number) => void; className?: string }) {
  const { t } = useT()
  const btn = 'grid size-12 place-items-center rounded-xl border border-line bg-white text-navy disabled:opacity-30'
  return (
    <span className={`flex shrink-0 gap-1 ${className}`}>
      <button type="button" className={btn} disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={t.moveUp}>
        <ArrowUp className="size-5" aria-hidden="true" />
      </button>
      <button type="button" className={btn} disabled={index === count - 1} onClick={() => onMove(index, index + 1)} aria-label={t.moveDown}>
        <ArrowDown className="size-5" aria-hidden="true" />
      </button>
    </span>
  )
}

/** Mouse drag-and-drop for a list (desktop). Spread row(i) on each row and handle(i) on its grip. */
export function useDragList(onMove: (from: number, to: number) => void) {
  const from = useRef<number | null>(null)
  const [over, setOver] = useState<number | null>(null)
  const row = (index: number) => ({
    onDragOver: (e: DragEvent) => {
      if (from.current === null) return
      e.preventDefault()
      setOver(index)
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      if (from.current !== null && from.current !== index) onMove(from.current, index)
      from.current = null
      setOver(null)
    },
    className: over === index ? 'ring-2 ring-orange' : '',
  })
  const handle = (index: number) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => {
      from.current = index
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', String(index))
    },
    onDragEnd: () => {
      from.current = null
      setOver(null)
    },
  })
  return { row, handle }
}

export function DragHandle(props: ReturnType<ReturnType<typeof useDragList>['handle']>) {
  const { t } = useT()
  return (
    <span {...props} title={t.dragHint} aria-hidden="true" className="hidden shrink-0 cursor-grab items-center self-stretch px-1 text-muted sm:flex">
      <GripVertical className="size-5" />
    </span>
  )
}

/** Editable list of text rows: add, remove, move up/down. */
export function ListEditor({ label, items, onChange, dir }: { label: string; items: string[]; onChange: (items: string[]) => void; dir: 'rtl' | 'ltr' }) {
  const { t } = useT()
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm font-semibold text-muted">{label}</legend>
      {items.length === 0 && <p className="text-sm text-muted">{t.emptyList}</p>}
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
            dir={dir}
            aria-label={`${label} ${i + 1}`}
            className={`${fieldClass} min-h-12 min-w-0 flex-1`}
          />
          <MoveButtons index={i} count={items.length} onMove={(a, b) => onChange(move(items, a, b))} />
          <RemoveButton label={t.removeRow} onClick={() => onChange(items.filter((_, j) => j !== i))} />
        </div>
      ))}
      <AddButton label={t.addRow} onClick={() => onChange([...items, ''])} />
    </fieldset>
  )
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-12 items-center gap-2 rounded-xl px-3 font-semibold text-navy hover:bg-navy/5">
      <Plus className="size-5" aria-hidden="true" />
      {label}
    </button>
  )
}

export function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="grid size-12 shrink-0 place-items-center rounded-xl border border-red-200 bg-white text-red-700">
      <X className="size-5" aria-hidden="true" />
    </button>
  )
}

/** Arabic + English versions of one field, side by side on wide screens, stacked on phones. */
export function Pair({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>
}

/** Page heading with an optional back link. */
export function PageTitle({ title, onBack, children }: { title: string; onBack?: () => void; children?: ReactNode }) {
  const { t, lang } = useT()
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      {onBack && (
        <button type="button" onClick={onBack} className="inline-flex min-h-12 items-center rounded-xl border border-line bg-white px-4 font-semibold text-navy">
          {lang === 'ar' ? '→' : '←'} {t.back}
        </button>
      )}
      <h1 className="me-auto text-2xl font-bold text-navy">{title}</h1>
      {children}
    </div>
  )
}
