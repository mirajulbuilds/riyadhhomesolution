import { MapPin } from 'lucide-react'
import type { Site } from '@/content/types'
import { useSite, useStrings } from './site-context'

const W = 600
const H = 330
const PAD_X = 64
const PAD_Y = 48

/** Where each label sits relative to its pin, so neighbouring names don't collide. */
const LABEL_SIDE: Record<string, 'above' | 'below' | 'side'> = {
  ghirnatah: 'side',
  'ash-shuhada': 'below',
  'al-hamra': 'below',
  'al-izdihar': 'below',
  'at-taawun': 'below',
}

/**
 * Simplified map of the districts we cover, drawn from approximate district centres
 * (equirectangular projection, north up). Not mirrored in RTL — it's geography.
 */
export function AreasMap() {
  const site = useSite()
  const t = useStrings()
  const points = site.areas.filter((a) => typeof a.lat === 'number' && typeof a.lng === 'number')
  if (points.length < 2) return null

  const project = makeProjection([...points.map((a) => ({ lat: a.lat!, lng: a.lng! })), site.geo])
  const shop = project(site.geo)

  return (
    <figure className="overflow-hidden rounded-card border border-line bg-white">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${t.home.areasTitle}: ${points.map((a) => a.name).join(site.lang === 'ar' ? '، ' : ', ')}`} className="block h-auto w-full">
        <defs>
          <pattern id="areas-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M30 0H0V30" fill="none" stroke="var(--line)" strokeWidth="1" />
          </pattern>
          <radialGradient id="areas-glow">
            <stop offset="0" stopColor="var(--orange)" stopOpacity="0.22" />
            <stop offset="1" stopColor="var(--orange)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="#F4F7FA" />
        <rect width={W} height={H} fill="url(#areas-grid)" opacity="0.7" />

        {/* coverage glow + radar rings around the shop (animated in Phase 4) */}
        <circle cx={shop.x} cy={shop.y} r="150" fill="url(#areas-glow)" />
        {[48, 92, 136].map((r) => (
          <circle key={r} cx={shop.x} cy={shop.y} r={r} fill="none" stroke="var(--orange)" strokeOpacity="0.25" strokeDasharray="3 6" />
        ))}

        {points.map((a) => {
          const p = project({ lat: a.lat!, lng: a.lng! })
          const side = LABEL_SIDE[a.key] ?? 'above'
          return (
            <g key={a.key} data-area={a.key}>
              <circle cx={p.x} cy={p.y} r="7" fill="var(--navy)" stroke="#fff" strokeWidth="2.5" />
              <text
                className="map-label"
                x={side === 'side' ? p.x + 12 : p.x}
                y={side === 'below' ? p.y + 26 : side === 'side' ? p.y + 5 : p.y - 14}
                textAnchor={side === 'side' ? 'start' : 'middle'}
                direction="ltr"
                fontWeight="600"
                fill="var(--navy)"
                stroke="#F4F7FA"
                strokeWidth="4"
                paintOrder="stroke"
              >
                {a.name}
              </text>
            </g>
          )
        })}

        {/* the shop */}
        <g data-shop transform={`translate(${shop.x} ${shop.y})`}>
          <path d="M0 0c-9-11-15-18-15-25a15 15 0 0 1 30 0c0 7-6 14-15 25z" fill="var(--orange)" stroke="#fff" strokeWidth="2.5" />
          <path d="M-6.5-24.5 0-30l6.5 5.5V-19h-13z" fill="var(--navy)" />
        </g>
        <text
          className="map-label"
          x={shop.x + 20}
          y={shop.y - 30}
          direction="ltr"
          fontWeight="700"
          fill="var(--orange-text)"
          stroke="#F4F7FA"
          strokeWidth="4"
          paintOrder="stroke"
        >
          {t.common.shop}
        </text>

        {/* north arrow */}
        <g transform="translate(30 34)" aria-hidden="true">
          <path d="M0-14 7 6 0 2-7 6z" fill="var(--muted)" />
          <text y="22" textAnchor="middle" fontSize="12" fill="var(--muted)">
            {t.common.north}
          </text>
        </g>
      </svg>
      <figcaption className="flex items-center gap-1.5 border-t border-line px-4 py-2 text-xs text-muted">
        <MapPin aria-hidden="true" className="size-3.5" />
        {t.common.mapApprox}
      </figcaption>
    </figure>
  )
}

function makeProjection(all: { lat: number; lng: number }[]) {
  const lats = all.map((p) => p.lat)
  const lngs = all.map((p) => p.lng)
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)]
  const kx = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180))
  const spanX = (maxLng - minLng) * kx || 1
  const spanY = maxLat - minLat || 1
  const scale = Math.min((W - 2 * PAD_X) / spanX, (H - 2 * PAD_Y) / spanY)
  const offX = (W - spanX * scale) / 2
  const offY = (H - spanY * scale) / 2
  return (p: { lat: number; lng: number }) => ({
    x: Math.round((offX + (p.lng - minLng) * kx * scale) * 10) / 10,
    y: Math.round((offY + (maxLat - p.lat) * scale) * 10) / 10,
  })
}

/** Chips + map + "farther areas on request" note. */
export function AreasBlock({ showMap = true }: { showMap?: boolean }) {
  const site = useSite()
  return (
    <div className={showMap ? 'grid items-start gap-8 lg:grid-cols-[1fr_1.3fr]' : ''}>
      <AreaChips site={site} />
      {showMap && <AreasMap />}
    </div>
  )
}

export function AreaChips({ site }: { site: Site }) {
  return (
    <div>
      <ul className="flex flex-wrap gap-2">
        {site.areas.map((a) => (
          <li key={a.key} className="chip">
            <MapPin aria-hidden="true" className="size-3.5 text-orange-text" />
            {a.name}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted">{site.areasNote}</p>
    </div>
  )
}
