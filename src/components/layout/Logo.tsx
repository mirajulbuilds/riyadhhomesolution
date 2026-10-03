import { useSite } from '../site-context'

const SOURCES = {
  color: '/brand/RHS-logo-horizontal-color.svg',
  reversed: '/brand/RHS-logo-horizontal-reversed.svg',
} as const

/** The horizontal logo. It stays in English in both languages; the alt text follows the page language. */
export function Logo({
  variant = 'color',
  className,
  lazy = false,
}: {
  variant?: keyof typeof SOURCES
  className?: string
  /** For below-the-fold copies (footer), so they don't compete with first paint. */
  lazy?: boolean
}) {
  const { brand } = useSite()
  // width/height carry the SVG's aspect ratio so the slot is reserved before it loads (no layout shift).
  return (
    <img
      src={SOURCES[variant]}
      alt={brand}
      width={1049}
      height={328}
      className={className}
      decoding="async"
      loading={lazy ? 'lazy' : undefined}
    />
  )
}
