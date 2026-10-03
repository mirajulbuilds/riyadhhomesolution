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
npm run dev            # http://localhost:5173 (server-rendered, like production)
npm run build          # static HTML for every page in dist/, plus the admin panel (see Phase 3)
npm run preview        # serves dist/ at http://localhost:4173
npm run preview:pages  # serves dist/ exactly like Cloudflare Pages (rules, headers, 404s) at http://localhost:8788
npm run dev:admin      # admin panel dev server at http://localhost:5174/<ADMIN_PATH>/
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
| `admin/` | The admin panel: a separate app, built into `dist/<ADMIN_PATH>/` by `admin/build.ts`. Nothing in `src/` imports it. |
| `supabase/migrations/` | Database schema with Row Level Security. |
| `supabase/seed.sql` | Generated — run `npm run seed:sql` after editing `src/content/seed/`. |
| `public/_redirects`, `public/_headers` | Cloudflare Pages redirect and header rules. The build appends the admin panel's rules to the copies in `dist/`. |

## Database

```bash
npx supabase login                                   # once, opens the browser
npx supabase link --project-ref <project-ref>        # once
npx supabase db push --include-seed                  # apply migrations + seed
```

The seed only inserts rows that don't exist yet, so it never overwrites edits made in the admin panel.

## Phase 3, step 1: secure admin foundation

The admin panel lives at a secret address, **the admin path (`ADMIN_PATH`)**. The value is kept in
`.env.local` on your computer and in the Cloudflare Pages environment variables. It is never written
in the code, the docs or git, and the build masks it in its output.

**How it is built.** `npm run build` first builds the public site, then `admin/build.ts` builds the
panel as its own app into `dist/<ADMIN_PATH>/` (own `index.html` and files), and adds two generated
rules (never in git): `_redirects` so links like `<ADMIN_PATH>/security` open the panel, and
`_headers` so the panel's pages are sent with `X-Robots-Tag: noindex, nofollow, noarchive`,
`Referrer-Policy: no-referrer`, `Cache-Control: no-store` and a Content-Security-Policy that only
allows the site itself and the Supabase project. The public pages, sitemap and robots.txt know
nothing about the panel, and `/admin`, `/login`, `/wp-admin`, `/dashboard` show the normal 404 page.

**Rules for `ADMIN_PATH`:** at least 10 characters, only letters, digits, `-` and `_`, and none of
`admin`, `login`, `panel`, `dashboard`, `manage`, `wp-`, `riyadh`, `rhs`, `shop`, `0500`. If it is
missing or weak, the build prints a warning and deploys the public site **without** any admin panel
(there is never a fallback such as `/admin`).

**Signing in.** Email + password, then a 6-digit code from Google Authenticator. The first time,
the panel shows a QR code and the setup key to save. Only accounts listed in the `admins` table get
in; any other account is signed out. There is no sign-up, no "forgot password" and no email link
of any kind. After 5 wrong tries the form makes you wait 30 seconds (Supabase also limits attempts).

**The database enforces it** (migration `20261003200448_admin_requires_mfa.sql`): every admin
rule (all changes, hidden rows, the private review fields `phone` and `admin_note`, uploads) needs
an admins-table account **and** a session confirmed with the authenticator code (`aal2`). A
password-only session can do no more than a visitor. Public pages read exactly what they read before.

**Honest note:** the secret address is only an extra layer that keeps bots and curious visitors
away. The real protection is the password + the authenticator code + the database rules. Someone
who learns the address still cannot get in without both.

**Staying signed in.** The login is saved in this browser and renewed automatically, so closing the
tab, reloading or coming back days later keeps you signed in; the code is asked only on a fresh
login. On a Free plan Supabase cannot end sessions early: the access token lasts 1 hour (JWT expiry
3600 s) and is renewed in the background, while "time-box sessions", "inactivity timeout" and
"single session per user" exist only on Pro plans. You must log in again when you:

- use a private/incognito window (it forgets everything when closed);
- clear the browser's data (cookies and site data);
- use another browser, phone or computer;
- press "Log out everywhere" on any device;
- use an iPhone in Safari and stay away for more than about 7 days (Safari deletes site data of
  sites you haven't visited). **Add the panel to the Home Screen** (Share → Add to Home Screen) and
  open it from that icon: it then runs as its own app and keeps its login. It has its own storage,
  so log in once inside it.

The panel shares the website's address, so any script running on the public site in the same
browser could read the saved login. Only add tags you trust in Google Tag Manager, and never paste
"Custom HTML" tags from unknown sources.

### If I lose my authenticator phone

1. **If you saved the setup key:** install Google Authenticator on the new phone, choose
   "Enter a setup key", type the key, and the codes work again. Nothing else is needed.
2. **If you added a backup phone** (Security page → "Add another authenticator"): sign in with its
   code, then remove the lost phone on the Security page and add the new one.
3. **If you have neither:** open the Supabase dashboard → SQL Editor and run this with your email:

   ```sql
   delete from auth.mfa_factors
   where user_id = (select id from auth.users where email = 'your-email@example.com');
   ```

   Then sign in to the panel with your password: it shows a new QR code. Set it up straight away,
   because until then the password alone is enough to set one up. (This was tested: the account
   could set up a new authenticator right after the delete.)

Anyone who can open your Supabase dashboard can do step 3, so protect your Supabase account with its
own two-step login (supabase.com → Account → Security).

## Phase 3 (admin panel) — notes

- **Reviews list:** on each pending review show a small badge such as "N other reviews from this
  number" (count by `reviews.phone`; index `reviews_phone_created_idx`). Repeat numbers are allowed —
  never block them. Show the phone with tap-to-call and WhatsApp buttons. Phone is optional on
  reviews the owner adds by hand.
- **Categories:** edit `wa_message_ar/en` (the WhatsApp text on the category page) and override
  `image_url` (default `/illustrations/<slug>.png`).
- **Services:** optional `wa_message_ar/en` override.
- **Settings:** `shop_lat` / `shop_lng` (map pin, directions, JSON-LD).
- **Edge Functions** used by admin features (`publish-site`, …) must refuse tokens without the
  authenticator code: verify the JWT, require the claim `aal` = `aal2` and a row in `public.admins`
  (the same rule as `private.is_admin()`).
- **New admin pages** must be one URL segment (`<ADMIN_PATH>/reviews`; use `?id=` for details),
  because the deep-link rule matches one segment so it never catches the panel's own files.

## Cloudflare Pages

Build command `npm run build`, output directory `dist`, Node 20+. Add the `VITE_*` variables
from `.env.example` in the Pages project settings, plus `ADMIN_PATH` (the same value as in your
`.env.local`; without it the site deploys with no admin panel). `www` → apex needs a Redirect
Rule in the Cloudflare dashboard (see the note in `public/_redirects`).
