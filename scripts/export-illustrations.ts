/**
 * Exports the category illustrations (design/illustrations/*.svg) to transparent PNG and WebP.
 *
 *   npm run illustrations
 *
 * For each <name>.svg it writes, in public/illustrations/:
 *   <name>.png  800×800    <name>-400.png  400×400
 *   <name>.webp 800×800    <name>-400.webp 400×400    <name>-200.webp 200×200 (small tiles and cards)
 * WebP keeps the alpha channel; PNG is the fallback for browsers without WebP.
 *
 * The SVG files are the source of truth — edit them and run this again. Each file is named after
 * its category slug; categories.image_url points at /illustrations/<slug>.png by default.
 */
import { mkdirSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const SRC = fileURLToPath(new URL('../design/illustrations/', import.meta.url))
const OUT = fileURLToPath(new URL('../public/illustrations/', import.meta.url))
const SIZES = [800, 400, 200] as const

mkdirSync(OUT, { recursive: true })

const names = readdirSync(SRC)
  .filter((f) => f.endsWith('.svg'))
  .map((f) => f.slice(0, -4))

for (const name of names) {
  for (const size of SIZES) {
    // Rasterise at the target size (viewBox is 400 units) so strokes stay crisp.
    const image = sharp(`${SRC}${name}.svg`, { density: (72 * size) / 400 }).resize(size, size)
    const base = `${OUT}${name}${size === 800 ? '' : `-${size}`}`
    if (size !== 200) await image.clone().png({ compressionLevel: 9, palette: false }).toFile(`${base}.png`)
    await image.clone().webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(`${base}.webp`)
  }
  console.log(`illustrations/${name}: png 800 + 400, webp 800 + 400 + 200`)
}
