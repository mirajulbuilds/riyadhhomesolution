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

/** Square category illustration: tinted tile, white disc, large icon, a few decorative shapes. */
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
