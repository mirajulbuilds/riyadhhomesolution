/*
 * Bulk photo upload: matches each file name to a service slug.
 *   1. exact — the name without its extension is the slug ("mixer-tap-replacement.webp");
 *   2. close — the same after ignoring case, "_", "-", spaces, extensions and copy suffixes
 *      ("Mixer_Tap_Replacement (1).JPG"), optionally prefixed with the category slug, or failing
 *      that the most similar slug (≥ 80 % alike, e.g. a typo);
 *   3. none — the owner picks the service by hand.
 * Pure functions, so the logic is tested without a browser.
 */

export interface MatchTarget {
  id: string
  slug: string
  categorySlug: string
}

export interface Match {
  file: string
  target: MatchTarget | null
  kind: 'exact' | 'close' | 'none'
  /** 0–100, how alike the name and the slug are. */
  score: number
}

const EXTENSION = /\.(jpe?g|png|webp|avif|heic|heif|gif|bmp|tiff?)$/i
const MIN_SIMILARITY = 0.8

/** File name without its extension(s): "a.JPG.jpeg" → "a". */
export function stripExtensions(name: string): string {
  let base = name.trim()
  while (EXTENSION.test(base)) base = base.replace(EXTENSION, '')
  return base
}

/** Lowercase letters and digits only. */
export function compact(name: string): string {
  return stripExtensions(name)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/**
 * The ways a file name is compared: as written, and without a copy suffix such as " (1)",
 * "-copy", "_2". Both are tried, because a real name may end in a number too ("pipe-20",
 * "LED panel 60x60"); the slugs themselves are never shortened.
 */
export function fileKeys(name: string): string[] {
  const base = stripExtensions(name)
  // One suffix at most: "PPR pipe 20 (3)" → "PPR pipe 20", never "PPR pipe".
  const variants = [base, base.replace(/\s*\(\d+\)$/, ''), base.replace(/[-_\s]+(copy|\d{1,2})$/i, '')]
  return [...new Set(variants.map(compact))].filter(Boolean)
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = temp
    }
  }
  return 1 - row[b.length] / Math.max(a.length, b.length)
}

export function matchFile(file: string, targets: MatchTarget[]): Match {
  const base = stripExtensions(file)
  const exact = targets.find((t) => t.slug === base)
  if (exact) return { file, target: exact, kind: 'exact', score: 100 }

  const keys = fileKeys(file)
  for (const key of keys) {
    const same = targets.find((t) => compact(t.slug) === key || compact(t.categorySlug + t.slug) === key)
    if (same) return { file, target: same, kind: 'close', score: 100 }
  }

  let best: MatchTarget | null = null
  let bestScore = 0
  for (const t of targets) {
    const score = Math.max(...keys.flatMap((key) => [similarity(key, compact(t.slug)), similarity(key, compact(t.categorySlug + t.slug))]), 0)
    if (score > bestScore) [best, bestScore] = [t, score]
  }
  return bestScore >= MIN_SIMILARITY
    ? { file, target: best, kind: 'close', score: Math.round(bestScore * 100) }
    : { file, target: null, kind: 'none', score: Math.round(bestScore * 100) }
}

export const matchFiles = (files: string[], targets: MatchTarget[]) => files.map((f) => matchFile(f, targets))

/** Service ids chosen for more than one file (the owner must pick one before confirming). */
export function duplicateTargets(chosen: (string | null)[]): Set<string> {
  const seen = new Set<string>()
  const twice = new Set<string>()
  for (const id of chosen) if (id) (seen.has(id) ? twice : seen).add(id)
  return twice
}
