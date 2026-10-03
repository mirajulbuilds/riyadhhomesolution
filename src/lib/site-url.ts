/** Public origin without a trailing slash, e.g. https://riyadhhomesolution.com */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://riyadhhomesolution.com').replace(/\/+$/, '')

/** '/services/plumbing' → 'https://riyadhhomesolution.com/services/plumbing' */
export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
