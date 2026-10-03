import type { SVGProps } from 'react'
import { brandPaths, type BrandIconName } from './brand-paths'

interface Props extends SVGProps<SVGSVGElement> {
  name: BrandIconName
  size?: number
}

/** Filled brand glyph (WhatsApp, social networks). Decorative unless given a title. */
export function BrandIcon({ name, size = 20, ...rest }: Props) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
      <path d={brandPaths[name]} />
    </svg>
  )
}
