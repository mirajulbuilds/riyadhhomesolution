-- Riyadh Home Solution — initial schema (PROJECT_BRIEF.md §10).
--
-- Security model
--   * Row Level Security on every table.
--   * The public (anon key) can only READ active / approved rows, and can only INSERT a
--     pending website review.
--   * Every write is limited to signed-in users listed in public.admins. There is no public
--     sign-up: admins are added by hand (see the note at the end of this file).

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so policies can check admins without recursing into admins' own RLS.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Settings: one row per key (phone, hours, areas, story, ...). Values are JSON.
-- ---------------------------------------------------------------------------

create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Service categories and services
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_ar text not null,
  name_en text not null,
  -- Landing-page H1, e.g. «سباك في الرياض — غرناطة والأحياء المجاورة». Falls back to the name.
  headline_ar text,
  headline_en text,
  intro_ar text,
  intro_en text,
  meta_description_ar text,
  meta_description_en text,
  covers_ar text[] not null default '{}',
  covers_en text[] not null default '{}',
  -- [{ "q_ar", "a_ar", "q_en", "a_en" }]
  faq jsonb not null default '[]' check (jsonb_typeof(faq) = 'array'),
  icon text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_ar text not null,
  name_en text not null,
  short_ar text,
  short_en text,
  -- Paragraphs separated by a blank line.
  body_ar text,
  body_en text,
  includes_ar text[] not null default '{}',
  includes_en text[] not null default '{}',
  excludes_ar text[] not null default '{}',
  excludes_en text[] not null default '{}',
  options_ar text[] not null default '{}',
  options_en text[] not null default '{}',
  -- "Parts we stock" list on the detail page (no brand names).
  parts_ar text[] not null default '{}',
  parts_en text[] not null default '{}',
  parts_in_stock boolean not null default true,
  -- Extra WhatsApp message lines, e.g. E'المقاس: \nالعدد: '
  wa_extra_lines_ar text,
  wa_extra_lines_en text,
  image_url text,
  faq jsonb not null default '[]' check (jsonb_typeof(faq) = 'array'),
  has_detail_page boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, slug)
);

create index services_category_sort_idx on public.services (category_id, sort_order);

-- ---------------------------------------------------------------------------
-- Products (no prices, no brands)
-- ---------------------------------------------------------------------------

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_ar text not null,
  name_en text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.product_categories (id) on delete restrict,
  name_ar text not null,
  name_en text not null,
  spec_ar text,
  spec_en text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_sort_idx on public.products (category_id, sort_order);

-- ---------------------------------------------------------------------------
-- Gallery ("Our work")
-- ---------------------------------------------------------------------------

create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  -- A service-area key from settings.service_areas (e.g. 'ghirnatah'), or free text.
  district text,
  caption_ar text,
  caption_en text,
  image_url text not null,
  thumb_url text,
  -- Optional "before" photo; image_url is then the "after" photo.
  before_image_url text,
  taken_on date,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index gallery_sort_idx on public.gallery (sort_order, taken_on desc);

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  district text check (char_length(district) <= 80),
  service_text text check (char_length(service_text) <= 120),
  rating integer not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 1 and 2000),
  photo_url text,
  source text not null default 'website'
    check (source in ('website', 'whatsapp', 'in_person', 'phone', 'other')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  -- Internal only (never readable with the public key).
  admin_note text,
  -- Salted hash of the submitter's IP, used only for rate limiting. Set by trigger.
  client_hash text,
  created_at timestamptz not null default now()
);

create index reviews_status_created_idx on public.reviews (status, created_at desc);
create index reviews_client_hash_idx on public.reviews (client_hash, created_at desc) where client_hash is not null;

-- Simple rate limit for website submissions: 3 per IP per hour, 30 per hour overall.
create function public.reviews_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  headers json := nullif(current_setting('request.headers', true), '')::json;
  ip text;
  recent integer;
begin
  if new.source <> 'website' or public.is_admin() then
    return new;
  end if;

  ip := coalesce(
    headers ->> 'cf-connecting-ip',
    headers ->> 'x-real-ip',
    split_part(headers ->> 'x-forwarded-for', ',', 1)
  );
  new.client_hash := case
    when coalesce(ip, '') = '' then null
    else encode(sha256(convert_to('rhs-review:' || trim(ip), 'UTF8')), 'hex')
  end;

  if new.client_hash is not null then
    select count(*) into recent
    from public.reviews
    where client_hash = new.client_hash and created_at > now() - interval '1 hour';
    if recent >= 3 then
      raise exception 'Too many reviews from this connection. Please try again later.'
        using errcode = 'P0001', hint = 'rate_limited';
    end if;
  end if;

  select count(*) into recent
  from public.reviews
  where source = 'website' and created_at > now() - interval '1 hour';
  if recent >= 30 then
    raise exception 'Too many reviews right now. Please try again later.'
      using errcode = 'P0001', hint = 'rate_limited';
  end if;

  return new;
end;
$$;

create trigger reviews_rate_limit
before insert on public.reviews
for each row execute function public.reviews_rate_limit();

-- ---------------------------------------------------------------------------
-- Google reviews cache (written by the refresh-google-reviews Edge Function)
-- ---------------------------------------------------------------------------

create table public.google_reviews_cache (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  fetched_at timestamptz not null default now()
);

create index google_reviews_cache_fetched_idx on public.google_reviews_cache (fetched_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();
create trigger categories_touch before update on public.categories
  for each row execute function public.touch_updated_at();
create trigger services_touch before update on public.services
  for each row execute function public.touch_updated_at();
create trigger product_categories_touch before update on public.product_categories
  for each row execute function public.touch_updated_at();
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
create trigger gallery_touch before update on public.gallery
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.admins enable row level security;
alter table public.settings enable row level security;
alter table public.categories enable row level security;
alter table public.services enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.gallery enable row level security;
alter table public.reviews enable row level security;
alter table public.google_reviews_cache enable row level security;

-- admins: a signed-in user can see their own row (the admin app uses this to check access).
-- No insert/update/delete policies — admins are managed from the Supabase dashboard only.
create policy "admins: read own row" on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Public content tables: everyone reads active rows, admins read everything and write.
create policy "settings: public read" on public.settings
  for select to anon, authenticated using (true);
create policy "settings: admin insert" on public.settings
  for insert to authenticated with check ((select public.is_admin()));
create policy "settings: admin update" on public.settings
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "settings: admin delete" on public.settings
  for delete to authenticated using ((select public.is_admin()));

create policy "categories: read active" on public.categories
  for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "categories: admin insert" on public.categories
  for insert to authenticated with check ((select public.is_admin()));
create policy "categories: admin update" on public.categories
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "categories: admin delete" on public.categories
  for delete to authenticated using ((select public.is_admin()));

create policy "services: read active" on public.services
  for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "services: admin insert" on public.services
  for insert to authenticated with check ((select public.is_admin()));
create policy "services: admin update" on public.services
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "services: admin delete" on public.services
  for delete to authenticated using ((select public.is_admin()));

create policy "product_categories: read active" on public.product_categories
  for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "product_categories: admin insert" on public.product_categories
  for insert to authenticated with check ((select public.is_admin()));
create policy "product_categories: admin update" on public.product_categories
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "product_categories: admin delete" on public.product_categories
  for delete to authenticated using ((select public.is_admin()));

create policy "products: read active" on public.products
  for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "products: admin insert" on public.products
  for insert to authenticated with check ((select public.is_admin()));
create policy "products: admin update" on public.products
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "products: admin delete" on public.products
  for delete to authenticated using ((select public.is_admin()));

create policy "gallery: read active" on public.gallery
  for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "gallery: admin insert" on public.gallery
  for insert to authenticated with check ((select public.is_admin()));
create policy "gallery: admin update" on public.gallery
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "gallery: admin delete" on public.gallery
  for delete to authenticated using ((select public.is_admin()));

-- Reviews: public reads approved rows; anyone may submit a pending website review;
-- admins moderate, edit, add manual reviews and delete.
create policy "reviews: read approved" on public.reviews
  for select to anon, authenticated using (status = 'approved' or (select public.is_admin()));
create policy "reviews: public submit" on public.reviews
  for insert to anon, authenticated
  with check (status = 'pending' and source = 'website' and admin_note is null);
create policy "reviews: admin insert" on public.reviews
  for insert to authenticated with check ((select public.is_admin()));
create policy "reviews: admin update" on public.reviews
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "reviews: admin delete" on public.reviews
  for delete to authenticated using ((select public.is_admin()));

-- Column privileges: the public key may only see/submit the public columns, so
-- admin_note, source and client_hash never leave the database for anonymous visitors.
revoke all on public.reviews from anon;
grant select (id, name, district, service_text, rating, body, photo_url, created_at) on public.reviews to anon;
grant insert (name, district, service_text, rating, body, photo_url) on public.reviews to anon;

-- Google reviews: public read; only the Edge Function (service role, bypasses RLS) writes.
create policy "google_reviews_cache: public read" on public.google_reviews_cache
  for select to anon, authenticated using (true);

-- The public never needs to write these tables at all.
revoke insert, update, delete, truncate on
  public.admins, public.settings, public.categories, public.services, public.product_categories,
  public.products, public.gallery, public.google_reviews_cache
from anon;

-- ---------------------------------------------------------------------------
-- Storage buckets
--   services, products, gallery, site: PUBLIC — files are shown on the site by URL.
--   reviews: PRIVATE — visitors' unmoderated uploads. Only admins can open them; when a
--            review is approved, the admin panel copies its photo into site/reviews/.
-- Listing and all writes are admin-only (policies below).
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('services', 'services', true, 5242880, array['image/webp', 'image/jpeg', 'image/png', 'image/avif']),
  ('products', 'products', true, 5242880, array['image/webp', 'image/jpeg', 'image/png', 'image/avif']),
  ('gallery', 'gallery', true, 5242880, array['image/webp', 'image/jpeg', 'image/png', 'image/avif']),
  ('site', 'site', true, 5242880, array['image/webp', 'image/jpeg', 'image/png', 'image/avif', 'image/svg+xml']),
  -- Review photos are compressed in the browser before upload, so keep this one small.
  ('reviews', 'reviews', false, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "storage: admin read" on storage.objects
  for select to authenticated
  using (bucket_id in ('services', 'products', 'gallery', 'site', 'reviews') and (select public.is_admin()));
create policy "storage: admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('services', 'products', 'gallery', 'site', 'reviews') and (select public.is_admin()));
create policy "storage: admin update" on storage.objects
  for update to authenticated
  using (bucket_id in ('services', 'products', 'gallery', 'site', 'reviews') and (select public.is_admin()))
  with check (bucket_id in ('services', 'products', 'gallery', 'site', 'reviews') and (select public.is_admin()));
create policy "storage: admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id in ('services', 'products', 'gallery', 'site', 'reviews') and (select public.is_admin()));

-- Visitors may upload one photo with their review, into reviews/pending/ only (no overwrite,
-- no reading, no listing, no delete). It reaches the site only after an admin approves it.
create policy "storage: public review photo upload" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'reviews' and (storage.foldername(name))[1] = 'pending');

-- ---------------------------------------------------------------------------
-- Adding the first admin (run once in the SQL editor after creating the user in
-- Authentication → Users, with sign-ups disabled in Authentication → Providers → Email):
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'owner@example.com';
-- ---------------------------------------------------------------------------
