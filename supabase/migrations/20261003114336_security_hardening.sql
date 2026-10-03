-- Security hardening from the Supabase security advisor.
--
-- 1. public.is_admin() was callable as /rest/v1/rpc/is_admin. It moves to a "private" schema
--    that the Data API does not expose. RLS policies reference the function internally, so they
--    keep working; anon/authenticated keep EXECUTE because policies run with the caller's rights.
-- 2. public.reviews_rate_limit() is a trigger function and was callable over the API. Triggers do
--    not need the caller to hold EXECUTE, so it is revoked from everyone. Its body now calls
--    private.is_admin().

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

alter function public.is_admin() set schema private;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated, service_role;

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
