import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type {} from 'vite-react-ssg/node' // adds `ssgOptions` to Vite's config type

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  ssgOptions: {
    // `/services/plumbing` → dist/services/plumbing.html. Cloudflare Pages serves it at the
    // extension-less URL, which keeps every URL without a trailing slash.
    dirStyle: 'flat',
    // 404 pages are not real routes; render them explicitly. Cloudflare serves the nearest
    // 404.html up the directory tree, so /en/... misses get the English one.
    includedRoutes: (paths) => [...paths, '/404', '/en/404'],
    // The head manager inserts <title>/<meta> right after <head>; <meta charset> must come
    // first (within the first 1024 bytes), so move it back to the top.
    onPageRendered: (_route, html) => {
      const charset = /<meta charset="UTF-8">\s*/i
      return html.replace(charset, '').replace('<head>', '<head><meta charset="UTF-8">')
    },
  },
})
