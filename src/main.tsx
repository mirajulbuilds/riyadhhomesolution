// Self-hosted fonts. IBM Plex Sans Arabic is loaded for Arabic script only; digits and Latin text
// on Arabic pages use Manrope (one variable file, shared with the English pages) to keep the
// font download small on mobile.
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css'
import '@fontsource/ibm-plex-sans-arabic/arabic-500.css'
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css'
import '@fontsource/ibm-plex-sans-arabic/arabic-700.css'
import '@fontsource-variable/manrope/wght.css'
import './styles/index.css'

import { ViteReactSSG } from 'vite-react-ssg'
import { captureLeadParams } from './lib/lead-source'
import { routes } from './routes'

export const createRoot = ViteReactSSG(
  {
    routes,
    basename: import.meta.env.BASE_URL,
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
  ({ isClient }) => {
    // Runs before hydration, so the first WhatsApp link a visitor taps already carries the ad tag.
    if (isClient) captureLeadParams()
  },
)
