-- Reviews: a phone number for verification (required on website reviews, optional on reviews an
-- admin adds by hand), never readable by visitors, and one review per phone per 30 days.

alter table public.reviews
  add column phone text
    constraint reviews_phone_e164 check (phone ~ '^\+[1-9][0-9]{8,14}$');

alter table public.reviews
  add constraint reviews_website_phone_required check (source <> 'website' or phone is not null);

create index reviews_phone_created_idx on public.reviews (phone, created_at desc) where phone is not null;

-- Visitors may SUBMIT a phone number but never read it: the public key keeps its column-level
-- SELECT grant on the public columns only (phone, admin_note, source, status and client_hash
-- stay private).
grant insert (phone) on public.reviews to anon;

-- Reading: the public key sees approved rows; signed-in users see rows only if they are admins.
-- (Before, any signed-in user could read approved rows with every column — this keeps phone and
-- admin_note private even if anonymous sign-ins or sign-ups are ever switched on.)
drop policy "reviews: read approved" on public.reviews;
create policy "reviews: public read approved" on public.reviews
  for select to anon using (status = 'approved');
create policy "reviews: admin read" on public.reviews
  for select to authenticated using ((select private.is_admin()));

-- Rate limits for website submissions: 1 per phone per 30 days, 3 per connection per hour,
-- 30 per hour overall. Admin inserts (manual reviews) are not limited.
create or replace function public.reviews_rate_limit()
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
  if new.source <> 'website' or private.is_admin() then
    return new;
  end if;

  if new.phone is not null then
    select count(*) into recent
    from public.reviews
    where phone = new.phone and created_at > now() - interval '30 days';
    if recent >= 1 then
      raise exception 'A review from this phone number was already received in the last 30 days.'
        using errcode = 'P0001', hint = 'phone_rate_limited';
    end if;
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

revoke all on function public.reviews_rate_limit() from public, anon, authenticated;
