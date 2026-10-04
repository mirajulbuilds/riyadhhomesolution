import { useEffect, useState } from 'react'
import { Select } from './form'
import { useT, type Lang } from './i18n'
import type { Supabase } from './supabase'

/* Districts: a service area from settings.service_areas (stored as its key), or free text. */

export interface Area {
  key: string
  ar: string
  en: string
}

export function useAreas(sb: Supabase): Area[] {
  const [areas, setAreas] = useState<Area[]>([])
  useEffect(() => {
    void sb
      .from('settings')
      .select('value')
      .eq('key', 'service_areas')
      .maybeSingle()
      .then(({ data }) => setAreas(Array.isArray(data?.value) ? (data.value as Area[]) : []))
  }, [sb])
  return areas
}

/** The area's name in the panel language, or the free text as typed. */
export function districtName(value: string | null, areas: Area[], lang: Lang): string {
  if (!value) return ''
  const area = areas.find((a) => a.key === value)
  return area ? area[lang] : value
}

const OTHER = '__other'

export function DistrictField({ value, onChange, areas, label }: { value: string | null; onChange: (value: string | null) => void; areas: Area[]; label?: string }) {
  const { t, lang } = useT()
  const known = !value || areas.some((a) => a.key === value)
  const [typing, setTyping] = useState(!known)
  const choice = typing ? OTHER : value ?? ''
  return (
    <div className="space-y-2">
      <Select
        label={label ?? t.district}
        value={choice}
        onChange={(e) => {
          const v = e.target.value
          setTyping(v === OTHER)
          onChange(v === OTHER || v === '' ? null : v)
        }}
      >
        <option value="">{t.none}</option>
        {areas.map((a) => (
          <option key={a.key} value={a.key}>
            {a[lang]}
          </option>
        ))}
        <option value={OTHER}>{t.districtOther}</option>
      </Select>
      {typing && (
        <input
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder={t.districtTypeIt}
          aria-label={t.districtOther}
          maxLength={80}
          className="block min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base"
        />
      )}
    </div>
  )
}
