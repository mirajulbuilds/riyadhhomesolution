import { Images, Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  PRODUCT_CATEGORY_COLUMNS,
  PRODUCT_COLUMNS,
  SLUG_PATTERN,
  cleanProduct,
  cleanProductCategory,
  move,
  renumber,
  slugify,
  type ProductCategoryRow,
  type ProductRow,
} from '../data'
import { Badge, DragHandle, MoveButtons, PageTitle, Pair, Select, TextArea, Toggle, useDragList } from '../form'
import { useT } from '../i18n'
import { UnreadableImageError, clearImage, removeFolder, serviceVariants, storeImage, thumbOf } from '../images'
import { useNav, useUnsavedGuard } from '../nav'
import type { Supabase } from '../supabase'
import { useToast } from '../toast'
import { Button, Card, Field, Notice } from '../ui'
import { SaveBar } from './Categories'

/*
 * Products (no prices, no brands): product categories and their products.
 *   products                 list
 *   products?cat=<id|new>    product category form
 *   products?id=<id>         product form;  products?new=1&category=<id>  new product
 */
export function Products({ sb }: { sb: Supabase }) {
  const { route } = useNav()
  const p = route.params
  if (p.cat) return <ProductCategoryForm key={p.cat} sb={sb} id={p.cat === 'new' ? null : p.cat} />
  if (p.id || p.new) return <ProductForm key={p.id ?? 'new'} sb={sb} id={p.id ?? null} categoryId={p.category ?? null} />
  return <ProductList sb={sb} />
}

const bySort = <T extends { sort_order: number }>(rows: T[]) => rows.slice().sort((a, b) => a.sort_order - b.sort_order)

/** Product categories and products, both in site order. */
export function useProducts(sb: Supabase) {
  const [categories, setCategories] = useState<ProductCategoryRow[] | null>(null)
  const [products, setProducts] = useState<ProductRow[] | null>(null)
  const [failed, setFailed] = useState(false)
  const load = useCallback(async () => {
    const [c, p] = await Promise.all([sb.from('product_categories').select(PRODUCT_CATEGORY_COLUMNS), sb.from('products').select(PRODUCT_COLUMNS)])
    if (c.error || p.error) return setFailed(true)
    setCategories(bySort(c.data as ProductCategoryRow[]))
    setProducts(bySort(p.data as ProductRow[]))
  }, [sb])
  useEffect(() => void load(), [load])
  return { categories, setCategories, products, setProducts, failed, reload: load }
}

async function saveOrder(sb: Supabase, table: 'products' | 'product_categories', changes: { id: string; sort_order: number }[]) {
  const results = await Promise.all(changes.map((c) => sb.from(table).update({ sort_order: c.sort_order }).eq('id', c.id).select('id')))
  return results.find((r) => r.error || !r.data?.length)
}

function ProductList({ sb }: { sb: Supabase }) {
  const { t, lang } = useT()
  const { go } = useNav()
  const toast = useToast()
  const { categories, setCategories, products, setProducts, failed, reload } = useProducts(sb)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const filtered = !!(search.trim() || status)
  const name = (x: { name_ar: string; name_en: string }) => (lang === 'ar' ? x.name_ar : x.name_en)

  const groups = useMemo(() => {
    if (!categories || !products) return []
    const q = search.trim().toLowerCase()
    const keep = (p: ProductRow) => (!q || [p.name_ar, p.name_en].some((x) => x.toLowerCase().includes(q))) && (!status || (status === 'active' ? p.is_active : !p.is_active))
    return categories.map((c) => ({ category: c, items: products.filter((p) => p.category_id === c.id && keep(p)) }))
  }, [categories, products, search, status])

  async function reorderCategories(from: number, to: number) {
    if (!categories) return
    const next = move(categories, from, to)
    setCategories(next.map((c, i) => ({ ...c, sort_order: (i + 1) * 10 })))
    const bad = await saveOrder(sb, 'product_categories', renumber(next))
    if (bad) {
      toast('error', t.saveFailed(bad.error?.message ?? '—'))
      void reload()
    } else toast('ok', t.orderSaved)
  }

  async function reorderProducts(categoryId: string, from: number, to: number) {
    if (!products) return
    const next = move(products.filter((p) => p.category_id === categoryId), from, to)
    const order = new Map(next.map((p, i) => [p.id, (i + 1) * 10]))
    setProducts(bySort(products.map((p) => (order.has(p.id) ? { ...p, sort_order: order.get(p.id)! } : p))))
    const bad = await saveOrder(sb, 'products', renumber(next))
    if (bad) {
      toast('error', t.saveFailed(bad.error?.message ?? '—'))
      void reload()
    } else toast('ok', t.orderSaved)
  }

  const catDrag = useDragList((a, b) => void reorderCategories(a, b))
  const total = groups.reduce((n, g) => n + g.items.length, 0)

  return (
    <div className="space-y-6">
      <PageTitle title={t.navProducts}>
        <Button variant="secondary" onClick={() => go('photos', { for: 'products' })}>
          <Images className="me-1 size-5" aria-hidden="true" />
          {t.bulkPhotos}
        </Button>
      </PageTitle>
      {failed && <Notice>{t.loadFailed}</Notice>}
      {!products && !failed && <p className="text-muted">{t.loading}</p>}

      {categories && (
        <Card title={t.productCategories}>
          <p className="mb-3 text-sm text-muted">{t.productCategoriesHelp}</p>
          <ul className="space-y-2">
            {categories.map((c, i) => {
              const row = catDrag.row(i)
              const count = products?.filter((p) => p.category_id === c.id).length ?? 0
              return (
                <li key={c.id} onDragOver={row.onDragOver} onDrop={row.onDrop} className={`flex items-center gap-2 rounded-xl border border-line bg-white p-1.5 ${row.className}`}>
                  <DragHandle {...catDrag.handle(i)} />
                  <button type="button" onClick={() => go('products', { cat: c.id })} className="flex min-h-12 min-w-0 flex-1 flex-col justify-center text-start">
                    <span className="font-semibold">{name(c)}</span>
                    <span className="flex flex-wrap gap-1 text-xs text-muted">
                      {t.productCount(count)}
                      {!c.is_active && <Badge tone="warn">{t.hiddenBadge}</Badge>}
                    </span>
                  </button>
                  <MoveButtons index={i} count={categories.length} onMove={(a, b) => void reorderCategories(a, b)} className="sm:hidden" />
                </li>
              )
            })}
          </ul>
          <Button variant="secondary" className="mt-3" onClick={() => go('products', { cat: 'new' })}>
            <Plus className="me-1 size-5" aria-hidden="true" />
            {t.newProductCategory}
          </Button>
        </Card>
      )}

      {products && (
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-muted">{t.search}</span>
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} className="block min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base" />
          </label>
          <Select label={t.filterStatus} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t.all}</option>
            <option value="active">{t.statusActive}</option>
            <option value="hidden">{t.statusHidden}</option>
          </Select>
        </div>
      )}
      {products && (
        <p className="text-sm text-muted">
          {t.productCount(total)}
          {filtered && ` · ${t.reorderHint}`}
        </p>
      )}

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
                onClick={() => go('products', { new: '1', category: g.category.id })}
                className="grid size-12 place-items-center rounded-xl border border-line bg-white text-navy"
                aria-label={`${t.newProduct}: ${name(g.category)}`}
                title={t.newProduct}
              >
                <Plus className="size-5" aria-hidden="true" />
              </button>
            </div>
            {g.items.length === 0 && <p className="text-sm text-muted">{t.noProductsYet}</p>}
            <ProductRows items={g.items} reorderable={!filtered} onMove={(a, b) => void reorderProducts(g.category.id, a, b)} />
          </section>
        ))}
    </div>
  )
}

function ProductRows({ items, reorderable, onMove }: { items: ProductRow[]; reorderable: boolean; onMove: (from: number, to: number) => void }) {
  const { t, lang } = useT()
  const { go } = useNav()
  const drag = useDragList(onMove)
  return (
    <ul className="space-y-2">
      {items.map((p, i) => {
        const row = drag.row(i)
        return (
          <li key={p.id} {...(reorderable ? { onDragOver: row.onDragOver, onDrop: row.onDrop } : {})} className={`flex items-center gap-2 rounded-2xl border border-line bg-white p-2 ${reorderable ? row.className : ''}`}>
            {reorderable && <DragHandle {...drag.handle(i)} />}
            <button type="button" onClick={() => go('products', { id: p.id })} className="flex min-h-12 min-w-0 flex-1 items-center gap-3 text-start">
              {p.image_url ? (
                <img src={thumbOf(p.image_url)!} alt="" loading="lazy" className="size-14 shrink-0 rounded-lg bg-bg object-cover" />
              ) : (
                <span className="size-14 shrink-0 rounded-lg border border-dashed border-line bg-bg" aria-hidden="true" />
              )}
              <span className="min-w-0">
                <span className="block font-semibold">{lang === 'ar' ? p.name_ar : p.name_en}</span>
                <span className="block truncate text-xs text-muted">{lang === 'ar' ? p.spec_ar : p.spec_en}</span>
                <span className="flex flex-wrap gap-1 pt-1">
                  {!p.is_active && <Badge tone="warn">{t.hiddenBadge}</Badge>}
                  {!p.image_url && <Badge>{t.badgeNoPhoto}</Badge>}
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

function ProductCategoryForm({ sb, id }: { sb: Supabase; id: string | null }) {
  const { t, lang } = useT()
  const { go } = useNav()
  const toast = useToast()
  const { categories, products, failed } = useProducts(sb)
  const [row, setRow] = useState<ProductCategoryRow | null>(null)
  const saved = useRef('')
  const [slugEdited, setSlugEdited] = useState(!!id)
  const [busy, setBusy] = useState(false)
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (!categories || row) return
    const found = id ? categories.find((c) => c.id === id) : { id: '', slug: '', name_ar: '', name_en: '', sort_order: (categories.at(-1)?.sort_order ?? 0) + 10, is_active: true }
    if (!found) return
    saved.current = JSON.stringify(cleanProductCategory(found))
    setRow(found)
  }, [categories, id, row])

  const dirty = Boolean(row && JSON.stringify(cleanProductCategory(row)) !== saved.current)
  useUnsavedGuard(dirty)

  const slugError = useMemo(() => {
    if (!row || !categories) return null
    if (!SLUG_PATTERN.test(row.slug)) return t.slugInvalid
    return categories.some((c) => c.id !== row.id && c.slug === row.slug) ? t.productSlugTaken : null
  }, [row, categories, t])

  if (failed || (id && categories && !categories.some((c) => c.id === id))) return <Notice>{t.loadFailed}</Notice>
  if (!row || !products) return <p className="text-muted">{t.loading}</p>

  const isNew = !row.id
  const count = products.filter((p) => p.category_id === row.id).length
  const namesMissing = !row.name_ar.trim() || !row.name_en.trim()
  const set = <K extends keyof ProductCategoryRow>(key: K, value: ProductCategoryRow[K]) => setRow((r) => (r ? { ...r, [key]: value } : r))

  async function save() {
    if (!row) return
    setTried(true)
    if (namesMissing) return toast('error', t.namesRequired)
    if (slugError) return toast('error', slugError)
    setBusy(true)
    const clean = cleanProductCategory(row)
    const result = isNew
      ? await sb.from('product_categories').insert(clean).select('id').single()
      : await sb.from('product_categories').update(clean).eq('id', row.id).select('id').single()
    setBusy(false)
    if (result.error) return toast('error', result.error.code === '23505' ? t.productSlugTaken : t.saveFailed(result.error.message))
    saved.current = JSON.stringify(clean)
    toast('ok', isNew ? t.categoryCreated : t.saved)
    if (isNew) go('products', { cat: result.data.id as string }, { replace: true, force: true })
  }

  async function remove() {
    if (!row) return
    if (count > 0) return toast('error', t.categoryNotEmpty(count))
    if (!confirm(t.deleteCategoryConfirm(lang === 'ar' ? row.name_ar : row.name_en))) return
    setBusy(true)
    const { error } = await sb.from('product_categories').delete().eq('id', row.id).select('id').single()
    setBusy(false)
    // 23503: products were added meanwhile (the database refuses to delete a category in use).
    if (error) return toast('error', error.code === '23503' ? t.categoryNotEmpty(1) : t.saveFailed(error.message))
    saved.current = JSON.stringify(cleanProductCategory(row))
    toast('ok', t.categoryDeleted)
    go('products', {}, { force: true })
  }

  return (
    <div className="space-y-5 pb-24">
      <PageTitle title={isNew ? t.newProductCategory : `${t.editProductCategory}: ${row.name_en || row.name_ar}`} onBack={() => go('products')} />
      <Card title={t.basics}>
        <div className="space-y-4">
          <Pair>
            <Field label={`${t.name} · ${t.langAr}`} dir="rtl" value={row.name_ar} onChange={(e) => set('name_ar', e.target.value)} required />
            <Field
              label={`${t.name} · ${t.langEn}`}
              dir="ltr"
              value={row.name_en}
              onChange={(e) => setRow((r) => (r ? { ...r, name_en: e.target.value, slug: slugEdited ? r.slug : slugify(e.target.value) } : r))}
              required
            />
          </Pair>
          {tried && namesMissing && <Notice>{t.namesRequired}</Notice>}
          <div>
            <Field
              label={t.slug}
              dir="ltr"
              value={row.slug}
              onChange={(e) => {
                setSlugEdited(true)
                set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
              }}
              autoCapitalize="none"
              spellCheck={false}
            />
            <p className="mt-1 text-xs text-muted">{t.productSlugHelp}</p>
            {slugError && (row.slug || tried) && <p className="mt-1 text-sm font-semibold text-red-700">{slugError}</p>}
          </div>
          <Field label={t.sortOrder} type="number" inputMode="numeric" value={row.sort_order} onChange={(e) => set('sort_order', Number(e.target.value) || 0)} />
          <Toggle label={t.shownOnSite} checked={row.is_active} onChange={(v) => set('is_active', v)} />
        </div>
      </Card>
      {!isNew && (
        <Card title={t.deleteCategory}>
          {count > 0 && <p className="mb-3 text-sm text-amber-800">{t.categoryNotEmpty(count)}</p>}
          <Button variant="danger" disabled={busy || count > 0} onClick={remove}>
            {t.deleteCategory}
          </Button>
        </Card>
      )}
      <SaveBar busy={busy} dirty={dirty || isNew} onSave={save} />
    </div>
  )
}

const emptyProduct = (categoryId: string, sortOrder: number): ProductRow => ({
  id: '',
  category_id: categoryId,
  name_ar: '',
  name_en: '',
  spec_ar: null,
  spec_en: null,
  image_url: null,
  sort_order: sortOrder,
  is_active: true,
})

function ProductForm({ sb, id, categoryId }: { sb: Supabase; id: string | null; categoryId: string | null }) {
  const { t, lang } = useT()
  const { go } = useNav()
  const toast = useToast()
  const { categories, products, failed } = useProducts(sb)
  const [row, setRow] = useState<ProductRow | null>(null)
  const saved = useRef('')
  const [busy, setBusy] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [pendingPhoto, setPendingPhoto] = useState<{ file: File; preview: string } | null>(null)
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (!categories || !products || row) return
    let found: ProductRow | undefined
    if (id) found = products.find((p) => p.id === id)
    else {
      const cat = categoryId && categories.some((c) => c.id === categoryId) ? categoryId : categories[0]?.id
      if (cat) found = emptyProduct(cat, products.filter((p) => p.category_id === cat).reduce((max, p) => Math.max(max, p.sort_order), 0) + 10)
    }
    if (!found) return
    saved.current = JSON.stringify(cleanProduct(found))
    setRow(found)
  }, [categories, products, id, categoryId, row])

  useEffect(() => () => void (pendingPhoto && URL.revokeObjectURL(pendingPhoto.preview)), [pendingPhoto])

  const dirty = Boolean(row && (JSON.stringify(cleanProduct(row)) !== saved.current || pendingPhoto))
  useUnsavedGuard(dirty)

  if (failed || (id && products && !products.some((p) => p.id === id))) return <Notice>{t.loadFailed}</Notice>
  if (categories && categories.length === 0) return <Notice tone="info">{t.needProductCategory}</Notice>
  if (!row || !categories) return <p className="text-muted">{t.loading}</p>

  const isNew = !row.id
  const namesMissing = !row.name_ar.trim() || !row.name_en.trim()
  const set = <K extends keyof ProductRow>(key: K, value: ProductRow[K]) => setRow((r) => (r ? { ...r, [key]: value } : r))
  const photoError = (e: unknown) => (e instanceof UnreadableImageError ? t.unreadableImage(e.fileName) : t.photoFailed((e as Error).message))
  const savePhotoUrl = (productId: string) => (u: string | null) => sb.from('products').update({ image_url: u }).eq('id', productId).select('id').single()

  async function save() {
    if (!row) return
    setTried(true)
    if (namesMissing) return toast('error', t.namesRequired)
    setBusy(true)
    const clean = cleanProduct(row)
    const result = isNew ? await sb.from('products').insert(clean).select('id').single() : await sb.from('products').update(clean).eq('id', row.id).select('id').single()
    if (result.error) {
      setBusy(false)
      return toast('error', t.saveFailed(result.error.message))
    }
    const newId = result.data.id as string
    let imageUrl = row.image_url
    if (pendingPhoto) {
      try {
        imageUrl = (await storeImage(sb, newId, await serviceVariants(pendingPhoto.file), savePhotoUrl(newId), 'products')).url
      } catch (e) {
        toast('error', photoError(e))
      }
      setPendingPhoto(null)
    }
    saved.current = JSON.stringify(clean)
    setRow({ ...row, id: newId, image_url: imageUrl })
    setBusy(false)
    toast('ok', isNew ? t.productCreated : t.saved)
    if (isNew) go('products', { id: newId }, { replace: true, force: true })
  }

  async function remove() {
    if (!row || !confirm(t.deleteProductConfirm(lang === 'ar' ? row.name_ar : row.name_en))) return
    setBusy(true)
    const { error } = await sb.from('products').delete().eq('id', row.id).select('id').single()
    if (error) {
      setBusy(false)
      return toast('error', t.saveFailed(error.message))
    }
    const warning = await removeFolder(sb, row.id, 'products')
    saved.current = JSON.stringify(cleanProduct(row))
    setPendingPhoto(null)
    toast(warning ? 'info' : 'ok', warning ? t.cleanupWarning(warning) : t.productDeleted)
    go('products', {}, { force: true })
  }

  async function pickPhoto(file: File) {
    if (!row) return
    if (isNew) {
      if (pendingPhoto) URL.revokeObjectURL(pendingPhoto.preview)
      return setPendingPhoto({ file, preview: URL.createObjectURL(file) })
    }
    setPhotoBusy(true)
    try {
      const { url, warning } = await storeImage(sb, row.id, await serviceVariants(file), savePhotoUrl(row.id), 'products')
      setRow((r) => (r ? { ...r, image_url: url } : r))
      toast(warning ? 'info' : 'ok', warning ? t.cleanupWarning(warning) : t.photoSaved)
    } catch (e) {
      toast('error', photoError(e))
    }
    setPhotoBusy(false)
  }

  async function removePhoto() {
    if (!row) return
    if (pendingPhoto) {
      URL.revokeObjectURL(pendingPhoto.preview)
      return setPendingPhoto(null)
    }
    if (!confirm(t.removeProductPhotoConfirm)) return
    setPhotoBusy(true)
    try {
      const { warning } = await clearImage(sb, row.id, () => savePhotoUrl(row.id)(null), 'products')
      setRow((r) => (r ? { ...r, image_url: null } : r))
      toast(warning ? 'info' : 'ok', warning ? t.cleanupWarning(warning) : t.photoRemoved)
    } catch (e) {
      toast('error', photoError(e))
    }
    setPhotoBusy(false)
  }

  const preview = pendingPhoto?.preview ?? thumbOf(row.image_url)

  return (
    <div className="space-y-5 pb-24">
      <PageTitle title={isNew ? t.newProduct : `${t.editProduct}: ${row.name_en || row.name_ar}`} onBack={() => go('products')} />
      <Card title={t.basics}>
        <div className="space-y-4">
          <Select label={t.category} value={row.category_id} onChange={(e) => set('category_id', e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {lang === 'ar' ? c.name_ar : c.name_en}
              </option>
            ))}
          </Select>
          <Pair>
            <Field label={`${t.name} · ${t.langAr}`} dir="rtl" value={row.name_ar} onChange={(e) => set('name_ar', e.target.value)} required />
            <Field label={`${t.name} · ${t.langEn}`} dir="ltr" value={row.name_en} onChange={(e) => set('name_en', e.target.value)} required />
          </Pair>
          {tried && namesMissing && <Notice>{t.namesRequired}</Notice>}
          <Pair>
            <TextArea label={`${t.spec} · ${t.langAr}`} dir="rtl" rows={2} value={row.spec_ar ?? ''} onChange={(e) => set('spec_ar', e.target.value)} />
            <TextArea label={`${t.spec} · ${t.langEn}`} dir="ltr" rows={2} value={row.spec_en ?? ''} onChange={(e) => set('spec_en', e.target.value)} />
          </Pair>
          <p className="text-xs text-muted">{t.noPricesNoBrands}</p>
          <Field label={t.sortOrder} type="number" inputMode="numeric" value={row.sort_order} onChange={(e) => set('sort_order', Number(e.target.value) || 0)} />
          <Toggle label={t.shownOnSite} checked={row.is_active} onChange={(v) => set('is_active', v)} />
        </div>
      </Card>

      <Card title={t.photo}>
        {preview && <img src={preview} alt="" className="mb-3 aspect-[4/3] w-full max-w-sm rounded-xl bg-bg object-cover" />}
        {photoBusy && <p className="mb-3 text-muted">{t.photoWorking}</p>}
        {isNew && pendingPhoto && <p className="mb-3 text-sm text-muted">{t.photoOnSave}</p>}
        <div className="flex flex-wrap gap-3">
          <label className={`inline-flex min-h-12 cursor-pointer items-center rounded-xl border border-line bg-white px-5 font-semibold text-navy ${photoBusy || busy ? 'pointer-events-none opacity-50' : ''}`}>
            {preview ? t.replacePhoto : t.addPhoto}
            <input
              type="file"
              accept="image/*,.heic,.heif"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) void pickPhoto(file)
              }}
            />
          </label>
          {preview && (
            <Button variant="danger" disabled={photoBusy || busy} onClick={removePhoto}>
              {t.removePhoto}
            </Button>
          )}
        </div>
      </Card>

      {!isNew && (
        <Card title={t.deleteProduct}>
          <Button variant="danger" disabled={busy} onClick={remove}>
            {t.deleteProduct}
          </Button>
        </Card>
      )}
      <SaveBar busy={busy} dirty={dirty || isNew} onSave={save} />
    </div>
  )
}
