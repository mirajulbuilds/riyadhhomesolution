# Riyadh Home Solution — website

Website for **رياض هوم سوليوشن / Riyadh Home Solution**, the hardware & home-maintenance shop in
Ghirnatah, Riyadh. Information + lead site: every call to action goes to WhatsApp or a phone call.
The full brief is in [PROJECT_BRIEF.md](PROJECT_BRIEF.md).

> A step-by-step guide for the owner (no developer knowledge needed) is written in Phase 5.
> This file is the developer quick start.

## Stack

Vite + React 18 + TypeScript + Tailwind CSS 4 + React Router 6, prerendered to static HTML with
[vite-react-ssg](https://github.com/Daydreamer-riri/vite-react-ssg). Content comes from Supabase
at build time. Hosted on Cloudflare Pages.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173 (server-rendered, like production)
npm run build      # writes static HTML for every page to dist/
npm run preview    # serves dist/ at http://localhost:4173
npm run typecheck
npm run illustrations  # re-export the category illustrations after editing their SVGs
```

Without Supabase keys the site builds from the seed data in `src/content/seed/`, so it works
out of the box. To use the real database, copy `.env.example` to `.env.local` and fill in
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## How it fits together

| Path | What it is |
|---|---|
| `src/routes.tsx` | All routes. Arabic at `/`, English at `/en`, same slugs. Loaders run at build time only. |
| `src/content/server.ts` | Build-time content source: Supabase if keys are set, otherwise the seed. |
| `src/content/view.ts` | Turns bilingual rows into one-language page data. |
| `src/content/seed/` | Seed content (single source of truth for `supabase/seed.sql`). Arabic copy to review is marked `// review-ar`. |
| `src/lib/contact.ts` | WhatsApp / tel / directions / map links and the WhatsApp message texts (per page type). |
| `src/lib/lead-source.ts` | Keeps `gclid` / `gbraid` / `wbraid` / UTM tags for the session → `(WEB)` or `(WEB-AD)` in messages. |
| `src/components/layout/` | Header, footer, sticky mobile WhatsApp/Call bar. |
| `src/styles/index.css` | Brand colour tokens and the Tailwind theme. |
| `design/illustrations/` | Original category illustrations (SVG sources). `npm run illustrations` exports them to `public/illustrations/` (PNG 800/400 + WebP 800/400/200, transparent). |
| `supabase/migrations/` | Database schema with Row Level Security. |
| `supabase/seed.sql` | Generated — run `npm run seed:sql` after editing `src/content/seed/`. |
| `public/_redirects`, `public/_headers` | Cloudflare Pages redirect and header rules. |

## Database

```bash
npx supabase login                                   # once, opens the browser
npx supabase link --project-ref <project-ref>        # once
npx supabase db push --include-seed                  # apply migrations + seed
```

The seed only inserts rows that don't exist yet, so it never overwrites edits made in the admin panel.

## Phase 3 (admin panel) — notes

- **Reviews list:** on each pending review show a small badge such as "N other reviews from this
  number" (count by `reviews.phone`; index `reviews_phone_created_idx`). Repeat numbers are allowed —
  never block them. Show the phone with tap-to-call and WhatsApp buttons. Phone is optional on
  reviews the owner adds by hand.
- **Categories:** edit `wa_message_ar/en` (the WhatsApp text on the category page) and override
  `image_url` (default `/illustrations/<slug>.png`).
- **Services:** optional `wa_message_ar/en` override.
- **Settings:** `shop_lat` / `shop_lng` (map pin, directions, JSON-LD).

## Cloudflare Pages

Build command `npm run build`, output directory `dist`, Node 20+. Add the `VITE_*` variables
from `.env.example` in the Pages project settings. `www` → apex needs a Redirect Rule in the
Cloudflare dashboard (see the note in `public/_redirects`).
