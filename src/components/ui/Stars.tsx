import { useId } from 'react'

const STAR = 'M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5L2.5 9.5l6.6-.9z'

/** Star rating (supports fractions, e.g. 4.7). `label` is read by screen readers instead of the stars. */
export function Stars({ rating, label, size = 18 }: { rating: number; label: string; size?: number }) {
  const id = useId()
  const pct = Math.max(0, Math.min(5, rating)) / 5
  const width = size * 5 + 4 * 2
  return (
    // Stars are symmetric, so mirroring in RTL makes partial ratings fill from the right.
    <svg role="img" aria-label={label} width={width} height={size} viewBox={`0 0 ${width} ${size}`} className="shrink-0 rtl:-scale-x-100">
      <defs>
        <clipPath id={`${id}-fill`}>
          <rect x="0" y="0" width={width * pct} height={size} />
        </clipPath>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${i * (size + 2)} 0) scale(${size / 24})`}>
          <path d={STAR} fill="var(--line)" />
        </g>
      ))}
      <g clipPath={`url(#${id}-fill)`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(${i * (size + 2)} 0) scale(${size / 24})`}>
            <path d={STAR} fill="var(--orange)" />
          </g>
        ))}
      </g>
    </svg>
  )
}
