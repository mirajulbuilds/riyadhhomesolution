# Riyadh Home Solution — Website Build Brief (for Claude Code)

Read this whole file before writing code. Build in the phases listed in section 14 and stop for review after each phase.

---

## 1. What this is

**Riyadh Home Solution** (Arabic: **رياض هوم سوليوشن**) is the online presence of an existing hardware & home-maintenance shop in **Ghirnatah (غرناطة), Riyadh**, open since **1999**. It is NOT a separate company or brand identity — it is simply the shop's website.

The shop:
- Sells sanitary, plumbing, electrical, lighting items and some building materials (retail).
- Has **10+ own technicians** (not outsourced) who do home services, using parts from the shop's own stock.
- Main services: **Plumbing, Electrical** (Google Ads will target these first), then **CCTV / Intercom / Network**. Minor: Painting, Tiles, Cleaning.

**Goal of the site:** generate calls and WhatsApp leads from Google Ads and Google search. It is an **information + lead site only** — no online selling, no cart, no prices anywhere. Every price question goes to WhatsApp ("السعر عبر واتساب" / "Price on WhatsApp").

**Main competitor reference:** njik.sa (app-based, outsourced workers). Our differentiators to repeat across the site:
1. Our own technicians (فنيون من فريقنا)
2. Parts in stock at our shop — job done in one visit (القطع متوفرة في محلنا)
3. Since 1999, same building in Ghirnatah for 20+ years (منذ 1999)
4. Emergency service anytime (خدمة طوارئ على مدار الساعة)
5. Price confirmed on WhatsApp before work starts

Do NOT show any commercial licence / CR / legal-entity information anywhere for now.

---

## 2. Business data (single source of truth — store in `settings` table, seed with these values)

| Field | Value |
|---|---|
| Brand (AR) | رياض هوم سوليوشن |
| Brand (EN) | Riyadh Home Solution |
| Phone / WhatsApp | 0500569163 → international `+966500569163`, wa.me number `966500569163` |
| Address (AR) | شارع أبي جعفر المنصور، حي غرناطة، الرياض 13242 |
| Address (EN) | Abi Jafar Al Mansour St, Ghirnatah, Riyadh 13242 |
| Plus code | QPWX+2JM Riyadh |
| Google Maps link | https://maps.app.goo.gl/DU7jN7hfts3gSaf66 |
| Hours | Sat–Thu 08:00–23:30, Fri 12:30–23:30 |
| Emergency | 24/7 (always available) |
| Since | 1999 (26+ years); 20+ years in the current building |
| Technicians | 10+ |
| Service areas | Ghirnatah غرناطة, Qurtubah قرطبة, Ash Shuhada الشهداء, Al Hamra الحمراء, Al Yarmuk اليرموك, Al Falah الفلاح, Al Izdihar الازدهار, At Taawun التعاون, Al Wadi الوادي — "and nearby districts; farther areas depending on the job" |
| Social | Facebook, Instagram, TikTok, Snapchat — URLs empty for now; hide each icon until its URL is filled in admin |
| Email | none shown on the site |

**Brand-name rule:** inside Arabic text always write **رياض هوم سوليوشن**; inside English text write **Riyadh Home Solution**. The logo image stays in English in both languages.

---

## 3. Tech stack & hosting (all free tiers)

- **Vite + React + TypeScript + Tailwind CSS + React Router.**
- **Static pre-rendering is required** for SEO and Google Ads landing-page speed: every public route must ship as real HTML. Use `vite-react-ssg` (or an equivalent prerender approach). Dynamic content (services, products, gallery, approved reviews, settings) is fetched from Supabase **at build time** and baked into the HTML. Reviews and gallery may also refresh client-side after hydration.
- **Supabase** (free): Postgres, Auth (admin login only), Storage (images). Row Level Security on every table.
- **Hosting: Cloudflare Pages**, connected to the GitHub repo, auto-deploy on push. Build command `npm run build`, output `dist`.
- **Publishing content changes:** admin has a **"Publish changes / نشر التعديلات"** button that calls a Supabase Edge Function, which calls a **Cloudflare Pages Deploy Hook** (URL stored as a secret, never in the frontend). Show the rebuild status ("will be live in ~2–3 minutes").
- **Keep-alive:** a GitHub Action runs weekly and makes one lightweight Supabase request so the free project doesn't pause.
- Domain `riyadhhomesolution.com` (registered at Hostinger) will be pointed to Cloudflare — no code needed, but add `public/_redirects` for `www` → apex and trailing-slash consistency.

Environment variables (`.env.example` with comments):
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GTM_ID`, `VITE_SITE_URL=https://riyadhhomesolution.com`, `GOOGLE_PLACES_API_KEY` (edge function secret only), `GOOGLE_PLACE_ID`, `CF_DEPLOY_HOOK_URL` (edge function secret only).

---

## 4. Languages, URLs, direction

- **Arabic is the default** at the root, RTL: `/`, `/services/plumbing`, …
- **English** under `/en`, LTR: `/en`, `/en/services/plumbing`, …
- Same English slugs in both languages.
- Language switcher in the header goes to the same page in the other language.
- `hreflang` (`ar-SA`, `en`, `x-default` → Arabic), self-canonical on every page.
- All layout must mirror correctly in RTL (use logical CSS properties: `ms-`, `me-`, `ps-`, `pe-`, `start`, `end`). Animations that move horizontally must move in the reading direction.

---

## 5. Design system (keep the approved demo look — light, clean, Navy + Orange)

The approved demo is: white header with the **colour logo**, a **Navy hero**, light grey page background, white rounded cards, orange accents. Do not switch to a full dark site.

**Colours (CSS variables + Tailwind theme):**
- `--navy: #0B2545` (primary, headings, hero background)
- `--navy-deep: #071A33` (footer)
- `--orange: #F28C28` (accent, primary CTA background — use **navy text** on orange buttons for contrast)
- `--orange-text: #C4610A` (orange for text/links on white — meets contrast)
- `--sky: #3BA3D9` (plumbing/water accents)
- `--bg: #F7F8FA`, `--line: #E3E8EF`, `--ink: #1F2937`, `--muted: #4B5563`
- `--wa: #0F7A4B` (WhatsApp buttons, white text)

**Type:** Arabic `IBM Plex Sans Arabic` (400/500/600/700), English `Manrope` (500–800). Self-host the font files (no external font request blocking render), `font-display: swap`.

**Shape:** cards radius 18–22px, buttons 12px, chips pill. Soft shadows only on hover. Inline SVG icons (Lucide-style strokes) — no emoji in the UI.

**Logo:** use the provided files in `/brand` (copy into `public/brand/`):
- Header: `RHS-logo-horizontal-color.svg`
- Footer / dark backgrounds: `RHS-logo-horizontal-reversed.svg`
- Favicon / app icon / OG fallback: `RHS-logo-icon-color.svg` and `RHS-social-avatar.png`
The logo mark is "RHS": navy R and S, the H is an orange house (roof + two walls) with a wrench as the crossbar. For the intro animation, rebuild the mark as inline SVG with separate groups (R, S, walls, roof, wrench) — the path data is in the SVG files.

---

## 6. Pages

### Public (both languages)
1. **Home** — sections in this order:
   - Header (logo, nav: Home, Services, Our Work, Reviews, About, Contact; language switch; Call button)
   - **Hero story** (see section 8) with H1, sub-line, WhatsApp + Call CTAs, and a trust row: «منذ 1999» · «+10 فنيين» · «طوارئ 24/7» · «القطع من محلنا»
   - Service categories: 3 large cards (Plumbing, Electrical, CCTV/Intercom/Network) + 3 small (Painting, Tiles, Cleaning)
   - Why us (4 points from section 1)
   - How we work (4 steps: WhatsApp us → we confirm price & time → technician arrives with parts → we finish and test)
   - Our work (latest 6 gallery photos → link to gallery)
   - Reviews (Google rating badge + approved reviews carousel + "Write a review on Google" button)
   - Service areas (chips + simplified map + "farther areas on request" note)
   - FAQ (5 general questions)
   - Final CTA band (orange) + footer
2. **Services hub** `/services` — all categories.
3. **Category page** `/services/:category` — **njik-style layout**:
   - Breadcrumb; hero card (title, short description, WhatsApp + Call buttons instead of app-store buttons, category illustration)
   - Trust strip (own technicians · parts in stock · price on WhatsApp)
   - "Areas we cover" chips
   - "About the service" + "What it covers" side-by-side cards
   - **Service grid**: card = image, name, one-line description, "Price on WhatsApp" tag, **WhatsApp** button (pre-filled with that service), **Call** button, and "Details →" only if the service has a detail page
   - Last card: "Didn't find your service? Describe it to us" → general WhatsApp message
   - Category FAQ (FAQPage schema)
   - These pages are the **Google Ads landing pages** for Plumbing and Electrical — make them the fastest, cleanest pages on the site.
4. **Service detail** `/services/:category/:service` (only where `has_detail_page = true`): breadcrumb, H1, image, badges ("Parts in stock", "Price on WhatsApp"), description, sizes/options block (optional), what's included / not included, parts we stock (no brand names), 4-step process, FAQ, related services, a preview box showing the exact WhatsApp message, sticky mobile CTA bar.
5. **Our Work (gallery)** `/our-work` — filterable by category, lightbox, optional before/after pairs (slider), area + date labels.
6. **Reviews** `/reviews` — Google rating summary (from Places API) + Google reviews + approved site reviews + **submit review form** (name, area, service, star rating 1–5, text, optional photo). Honeypot + simple rate limit. On submit: "Thanks — your review will appear after approval."
7. **Products** `/products` — catalog by category, **no prices, no brand names, no cart**. Each item: image, name, short spec text, "Ask on WhatsApp" button (pre-filled with product name).
8. **About** `/about` — story (section 9), numbers (since 1999, 20+ years same building, 10+ technicians, 9+ areas), shop & team cards, **"Where we are"** block with embedded Google Map, address, hours, "Get directions" button (Maps link), service areas.
9. **Contact** `/contact` — 3 big cards (WhatsApp / Call / Visit the shop), **"Request a visit" form** (name, district select, service select, description) that composes a WhatsApp message and opens wa.me (no backend needed), embedded map, address, hours, social icons.
10. **Privacy Policy** `/privacy` — plain language: what the forms collect, used only to reply, not sold, contact via WhatsApp to delete. Arabic + English.
11. **404** with links to main categories.

Every page: mobile **sticky bottom bar** (WhatsApp + Call) on screens < 768px; header WhatsApp button with a gentle pulse.

### Admin `/admin` (Arabic + English toggle, mobile-friendly — owner will use it from his phone)
- Login with email + password (Supabase Auth). Only users listed in an `admins` table can access. No public sign-up.
- **Dashboard:** counts (pending reviews, services, gallery photos), "Publish changes" button with last-publish time.
- **Categories & Services:** create / edit / delete / reorder (drag), all fields from section 10, image upload, toggle `is_active`, `has_detail_page`, `featured`.
- **Products:** categories + items CRUD, image upload.
- **Gallery:** multi-photo upload from phone camera roll, category, district, caption (AR/EN), optional before/after pairing, reorder, delete.
- **Reviews:** tabs Pending / Approved / Rejected; approve, reject, edit typos, delete. **Add review manually** with a required `source` field (WhatsApp message / in person / phone / other) and an internal note. Show a short notice in the form: "Only add real reviews from real customers, with their permission."
- **Settings:** phone, WhatsApp number, hours, emergency text, service areas, social URLs, story text (AR/EN), Google Place ID.
- **Image handling:** compress client-side before upload (max 1600px, WebP, ~80% quality) and generate a 600px thumbnail. Store in Supabase Storage buckets `services`, `products`, `gallery`, `reviews`, `site`.

---

## 7. WhatsApp & Call behaviour (core conversion feature)

- WhatsApp link: `https://wa.me/966500569163?text=<encodeURIComponent(message)>`
- Call link: `tel:+966500569163`
- Message template, Arabic page:
  ```
  السلام عليكم، أحتاج خدمة: {service_name_ar}
  الحي: 
  الوقت المناسب: 
  — من موقع رياض هوم سوليوشن {tag}
  ```
- English page:
  ```
  Hi, I need: {service_name_en}
  Area: 
  Preferred time: 
  — from the Riyadh Home Solution website {tag}
  ```
- Spotlight-type services may add `Size: ` and `How many: ` lines (field `wa_extra_lines` per service).
- **Lead source tag:** on landing, read `gclid`, `gbraid`, `wbraid`, `utm_source`, `utm_medium`, `utm_campaign` and keep them in `sessionStorage`. `{tag}` = `(WEB-AD)` if any click ID or `utm_medium=cpc` is present, otherwise `(WEB)`.
- Products use: `السلام عليكم، أسأل عن: {product_name_ar}` / `Hi, I'd like to ask about: {product_name_en}`.

---

## 8. Animation spec

Libraries: **GSAP + ScrollTrigger** (lazy-loaded after first paint), **Lenis** smooth scroll on desktop pointer devices only. Animate only `transform` and `opacity`. All content must be present in the HTML and readable without JS.

### 8.1 Logo intro (Home only)
- Sequence (≤ 1.2 s total): walls rise from the bottom → roof drops in with a small bounce → wrench spins into place → R and S slide in from the sides → curtain lifts to reveal the page.
- **Skip the intro** when: the visit has `gclid`/`gbraid`/`wbraid` or `utm_medium=cpc` (ad traffic must see content instantly), the visitor already saw it this session, or `prefers-reduced-motion`.
- The intro must never delay LCP: render the page underneath, the intro is an overlay.

### 8.2 Hero story (the "movie")
Keep the **light, approved design**: Navy hero section, the scene is a **bright, visible room illustration** (not dark). Build the scene as a layered inline SVG in flat-illustration style (bathroom/kitchen corner: ceiling with spotlights, vanity + tap, wall socket, CCTV camera, window).

Scenes:
0. **Problem (on load, no scroll needed):** the room is normally lit, but **one faulty ceiling light keeps flickering** irregularly (on/off flashes, like a bad bulb), and the tap drips. Copy: H1 «صيانة منزلك بثقة — القطع متوفرة والفني جاهز».
1. **Technician arrives:** a **technician character walks in** from the reading-start side **carrying an orange toolbox** — navy uniform with the small RHS logo, orange accents. Build him as an SVG character with separate limbs and animate a **walk cycle** (legs/arms swing, slight body bob), then he stops and sets the toolbox down. Copy: «فنيّنا يصل ومعه القطع من محلنا».
2. **Electrical:** the technician reaches up, the flickering light stops flickering and turns steadily on, then all spotlights glow with soft light cones. Copy: Electrical summary.
3. **Plumbing:** tap handle turns, dripping stops, a green check pops above the basin. Copy: Plumbing summary.
4. **CCTV:** camera LED turns red, camera pans, a soft scan beam sweeps. Copy: CCTV/Intercom summary.
5. **Done:** technician gives a thumbs-up / closes the toolbox; CTA buttons appear (WhatsApp + Call).

**Desktop (≥ 1024px):** the hero section is pinned and scrubbed by scroll (~400% scroll length), with progress dots. Scrolling back reverses the story.

**Mobile/tablet (< 1024px):** do **not** pin. Play the same sequence as a **time-based autoplay** (≈ 8 s) when the hero is in view, loop once, with a small "replay" button. Text steps cross-fade under the scene. This must work on iOS Safari and Android Chrome — test both (common failure: pinned scroll inside in-app browsers).

**Reduced motion:** show scene 5 state with a simple fade; flicker disabled.

### 8.3 Rest of the site
- Section headings and cards: staggered fade-up on enter (once).
- Category cards: subtle 3D tilt on hover (desktop), icon micro-animations (water drop bobs, bolt flashes, camera pans).
- "How we work": a line draws across the 4 steps as you scroll, a small service van drives along it (in reading direction), each step lights up as reached.
- Numbers (since 1999, 10+, 9+ areas) count up on enter.
- Service-area chips and map pins drop in with a bounce; a radar pulse from the shop pin.
- Buttons: press scale (0.97) + ripple from the click point. Header WhatsApp button: gentle pulse ring.
- Header becomes solid with a light blur after scrolling 40px.
- Page transitions: short fade/slide (≤ 250 ms).
- Gallery: images fade/scale in as they load; lightbox zoom.

---

## 9. Copy that must be used (Arabic master; write matching English)

**Hero H1:** صيانة منزلك بثقة — القطع متوفرة والفني جاهز
**Hero sub:** سباكة، كهرباء، وكاميرات مراقبة — من محلنا في غرناطة إلى بيتك، منذ 1999.

**About / story:**
> منذ عام 1999 ونحن نخدم بيوت الرياض.
> بدأنا محلًا لمواد السباكة والكهرباء، ومنذ أكثر من عشرين عامًا ونحن في نفس المبنى في حي غرناطة. مع الوقت صار عملاؤنا يطلبون منّا تركيب ما يشترونه، فكوّنّا فريقًا من أكثر من 10 فنيين يعملون معنا يوميًا.
> اليوم نجمع الاثنين: القطعة من محلنا، والفني من فريقنا — وخدمة الطوارئ متاحة على مدار الساعة.

For all other text (service descriptions, FAQs, category intros): write **original** short, clear Arabic (Modern Standard, friendly Saudi-market tone) and matching English. Do not copy text from njik.sa or any competitor. Keep descriptions specific (what is done, what's included), 1 sentence on cards, 2–4 short paragraphs on detail pages. Mark every generated Arabic string with a `// review-ar` comment in the seed file so a native speaker can review it.

---

## 10. Database schema (Supabase)

Write SQL migrations in `supabase/migrations/`. Enable RLS everywhere: public `select` only on active/approved rows; all writes only for authenticated admins (check `auth.uid()` in `admins`).

- `admins(user_id uuid pk references auth.users)`
- `settings(key text pk, value jsonb)`
- `categories(id, slug unique, name_ar, name_en, intro_ar, intro_en, covers_ar text[], covers_en text[], icon, image_url, sort_order, is_active, is_primary)`
- `services(id, category_id fk, slug, name_ar, name_en, short_ar, short_en, body_ar, body_en, includes_ar text[], includes_en text[], excludes_ar text[], excludes_en text[], options_ar text[], options_en text[], parts_in_stock bool, wa_extra_lines_ar text, wa_extra_lines_en text, image_url, faq jsonb, has_detail_page bool, featured bool, sort_order, is_active, updated_at)` — unique (category_id, slug)
- `product_categories(id, slug, name_ar, name_en, sort_order, is_active)`
- `products(id, category_id fk, name_ar, name_en, spec_ar, spec_en, image_url, sort_order, is_active)`
- `gallery(id, category_id fk null, district, caption_ar, caption_en, image_url, thumb_url, before_image_url null, taken_on date, sort_order, is_active)`
- `reviews(id, name, district, service_text, rating int 1–5, body, photo_url, source text check in ('website','whatsapp','in_person','phone','other'), status text check in ('pending','approved','rejected') default 'pending', admin_note, created_at)` — anonymous users may **insert** only with `status='pending'` and `source='website'`.
- `google_reviews_cache(id, payload jsonb, fetched_at)` — filled by an Edge Function `refresh-google-reviews` (Google Places API, Place Details with `rating`, `userRatingCount`, `reviews`), scheduled daily. Display Google reviews with the reviewer name, photo and Google attribution as required by Google's terms; link "See all reviews on Google". "Write a review" button: `https://search.google.com/local/writereview?placeid={PLACE_ID}`.
- Edge Function `publish-site`: admin-only, POSTs to `CF_DEPLOY_HOOK_URL`.

Seed file with all categories and services from section 11.

---

## 11. Categories & services (seed data)

Slugs in kebab-case English. ★ = `has_detail_page = true` at launch (ads-priority pages). All others show as cards only.

### Plumbing — السباكة (`plumbing`, primary)
1. ★ تركيب سخان جديد — New water heater installation
2. ★ تركيب سخان مخفي جديد — New concealed water heater installation
3. ★ فك وتركيب سخان — Water heater replacement
4. فك وتركيب سخان مخفي — Concealed water heater replacement
5. تغيير ثرموستات (رداد) السخان — Water heater thermostat replacement
6. تغيير قلب (سخّان) السخان — Water heater element replacement
7. ★ تغيير خلاط — Mixer tap replacement
8. تغيير شطاف — Bidet sprayer replacement
9. تغيير سماعة دش — Shower head replacement
10. تغيير محبس زاوية مع لي — Angle valve & hose replacement
11. تغيير هراب مغسلة (عادي أو كوري) — Basin waste replacement (standard or Korean)
12. ★ تسليك انسداد الحوض والمغسلة — Sink & basin blockage clearing
13. ★ تسليك انسداد الصرف — Drain blockage clearing
14. تغيير عوامة الخزان — Tank float valve replacement
15. فك أو تركيب دينمو (مضخة) — Water pump install / removal
16. فك أو تركيب غطاس — Submersible pump install / removal
17. تغيير غطاء كرسي إفرنجي — Toilet seat cover replacement
18. فك وتركيب كرسي إفرنجي — Western toilet installation / replacement
19. فك أو تركيب كرسي عربي — Squat toilet installation / removal
20. تركيب أو تغيير سيفون عربي — Squat toilet cistern installation / replacement
21. تركيب مغسلة — Basin installation
22. تركيب مغسلة دولاب — Vanity basin installation
23. تركيب مغسلة دولاب مزدوجة — Double vanity installation
24. تركيب مروش مع خلاط — Shower set with mixer installation
25. تركيب كابينة استحمام — Shower cabin installation
26. تركيب صفاية أرضية — Floor drain installation
27. تركيب وتمديد غسالة — Washing machine connection & extension

### Electrical — الكهرباء والإنارة (`electrical`, primary)
1. ★ تركيب وتغيير سبوت لايت — Spotlight installation & replacement — options: small, medium and large; all common sizes from about 7 cm to 20 cm; new installation with gypsum cut-out or replacement. `wa_extra_lines`: Size / How many.
2. ★ تركيب وتغيير بانيل سطحي — Surface panel light installation & replacement — round or square, small to large.
3. ★ تغيير وتركيب اللمبات — Light bulb change & installation — round, long and all LED bulb types.
4. ★ تركيب أو تغيير فيش — Socket installation / replacement
5. تركيب أو تغيير مفتاح مكيف أو سخان — AC or water heater switch installation / replacement
6. تركيب أو تغيير شفاط — Exhaust fan installation / replacement
7. تغيير جرس الباب — Doorbell replacement
8. ★ تغيير مفتاح الطبلون الرئيسي — Main panel breaker replacement
9. تغيير مفتاح طبلون فرعي — Sub-panel breaker replacement
10. تغيير إنارة الجدران والأسطح الخارجية — Outdoor wall & surface light replacement
11. تركيب شريط ليد مخفي (بالمتر) — Hidden LED strip installation (per meter)
12. تركيب ثريا صغيرة — Small chandelier installation
13. تركيب ثريا كبيرة — Large chandelier installation
14. تركيب إنارة شوارع وأعمدة — Street & pole light installation — on a wall or small pole, all wattages.
15. تركيب كشاف جداري — Wall flood light installation
16. تمديد كهرباء غسالة أو نشافة — Washer / dryer power point
17. ★ فحص الطبلون الكهربائي — Electrical panel inspection & fault finding
18. تركيب طبلون كهرباء داخلي — Indoor electrical panel installation

### CCTV, Intercom & Network — الكاميرات والإنتركم والشبكات (`cctv-intercom-network`, primary)
All brands — "according to the customer's choice" (حسب اختيار العميل). No brand list.
1. ★ تركيب كاميرات مراقبة جديدة — New CCTV camera installation
2. تغيير واستبدال الكاميرات — CCTV camera replacement
3. ★ تركيب كاميرا الباب — Door camera installation
4. تركيب إنتركم جديد — New intercom installation
5. ★ إصلاح الإنتركم — Intercom repair
6. تغيير الإنتركم — Intercom replacement
7. فحص ضعف الشبكة — Weak network check
8. تركيب الراوتر ومقويات الشبكة — Router & Wi-Fi extender setup
9. تمديد كابلات الشبكة — Network cabling
10. تركيب أجهزة الواي فاي — Wi-Fi device installation
11. تركيب أنظمة التلفزيون — TV system installation
12. تركيب أنظمة السماعات — Speaker system installation
13. تركيب السنترال — Central (PBX) system installation
14. تركيب أنظمة ذوي الاحتياجات الخاصة — Special-needs assistance system installation

### Painting — الدهانات (`painting`)
1. دهانات داخلية — Interior painting
2. دهانات خارجية — Exterior painting

### Tiles — البلاط (`tiles`) — no sizes mentioned
1. تركيب بلاط أرضيات جديد — New floor tile installation
2. تكسير البلاط القديم وتركيب بلاط أرضيات جديد — Old floor tile removal & new installation
3. تركيب بلاط جدران المطبخ والحمام — Kitchen & bathroom wall tile installation
4. تكسير بلاط الجدران القديم وتركيب جديد — Old wall tile removal & new installation

### Cleaning — التنظيف (`cleaning`)
1. تنظيف الخزان الأرضي والعلوي — Ground & roof water tank cleaning
2. تنظيف شقة أو فيلا جديدة غير مفروشة — New unfurnished apartment / villa cleaning
3. تنظيف شقة مفروشة — Furnished apartment cleaning
4. نظافة عامة — General cleaning
5. إزالة بقع الدهان من الأرضيات — Paint stain removal from floors
6. إزالة غراء الموكيت — Carpet glue removal

Every category also ends with the card «لم تجد خدمتك؟ صفها لنا» / "Didn't find your service? Describe it to us".

### Product categories (seed, no brands, no prices)
أدوات صحية وسباكة · خلاطات ومغاسل · سخانات · مفاتيح وأفياش وطبلونات · إنارة (سبوت، بانيل، لمبات، كشافات وإنارة شوارع) · كاميرات وإنتركم · مواد بناء — owner adds items from admin.

---

## 12. Google Ads, tracking & speed (must-haves)

**Tracking (Google Tag Manager only — never hard-code GA4 or Ads tags):**
- Load GTM from `VITE_GTM_ID` after first paint.
- Push these `dataLayer` events with parameters `{ language, page_type, category, service, link_location }`:
  - `whatsapp_click` (every WhatsApp link/button, including the contact form submit)
  - `call_click` (every `tel:` link)
  - `directions_click` (Maps link)
  - `review_submit`
  - `contact_form_submit`
- Persist click IDs/UTMs in `sessionStorage` (see section 7).
- Write `TRACKING_SETUP.md` explaining, step by step for a non-developer, how to create in GTM: GA4 Configuration tag, GA4 event tags for the 5 events, Google Ads Conversion Linker, and Google Ads conversion tags for `whatsapp_click`, `call_click`, `directions_click`.

**Landing-page quality (Plumbing & Electrical category pages are the ad destinations):**
- H1 and first paragraph must contain the service + Riyadh/area words (e.g. «سباك في الرياض — غرناطة والأحياء المجاورة»).
- WhatsApp + Call visible above the fold on mobile without scrolling.
- No intro animation, no scroll-jacking on these pages.
- Clear address, hours and phone on every page (footer) + Privacy Policy link.

**Performance budget (mobile, 4G):** LCP < 2.5 s, CLS < 0.1, INP < 200 ms. Initial JS < 170 KB gzipped (GSAP/Lenis lazy-loaded). All images AVIF/WebP with width/height set, `loading="lazy"` below the fold, hero image/illustration preloaded. Run Lighthouse on the plumbing category page and home page and report scores at the end of each phase.

---

## 13. SEO

- Unique `<title>` and meta description per page and language (Arabic ≤ 60/155 chars).
- JSON-LD: `HomeAndConstructionBusiness` on all pages (name, alternateName (Arabic), url, logo, image, telephone, address, geo from the plus code location, openingHoursSpecification, areaServed list, sameAs when socials exist, foundingDate 1999). `Service` on detail pages, `BreadcrumbList`, `FAQPage` where FAQs exist. **Do not** add `aggregateRating` from site reviews (self-serving review markup).
- `sitemap.xml` (both languages, with hreflang alternates) and `robots.txt` generated at build. Disallow `/admin`.
- Open Graph + Twitter cards per page (generate OG images from the logo + page title at build, or use a branded default).
- No auto-generated area pages for now (avoid thin/duplicate content).

---

## 14. Build phases (stop after each phase, show me what changed, run the site locally)

1. **Foundation:** project setup, Tailwind theme, fonts, routing (AR/EN), layout (header, footer, sticky mobile bar), Supabase client, migrations + seed, static pre-rendering working for all routes, WhatsApp/Call link helper with message templates and lead tag.
2. **Public pages:** Home (without the story animation yet — static scene), Services hub, Category pages, Service detail, Products, Our Work, Reviews (incl. submit form), About (with map), Contact (with request form), Privacy, 404. Both languages.
3. **Admin panel:** auth, all CRUD screens, image compression + upload, reviews moderation, settings, "Publish changes" edge function.
4. **Animations:** logo intro, hero story (desktop pinned + mobile autoplay), technician SVG character with walk cycle, all section animations from 8.3. Test on a real phone.
5. **Tracking, SEO & polish:** GTM + dataLayer events, JSON-LD, sitemap/robots, OG tags, Google reviews edge function + cron, keep-alive GitHub Action, Lighthouse pass, accessibility pass (focus states, alt text, contrast, keyboard), `README.md` and `TRACKING_SETUP.md` written for a non-developer.

At the end, list anything the owner still has to provide (GTM ID, Place ID, Supabase keys, deploy hook, social URLs, real photos).
