import { Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CATEGORY_COLUMNS, SERVICE_COLUMNS, missingLongText, move, renumber, type CategoryRow, type ServiceRow } from '../data'
import { Badge, DragHandle, MoveButtons, PageTitle, Select, useDragList } from '../form'
import { useT } from '../i18n'
import { thumbOf } from '../images'
import { useNav } from '../nav'
import type { Supabase } from '../supabase'
import { useToast } from '../toast'
import { Button, Notice } from '../ui'
import { ServiceForm } from './ServiceForm'

export function Services({ sb }: { sb: Supabase }) {
  const { route } = useNav()
  // Keyed by the route, so a newly created service reopens with fresh data.
  if (route.params.id || route.params.new)
    return <ServiceForm key={route.params.id ?? 'new'} sb={sb} id={route.params.id ?? null} categoryId={route.params.category ?? null} />
  return <ServiceList sb={sb} />
}

/** Loads categories (in site order) and services (in admin order). */
export function useCatalog(sb: Supabase) {
  const [categories, setCategories] = useState<CategoryRow[] | null>(null)
  const [services, setServices] = useState<ServiceRow[] | null>(null)
  const [failed, setFailed] = useState(false)
  const load = useCallback(async () => {
    const [c, s] = await Promise.all([
      sb.from('categories').select(CATEGORY_COLUMNS).order('sort_order'),
      sb.from('services').select(SERVICE_COLUMNS).order('sort_order'),
    ])
    if (c.error || s.error) return setFailed(true)
    setCategories(c.data as CategoryRow[])
    setServices(s.data as ServiceRow[])
  }, [sb])
  useEffect(() => void load(), [load])
  return { categories, services, setServices, failed, reload: load }
}

function ServiceList({ sb }: { sb: Supabase }) {
  const { t, lang } = useT()
  const { route, go } = useNav()
  const toast = useToast()
  const { categories, services, setServices, failed, reload } = useCatalog(sb)
  const p = route.params
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(p.category ?? '')
  const [status, setStatus] = useState(p.status ?? '')
  const [photo, setPhoto] = useState(p.photo ?? '')
  const [detail, setDetail] = useState(p.detail ?? '')

  const filtered = !!(search.trim() || status || photo || detail)
  const name = (s: { name_ar: string; name_en: string }) => (lang === 'ar' ? s.name_ar : s.name_en)

  const groups = useMemo(() => {
    if (!categories || !services) return []
    const q = search.trim().toLowerCase()
    const keep = (s: ServiceRow) =>
      (!q || [s.name_ar, s.name_en, s.slug].some((x) => x.toLowerCase().includes(q))) &&
      (!status || (status === 'active' ? s.is_active : !s.is_active)) &&
      (!photo || (photo === 'yes' ? !!s.image_url : !s.image_url)) &&
      (!detail || (detail === 'yes' ? s.has_detail_page : detail === 'no' ? !s.has_detail_page : missingLongText(s)))
    return categories
      .filter((c) => !category || c.id === category)
      .map((c) => ({ category: c, items: services.filter((s) => s.category_id === c.id && keep(s)) }))
  }, [categories, services, search, category, status, photo, detail])

  async function reorder(categoryId: string, from: number, to: number) {
    if (!services) return
    const inCategory = services.filter((s) => s.category_id === categoryId)
    const next = move(inCategory, from, to)
    const changes = renumber(next)
    const order = new Map(next.map((s, i) => [s.id, (i + 1) * 10]))
    setServices(services.map((s) => (order.has(s.id) ? { ...s, sort_order: order.get(s.id)! } : s)).sort((a, b) => a.sort_order - b.sort_order))
    const results = await Promise.all(changes.map((c) => sb.from('services').update({ sort_order: c.sort_order }).eq('id', c.id).select('id')))
    const bad = results.find((r) => r.error || !r.data?.length)
    if (bad) {
      toast('error', t.saveFailed(bad.error?.message ?? '—'))
      void reload()
    } else toast('ok', t.orderSaved)
  }

  const total = groups.reduce((n, g) => n + g.items.length, 0)

  return (
    <div>
      <PageTitle title={t.navServices}>
        <Button onClick={() => go('services', { new: '1', ...(category ? { category } : {}) })}>
          <Plus className="me-1 size-5" aria-hidden="true" />
          {t.newService}
        </Button>
      </PageTitle>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="sr-only">{t.searchPlaceholder}</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="block min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base"
          />
        </label>
        <Select label={t.filterCategory} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">{t.all}</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {name(c)}
            </option>
          ))}
        </Select>
        <Select label={t.filterStatus} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{t.all}</option>
          <option value="active">{t.statusActive}</option>
          <option value="hidden">{t.statusHidden}</option>
        </Select>
        <Select label={t.filterPhoto} value={photo} onChange={(e) => setPhoto(e.target.value)}>
          <option value="">{t.all}</option>
          <option value="yes">{t.withPhoto}</option>
          <option value="no">{t.withoutPhoto}</option>
        </Select>
        <Select label={t.filterDetail} value={detail} onChange={(e) => setDetail(e.target.value)}>
          <option value="">{t.all}</option>
          <option value="yes">{t.withDetail}</option>
          <option value="no">{t.withoutDetail}</option>
          <option value="missing">{t.badgeMissingText}</option>
        </Select>
      </div>

      {failed && <Notice>{t.loadFailed}</Notice>}
      {!services && !failed && <p className="text-muted">{t.loading}</p>}
      {services && (
        <p className="mb-4 text-sm text-muted">
          {t.serviceCount(total)}
          {filtered && ` · ${t.reorderHint}`}
        </p>
      )}
      {services && total === 0 && <Notice tone="info">{t.noResults}</Notice>}

      <div className="space-y-6">
        {groups
          .filter((g) => g.items.length || !filtered)
          .map((g) => (
            <section key={g.category.id}>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="me-auto text-lg font-bold text-navy">
                  {name(g.category)} <span className="text-sm font-normal text-muted">({g.items.length})</span>
                </h2>
                <button
                  type="button"
                  onClick={() => go('services', { new: '1', category: g.category.id })}
                  className="grid size-12 place-items-center rounded-xl border border-line bg-white text-navy"
                  aria-label={`${t.newService}: ${name(g.category)}`}
                  title={t.newService}
                >
                  <Plus className="size-5" aria-hidden="true" />
                </button>
              </div>
              <ServiceRows items={g.items} reorderable={!filtered} onMove={(a, b) => void reorder(g.category.id, a, b)} />
            </section>
          ))}
      </div>
    </div>
  )
}

function ServiceRows({ items, reorderable, onMove }: { items: ServiceRow[]; reorderable: boolean; onMove: (from: number, to: number) => void }) {
  const { t, lang } = useT()
  const { go } = useNav()
  const drag = useDragList(onMove)
  return (
    <ul className="space-y-2">
      {items.map((s, i) => {
        const row = drag.row(i)
        return (
          <li key={s.id} {...(reorderable ? { onDragOver: row.onDragOver, onDrop: row.onDrop } : {})} className={`flex items-center gap-2 rounded-2xl border border-line bg-white p-2 ${reorderable ? row.className : ''}`}>
            {reorderable && <DragHandle {...drag.handle(i)} />}
            <button type="button" onClick={() => go('services', { id: s.id })} className="flex min-h-12 min-w-0 flex-1 items-center gap-3 text-start">
              {s.image_url ? (
                <img src={thumbOf(s.image_url)!} alt="" loading="lazy" className="size-14 shrink-0 rounded-lg bg-bg object-cover" />
              ) : (
                <span className="size-14 shrink-0 rounded-lg border border-dashed border-line bg-bg" aria-hidden="true" />
              )}
              <span className="min-w-0">
                <span className="block font-semibold">{lang === 'ar' ? s.name_ar : s.name_en}</span>
                <span className="block truncate text-xs text-muted" dir="ltr">
                  {s.slug}
                </span>
                <span className="flex flex-wrap gap-1 pt-1">
                  {!s.is_active && <Badge tone="warn">{t.hiddenBadge}</Badge>}
                  {!s.image_url && <Badge>{t.badgeNoPhoto}</Badge>}
                  {s.has_detail_page && <Badge tone="navy">{t.badgeDetail}</Badge>}
                  {s.featured && <Badge tone="navy">{t.badgeFeatured}</Badge>}
                  {missingLongText(s) && <Badge tone="warn">{t.badgeMissingText}</Badge>}
                </span>
              </span>
            </button>
            {reorderable && <MoveButtons index={i} count={items.length} onMove={onMove} className="sm:hidden" />}
          </li>
        )
      })}
    </ul>
  )
}
