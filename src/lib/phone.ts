/**
 * Phone numbers typed into the review form → E.164 ("+9665XXXXXXXX"), or null when invalid.
 *
 * Accepted:
 *   Saudi mobile   05XXXXXXXX · 5XXXXXXXX · 9665XXXXXXXX · +9665XXXXXXXX · 009665XXXXXXXX
 *   International  any other number written with its country code (+ or 00 optional), 9–15 digits
 * Spaces, dashes, dots and brackets are ignored, and Arabic-Indic digits (٠١٢…/۰۱۲…) are read as 0–9.
 * Must match the reviews.phone check constraint in supabase/migrations.
 */
export function normalizePhone(input: string): string | null {
  const ascii = input
    .trim()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\s\-.()‎‏‪-‮]/g, '')

  if (!/^\+?\d+$/.test(ascii)) return null
  let digits = ascii.replace(/^\+/, '')
  const hadPlus = ascii.startsWith('+')
  if (!hadPlus && digits.startsWith('00')) digits = digits.slice(2)

  // Saudi local formats
  if (!hadPlus && /^05\d{8}$/.test(digits)) return `+966${digits.slice(1)}`
  if (!hadPlus && /^5\d{8}$/.test(digits)) return `+966${digits}`

  // Saudi with country code: must be a mobile number (5 + 8 digits)
  if (digits.startsWith('966')) return /^9665\d{8}$/.test(digits) ? `+${digits}` : null

  // A local number of another country (leading 0) can't be turned into E.164 without its code
  if (digits.startsWith('0')) return null

  return /^[1-9]\d{8,14}$/.test(digits) ? `+${digits}` : null
}
