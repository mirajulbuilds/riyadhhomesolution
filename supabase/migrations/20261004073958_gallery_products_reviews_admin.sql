-- Phase 3, step 3: gallery, products and review moderation in the admin panel.
--
-- 1. "Unpublished changes": the last_admin_edit row triggers (step 2) now also cover gallery,
--    product_categories, products and reviews. Visitors insert pending reviews, so on reviews the
--    timestamp moves only for an admin (aal2 + live session); a visitor's review never counts.
-- 2. Reviews get two admin-only columns:
--      photo_path     the customer's photo in the PRIVATE "reviews" bucket (e.g. pending/<uuid>.webp)
--      original_body  the customer's own text, kept automatically the first time an admin edits body
--    photo_url now only ever holds the PUBLIC copy (bucket "site", reviews/<review id>/…) and may be
--    set only while the review is approved (check constraint). The admin panel makes that copy on
--    approve and deletes it on reject / back to pending / delete.
-- 3. The public form keeps sending photo_url = 'reviews/pending/<file>' exactly as before. A
--    BEFORE INSERT trigger moves that path into photo_path for every non-admin insert and clears
--    photo_url, photo_path and original_body of anything else, so a visitor can never point a
--    review at another file or at an outside URL.
-- Column privileges are unchanged: the public key still reads only id, name, district,
-- service_text, rating, body, photo_url, created_at (of approved rows); phone, admin_note, source,
-- status, photo_path and original_body stay private. Password-only sessions read no reviews at all.

create or replace function private.touch_last_admin_edit_by_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_admin() then
    insert into public.settings (key, value) values ('last_admin_edit', to_jsonb(now()))
    on conflict (key) do update set value = excluded.value;
  end if;
  return null;
end;
$$;

revoke all on function private.touch_last_admin_edit_by_admin() from public, anon, authenticated;

create trigger gallery_last_admin_edit
  after insert or update or delete on public.gallery
  for each row execute function private.touch_last_admin_edit();

create trigger product_categories_last_admin_edit
  after insert or update or delete on public.product_categories
  for each row execute function private.touch_last_admin_edit();

create trigger products_last_admin_edit
  after insert or update or delete on public.products
  for each row execute function private.touch_last_admin_edit();

create trigger reviews_last_admin_edit
  after insert or update or delete on public.reviews
  for each row execute function private.touch_last_admin_edit_by_admin();

-- Reviews: private photo path + original text.
alter table public.reviews
  add column photo_path text check (char_length(photo_path) <= 200),
  add column original_body text check (char_length(original_body) <= 2000);

comment on column public.reviews.photo_path is 'Admin only. Object path in the private "reviews" bucket.';
comment on column public.reviews.original_body is 'Admin only. The customer''s text before the first admin edit.';
comment on column public.reviews.photo_url is 'Public URL of the approved copy in the "site" bucket; null unless approved.';

-- Rows from before this migration stored the private path in photo_url.
update public.reviews
set photo_path = substr(photo_url, 9), photo_url = null
where photo_url like 'reviews/%';

alter table public.reviews
  add constraint reviews_public_photo_only_when_approved check (status = 'approved' or photo_url is null);

create or replace function private.reviews_before_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not private.is_admin() then
    new.photo_path := case
      when new.photo_url ~ '^reviews/pending/[A-Za-z0-9-]{1,64}\.(webp|jpg)$' then substr(new.photo_url, 9)
    end;
    new.photo_url := null;
    new.original_body := null;
  end if;
  return new;
end;
$$;

revoke all on function private.reviews_before_insert() from public;
grant execute on function private.reviews_before_insert() to anon, authenticated;

create trigger reviews_before_insert
  before insert on public.reviews
  for each row execute function private.reviews_before_insert();

-- The first edit of the text keeps the customer's original; it can never be overwritten later.
create or replace function private.reviews_keep_original()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.original_body := coalesce(
    old.original_body,
    case when new.body is distinct from old.body then old.body end
  );
  return new;
end;
$$;

revoke all on function private.reviews_keep_original() from public;
grant execute on function private.reviews_keep_original() to authenticated;

create trigger reviews_keep_original
  before update on public.reviews
  for each row execute function private.reviews_keep_original();
