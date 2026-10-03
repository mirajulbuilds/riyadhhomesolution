import type { OpeningHours, Weekday } from '@/content/types'
import type { Lang } from '@/i18n/lang'
import { strings } from '@/i18n/strings'

/** Saudi week order, used to detect day ranges ("Sat – Thu"). */
export const WEEK: readonly Weekday[] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']

/** "23:30" → "11:30 PM" / "11:30 م" */
export function formatTime(hhmm: string, lang: Lang): string {
  const [h = 0, m = 0] = hhmm.split(':').map(Number)
  const t = strings[lang]
  const suffix = h >= 12 ? t.pm : t.am
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

function formatDays(days: Weekday[], lang: Lang): string {
  const names = strings[lang].days
  const sorted = [...days].sort((a, b) => WEEK.indexOf(a) - WEEK.indexOf(b))
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  if (!first || !last) return ''
  const consecutive = sorted.every((d, i) => WEEK.indexOf(d) === WEEK.indexOf(first) + i)
  if (sorted.length > 2 && consecutive) return `${names[first]} – ${names[last]}`
  return sorted.map((d) => names[d]).join(lang === 'ar' ? '، ' : ', ')
}

/** One display row per opening-hours entry: { days: "Sat – Thu", time: "8:00 AM – 11:30 PM" }. */
export function formatHours(hours: OpeningHours[], lang: Lang) {
  return hours.map((h) => ({
    days: formatDays(h.days, lang),
    time: `${formatTime(h.opens, lang)} – ${formatTime(h.closes, lang)}`,
  }))
}

/** schema.org day names, for openingHoursSpecification. */
export const SCHEMA_DAYS: Record<Weekday, string> = {
  sat: 'Saturday',
  sun: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
}
