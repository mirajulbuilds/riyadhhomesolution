# Riyadh Home Solution — website

Website for **رياض هوم سوليوشن / Riyadh Home Solution**, the hardware & home-maintenance shop in
Ghirnatah, Riyadh. Information + lead site: every call to action goes to WhatsApp or a phone call.
The full brief is in [PROJECT_BRIEF.md](PROJECT_BRIEF.md).

> **Owner:** start with [How to use the admin](#how-to-use-the-admin) (no developer knowledge
> needed). The full owner guide is finished in Phase 5. The rest of this file is the developer
> quick start.

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

**The database enforces it** (migrations `20261003200448_admin_requires_mfa.sql` and
`20261004060233_admin_requires_live_session.sql`): every admin rule (all changes, hidden rows, the
private review fields `phone` and `admin_note`, uploads) needs an admins-table account, a session
confirmed with the authenticator code (`aal2`), **and** that session must still exist. A
password-only session can do no more than a visitor, and a device that logged out is refused at
once, even though its last token has not expired yet. Public pages read exactly what they read before.

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
- press "Log out everywhere" on any device (every other device loses admin access in the database
  immediately; its screen switches to the login page the next time the tab is opened or the login
  renews);
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

## Phase 3 progress

| Step | What | Status |
|---|---|---|
| 1 | Secure foundation: secret admin path, password + authenticator, database rule (aal2 + live session) | Done |
| 2 | Dashboard, categories, services, single + bulk photo upload | Done |
| 3 | Gallery, products, reviews | Done |
| 4 | Settings + "Publish changes" button (Edge Function → Cloudflare deploy hook) | Done (hook secret still to set) |

### Step 2: what the panel does

The panel has five pages (a bottom bar on phones, links in the header on wide screens): Home,
Categories, Services, Photos, Security. Saved changes go straight into the database (the database
rules check every write); the public website shows them after the next build/publish.

- **Home:** number of services, active services, services without a photo, and services with a
  detail page but no long description (tap a number to see those services). "Unpublished changes"
  appears when content changed after the last publish: database triggers store the time of every
  change to categories or services in `settings.last_admin_edit` (migration
  `20261004065427_last_admin_edit.sql`). The Publish button works since step 4 (see below).
- **Categories:** the 6 categories (no add/delete). Drag (computer) or the arrows (phone) to
  reorder. Edit: names, intro, "services covered" lists, WhatsApp message, order number, shown,
  main category, illustration (upload a new one, or go back to the original
  `/illustrations/<slug>.png`).
- **Services:** grouped by category, with search and filters (category, shown/hidden, photo,
  detail page / long text missing). Reorder inside a category with drag or arrows (when no search
  or filter is active). Create, edit, delete (asks first). Every field of the `services` table,
  including the lists (add / remove / move rows) and the questions and answers. The web address
  (slug) is made from the English name, can be edited, and must be unique inside the category.
  Turning on "detail page" with an empty long description shows a warning but still saves.
- **Photos (one service):** add, replace or remove on the service page. The photo is compressed
  in the browser (max 1600 px, WebP ~80 %, JPEG on Safari) plus a 600 px thumbnail.
- **Photos (bulk):** drop many files on the Photos page. Each file name is matched to a service
  slug: exact first (`mixer-tap-replacement.jpg`), then ignoring case, `_`, `-`, spaces,
  extensions, copy numbers like ` (1)` and an optional category prefix, then the most similar slug
  (80 % or more alike, so typos still match). Change any match or pick a service for unmatched
  files; the current photo is shown next to the new one. Nothing is uploaded until **Confirm**;
  two files for the same service must be resolved first. Progress is shown, a failed file does not
  stop the others, and failures are listed at the end.

**Photo storage** (public bucket `services`): `<service id>/<stamp>.webp` (shown on the site via
`services.image_url`) and `<service id>/<stamp>-thumb.webp` (600 px; same name + `-thumb`).
Category illustrations: `categories/<category id>/<stamp>.webp`. The new URL is saved first and the
folder's old files are deleted afterwards, so replacing, removing or deleting never leaves files
behind, and a failed save keeps the old photo. The panel's security header allows images from the
Supabase project for these previews.

### Step 3: gallery, products, reviews

**Navigation.** Phones and tablets (under 1024 px) have a bottom bar: Home, Reviews, Our work,
Services, More (Products, Categories, Photos, Security). Wide screens show every page in the
header. The Reviews link shows an orange count while reviews are waiting, and the Home page has a
"Reviews waiting for approval" card that opens them.

- **Our work (gallery):** pick or drop many photos at once. Each is compressed in the browser
  (1600 px WebP ~80 % + 600 px thumbnail) and uploaded one after the other with a progress bar; a
  failed file never stops the others and is listed at the end. A file the browser cannot open
  (an iPhone HEIC photo in Chrome) is named in a clear message and nothing is uploaded for it
  (iPhones normally hand Safari a JPEG, so this is rare there). Optional category, district and
  date can be set for the whole upload; new photos go to the top. List with thumbnails, filters
  (category, shown/hidden, district), drag (computer) or arrows (phone) to reorder. Edit: category,
  district (one of the service areas or typed), captions AR/EN, date, shown, order number, replace
  the photo. **Before / after:** upload a "before" photo, or pick one of the other uploaded photos
  as the "before" (it moves into the pair and stops being a separate photo). Pairs show both
  halves and a "Before / After" badge. Delete asks first and deletes the photo's files.
- **Products:** product categories (create, rename, web address, order, shown, delete) and
  products (category, names, short spec AR/EN, shown, order, photo with the same compression and
  clean-up as services). No prices and no brands. A category that still has products cannot be
  deleted (the button is disabled and says why; the database refuses it too). **Bulk photos:** the
  Photos page has a Services / Products switch; products are matched by their English name made
  into a web address ("LED Panel 60×60" → `led-panel-60-60`) with the same rules and results table
  as services, and nothing changes until Confirm. Names that end in a number ("PPR pipe 20") are
  matched correctly; only the file name's copy number such as ` (2)` is ignored.
- **Reviews:** Pending / Approved / Rejected tabs with counts, newest first. Each card shows name,
  district, service, stars, text, photo, date, source and the customer's phone with **Call**
  (`tel:`) and **Open WhatsApp** (`wa.me` with a short neutral message, Arabic unless the review is
  written in English). "N other reviews from this number" appears when the same phone (stored in
  one standard format, +9665…) is on other reviews; tap it to see them all. Approve, Reject, Back
  to pending, Edit text (typo fixes + internal note) and Delete (asks first). **Add review**
  saves a review you got on WhatsApp, in person, by phone or elsewhere (source required; phone,
  photo and internal note optional) as approved, under the notice "Only add real reviews from real
  customers, with their permission."

**Review privacy and photos** (migration `20261004073958_gallery_products_reviews_admin.sql`):

- Customers' photos stay in the **private** `reviews` bucket (`pending/…` from the website,
  `manual/<review id>/…` from Add review); the path is kept in `reviews.photo_path`.
- **Approve** copies the photo (and thumbnail, if any) to the public `site` bucket at
  `reviews/<review id>/…` and stores that address in `photo_url`. Reject, Back to pending and Delete
  remove the public copy; Delete also deletes the private original. The database refuses a
  `photo_url` on any review that is not approved, so an unapproved photo is never public.
- **Edit text** keeps the customer's own words: the first edit copies them to `original_body`
  (a database trigger; it can never be overwritten). The card shows "Text edited" and the original.
- The website form is unchanged. A database trigger moves the photo path it sends into
  `photo_path` and ignores anything else a visitor might send (another folder, an outside link).
- The public key still reads only name, district, service, stars, text, the approved photo's
  address and the date of **approved** reviews. Phone, source, internal note, status, private
  photo path and original text are refused to the public key, and password-only or non-admin
  sessions read no reviews at all (tested).
- Saved changes to gallery, product categories, products and reviews update "Unpublished changes"
  (`last_admin_edit`); a visitor sending a review does not.

**Storage.** Gallery: bucket `gallery`, `<photo id>/<stamp>.webp` + `-thumb`, and
`before-<stamp>.webp` + `-thumb` for the "before" photo. Products: bucket `products`,
`<product id>/<stamp>.webp` + `-thumb`. Every delete or replace lists the folder again afterwards
and retries, so no file is left behind; if it still fails the panel says so.

### Step 4: settings and "Publish changes"

**Settings** (More → Settings on a phone). One form, one Save button; the database rules check every
write. Each field is checked before saving and a wrong one is marked in red: phone and WhatsApp
(Saudi mobile `05…`, landline `011…` or `+` and a country code; stored as shown `0500569163`, as
`+966500569163` for calls and as `966500569163` for `wa.me`), opening hours (time pickers), years
and counts (whole numbers), map positions (`lat, lng` inside the Riyadh area, latitude first), social
links (empty, or `https://` on that network's own domain) and the Google Place ID. Under a field
being edited the panel shows the value saved now; when a saved value differs from the original
(seed) value it shows the original with a **Use original** button. Groups:

| Group | Settings keys | Where the website shows it |
|---|---|---|
| Phone and WhatsApp | `phone_display`, `phone_e164`, `whatsapp_number`, `emergency` | Header/footer/contact, every Call and WhatsApp button, JSON-LD |
| Opening hours | `hours` (Sat–Thu, Fri), `hours_note` (new, optional) | Footer, Contact, About, JSON-LD `openingHoursSpecification` |
| Numbers | `since_year`, `years_in_building`, `technicians`, `areas_count` (new; 0 = number of areas) | Trust row, About numbers, JSON-LD `foundingDate` |
| Service areas | `service_areas` (names, map position; add / edit / remove / reorder), `service_areas_note` | Area chips + map, district lists of the website forms, JSON-LD `areaServed` |
| Shop location | `shop_lat`, `shop_lng` (**Use the verified location** restores 24.7950505, 46.7489991) | Map pin, Get directions, JSON-LD `geo` |
| Social links | `social` (empty = icon hidden) | Footer + Contact icons, JSON-LD `sameAs` |
| Our story | `story` (paragraphs separated by an empty line) | About |
| About photos | `site_images` (saved at once; bucket `site`, `about/shop/` and `about/team/`, full + 600 px thumb; replace/remove deletes the old files) | About shop and team cards |
| Google reviews | `google_place_id` | "Write a review on Google" and "See all reviews" links |

A new area gets a fixed code from its English name (`al-nakheel`), which gallery photos and reviews
store; renaming an area keeps its code. Removing an area that photos or reviews use asks first and
says how many. Tested: every field above changes the built pages (one build with test values, then
restored). **Not editable in the panel** (fixed in code or seed): brand names, street address,
plus code, Maps short link, the home FAQ, and texts that mention "1999", "20+ years" or "10+" in
sentences (hero sub-line, meta descriptions, "Why us", the FAQ answers). Change those in
`src/i18n/strings.ts` / `src/content/seed/` if the numbers change.

**"Unpublished changes"** (migration `20261007050858_settings_edits_and_publish.sql`): saving any
setting now updates `last_admin_edit` too (row triggers; the bookkeeping keys `last_admin_edit`,
`last_publish`, `publish_lock` are excluded, and saving an unchanged value does not count).

**Publish changes** (Home). The button is disabled when nothing changed, shows *Publishing…* while
it runs, then *it will be live in about 2–3 minutes*, and stays disabled for 60 seconds (the database
refuses a second publish within 60 s too, even from another phone). Flow:

1. The panel calls the Edge Function `supabase/functions/publish-site` with the owner's login.
2. The function checks the token (signature and expiry), `aal = aal2` and a session id, then calls
   `publish_claim()` **with the owner's own token**, so the database applies the usual admin rule
   (admins table + aal2 + live session). Anything else gets 401/403 with no details. Deployed with
   `verify_jwt = false` (see `supabase/config.toml`) because the function checks the token itself.
3. It calls the Cloudflare deploy hook stored in the secret `CF_DEPLOY_HOOK_URL` (never sent to the
   browser, never logged). Success → `publish_finish()` saves `last_publish` = the time of the click,
   so a change saved while the publish runs is newer and keeps "Unpublished changes" on. Failure →
   the 60-second slot is freed so the owner can try again at once.
4. Messages: not set up yet (no hook secret), no connection, Cloudflare refused (with its code),
   login ended / no access, wait N seconds.
5. **Live check:** the admin build writes `assets/build.json` (build time) inside the panel folder
   (not on the public site). After a publish the Home screen reads it every 20 s and says *The new
   version is live* once a build newer than the click is served (or asks to check Cloudflare after
   15 minutes). Cloudflare's own deployment API is not used: it would need an API token.

Tested live with throwaway users (all deleted): settings saved, read back and timed (17 keys); bad
phone/URL/time/coordinates refused; password-only, non-admin and public-key sessions cannot write
settings or claim a publish; About photos replaced and removed with no files left; the function
refuses no token, the public key, a garbage token, a password-only token, a non-admin token and a
logged-out token, and accepts a real admin (503 "not configured" until the hook secret exists);
with a mock hook: success, cooldown, refused, network error, edit during publish, two clicks at the
same moment (one publish).

## Publishing setup (Cloudflare deploy hook)

Do this once the Cloudflare Pages project exists. Never paste the hook URL into a chat, an email,
the code or `.env.local`: it lets anyone start builds.

1. **Cloudflare:** dashboard → **Workers & Pages** → your Pages project → **Settings** →
   **Build** (called "Builds & deployments" on older screens) → **Deploy hooks** → **Add deploy
   hook**. Name `admin-publish`, branch `main` → **Save**. Copy the URL it shows
   (`https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/…`).
2. **Supabase:** dashboard → project **riyadhhomesolution** → **Edge Functions** (left menu) →
   **Secrets** → **Add new secret**. Name: `CF_DEPLOY_HOOK_URL`, value: paste the URL → **Save**.
   No redeploy is needed.
3. **Check:** in the panel change any small thing, press **Publish changes** on Home. Cloudflare →
   your project → **Deployments** shows a new build started by the deploy hook; the panel says
   *The new version is live* when it is done.
4. If the URL ever leaks: delete that hook in Cloudflare, add a new one and replace the secret.

## How to use the admin

The panel is in English or Arabic (button at the top). On a phone, add it to the Home Screen
(Share → Add to Home Screen) and always open it from that icon.

- **Log in:** open the panel's private address (saved in your bookmarks or on the Home Screen), type
  your email and password, then the 6-digit code from Google Authenticator.
- **Add or edit a service:** **Services** → the category → **New service** (or tap a service).
  Fill the Arabic and English names and short text (the rest is optional) → **Save**. Switch
  **Shown on the website** off to hide a service without deleting it.
- **Photos:** on a service, product or gallery item tap **Add photo** / **Replace photo**; the panel
  makes the photo smaller before uploading. For many service photos at once: **More → Photos**,
  pick the files (named like the service, e.g. `mixer-tap-replacement.jpg`), check the matches,
  then **Confirm**. Work photos: **Our work → Add photos**.
- **Approve a review:** **Reviews** (the orange number shows how many are waiting) → **Pending** →
  read it → **Approve** (it goes on the website after the next publish) or **Reject**. You can call or
  WhatsApp the customer from the card.
- **Business details:** **More → Settings**: phone, WhatsApp, hours, numbers, areas, social links,
  story, About photos, Google Place ID → **Save**.
- **Publish:** nothing you save is on the website until you publish. **Home → Publish changes**;
  the site updates in about 2–3 minutes. The button is grey when there is nothing new to publish
  and for one minute after a publish.
- **Lost or new phone:** see [If I lose my authenticator phone](#if-i-lose-my-authenticator-phone)
  above. If the phone was stolen, also sign in on a computer and press **Security → Log out
  everywhere**, then remove the lost phone's authenticator on the same page.

## Phase 3 (admin panel) — notes

- **Reviews:** repeat numbers are allowed — never block them (done in step 3: badge only).
- **Settings:** done in step 4 (`shop_lat` / `shop_lng` editable with a "verified location" reset;
  saves update `last_admin_edit`). Phase 5's `refresh-google-reviews` function should read
  `settings.google_place_id` (editable in the panel) rather than only the `GOOGLE_PLACE_ID` secret.
- **Later (public site):** phone service cards could use the 600 px `-thumb` photo instead of the
  full one. Approved review photos now have a public address in `reviews.photo_url` if the
  reviews page should show them.
- **Edge Functions** used by admin features (`publish-site`, …) must refuse tokens without the
  authenticator code: verify the JWT, require the claim `aal` = `aal2`, a row in `public.admins`
  and a live session (`session_id` claim present in `auth.sessions`) — the same rule as
  `private.is_admin()`.
- **New admin pages** must be one URL segment (`<ADMIN_PATH>/reviews`; use `?id=` for details),
  because the deep-link rule matches one segment so it never catches the panel's own files.

## Cloudflare Pages

Build command `npm run build`, output directory `dist`, Node 20+. Add the `VITE_*` variables
from `.env.example` in the Pages project settings, plus `ADMIN_PATH` (the same value as in your
`.env.local`; without it the site deploys with no admin panel). `www` → apex needs a Redirect
Rule in the Cloudflare dashboard (see the note in `public/_redirects`).
