import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { createLogger, defineConfig, loadEnv, type Logger } from 'vite'
import { checkAdminPath, redact } from './path-rules.ts'

/*
 * The admin panel is its own Vite app (admin/), built into dist/<ADMIN_PATH>/ by admin/build.ts
 * after the public site. The public build (../vite.config.ts) never imports anything from here.
 *
 * ADMIN_PATH has no VITE_ prefix, so Vite never exposes it to browser code; it is only used here
 * as the base URL. `npm run dev:admin` serves the panel at http://localhost:5174/<ADMIN_PATH>/.
 */

const projectRoot = fileURLToPath(new URL('..', import.meta.url))

/** Vite's logger with the secret path masked (build output lists file paths). */
function maskedLogger(path: string): Logger {
  const logger = createLogger()
  return {
    info: (msg, options) => logger.info(redact(msg, path), options),
    warn: (msg, options) => logger.warn(redact(msg, path), options),
    warnOnce: (msg, options) => logger.warnOnce(redact(msg, path), options),
    error: (msg, options) => logger.error(redact(msg, path), options),
    clearScreen: (type) => logger.clearScreen(type),
    hasErrorLogged: (error) => logger.hasErrorLogged(error),
    get hasWarned() {
      return logger.hasWarned
    },
    set hasWarned(value) {
      logger.hasWarned = value
    },
  }
}

export default defineConfig(({ mode }) => {
  const check = checkAdminPath(loadEnv(mode, projectRoot, '').ADMIN_PATH)
  if (!check.ok) throw new Error(`Admin panel: ${check.reason}`)

  return {
    root: fileURLToPath(new URL('.', import.meta.url)),
    base: `/${check.path}/`,
    envDir: projectRoot,
    publicDir: false,
    customLogger: maskedLogger(check.path),
    clearScreen: false,
    plugins: [react(), tailwindcss()],
    build: {
      outDir: fileURLToPath(new URL(`../dist/${check.path}`, import.meta.url)),
      emptyOutDir: true,
      sourcemap: false,
      // One file for the whole panel (~140 kB gzipped, mostly React + supabase-js), cached after
      // the first visit; splitting it would only add round trips on a phone.
      chunkSizeWarningLimit: 650,
    },
    server: { port: 5174, strictPort: true },
  }
})
