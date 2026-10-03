import { Cctv, Droplets, Grid2x2, PaintRoller, Sparkles, Wrench, Zap, type LucideIcon } from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  droplet: Droplets,
  zap: Zap,
  cctv: Cctv,
  'paint-roller': PaintRoller,
  grid: Grid2x2,
  sparkles: Sparkles,
}

/** Accent per category icon: background tint + icon colour (brand palette only). */
const TONES: Record<string, { bg: string; fg: string }> = {
  droplet: { bg: 'bg-sky/12', fg: 'text-sky' },
  zap: { bg: 'bg-orange/15', fg: 'text-orange-text' },
  cctv: { bg: 'bg-navy/8', fg: 'text-navy' },
  'paint-roller': { bg: 'bg-orange/12', fg: 'text-orange-text' },
  grid: { bg: 'bg-sky/10', fg: 'text-sky' },
  sparkles: { bg: 'bg-wa/10', fg: 'text-wa' },
}

export const categoryTone = (icon: string | null) => TONES[icon ?? ''] ?? { bg: 'bg-navy/8', fg: 'text-navy' }

export function CategoryIcon({ icon, className }: { icon: string | null; className?: string }) {
  const Icon = ICONS[icon ?? ''] ?? Wrench
  return <Icon aria-hidden="true" className={className} />
}

/** Square category art built from the icon — the fallback when a category has no illustration. */
export function CategoryArt({ icon, className = '' }: { icon: string | null; className?: string }) {
  const tone = categoryTone(icon)
  return (
    <div aria-hidden="true" className={`relative isolate grid aspect-square place-items-center overflow-hidden rounded-card ${tone.bg} ${className}`}>
      <span className="absolute -end-6 -top-6 size-28 rounded-full border-[14px] border-white/60" />
      <span className="absolute -bottom-8 -start-4 size-24 rounded-full bg-white/40" />
      <span className="absolute start-6 top-6 size-3 rounded-full bg-orange" />
      <span className="absolute bottom-8 end-8 size-2 rounded-full bg-navy/30" />
      <span className="grid size-[58%] place-items-center rounded-full bg-white shadow-[0_12px_30px_-12px_rgb(11_37_69/0.35)]">
        <CategoryIcon icon={icon} className={`size-[46%] ${tone.fg}`} />
      </span>
    </div>
  )
}

/** Our own exported illustrations: /illustrations/<name>.png, with -400 and .webp (-200/-400/800) variants beside it. */
const LOCAL_ILLUSTRATION = /^\/illustrations\/([a-z0-9-]+)\.png$/

/**
 * The category's sticker illustration (transparent PNG/WebP, never mirrored in RTL), or the icon
 * art when no image is set. `size` is the largest CSS width it is shown at (for `sizes`); the
 * className sets the actual size. Decorative: the category name is always next to it.
 */
export function CategoryIllustration({
  src,
  icon,
  size,
  sizes,
  eager = false,
  className = '',
}: {
  src: string | null
  icon: string | null
  size: number
  /** Override for responsive layouts; defaults to "<size>px". */
  sizes?: string
  eager?: boolean
  className?: string
}) {
  if (!src) return <CategoryArt icon={icon} className={className} />
  const img = {
    alt: '',
    width: size,
    height: size,
    loading: eager ? ('eager' as const) : ('lazy' as const),
    decoding: 'async' as const,
    className: `block object-contain ${className}`,
  }
  const local = LOCAL_ILLUSTRATION.exec(src)
  if (!local) return <img src={src} {...img} />
  const base = `/illustrations/${local[1]}`
  const sizesAttr = sizes ?? `${size}px`
  return (
    // display: contents — the <img> sizes against the parent (size-full works), not the <picture>.
    <picture className="contents">
      <source type="image/webp" srcSet={`${base}-200.webp 200w, ${base}-400.webp 400w, ${base}.webp 800w`} sizes={sizesAttr} />
      <img src={src} srcSet={`${base}-400.png 400w, ${base}.png 800w`} sizes={sizesAttr} {...img} />
    </picture>
  )
}
