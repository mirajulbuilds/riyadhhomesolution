-- Phase 3, step 4: Settings screen + "Publish changes".
--
-- 1. "Unpublished changes" now also covers the settings table: saving any setting stores
--    settings.last_admin_edit = now(), like the content tables (step 2/3 triggers). The panel's own
--    bookkeeping keys (last_admin_edit, last_publish, publish_lock) are excluded, so the trigger
--    never fires on its own write and a publish never counts as an edit. An update that leaves
--    the value unchanged does not count either.
--
-- 2. Publishing (Edge Function publish-site). The function calls these two functions with the
--    admin's own token, so every write goes through Row Level Security (admins table + aal2 +
--    live session, private.is_admin()) exactly like the panel's other writes:
--      publish_claim()        one publish per 60 seconds (settings.publish_lock = claim time);
--      publish_finish(at, ok) ok → settings.last_publish = the claim time (the click), so an edit
--                             saved while the publish runs is newer and keeps "Unpublished
--                             changes" on; failed → frees the slot so the owner can retry at once.
--    SECURITY INVOKER: they cannot do anything the caller's own session could not do.

create trigger settings_last_admin_edit_insert
  after insert on public.settings
  for each row
  when (new.key not in ('last_admin_edit', 'last_publish', 'publish_lock'))
  execute function private.touch_last_admin_edit();

create trigger settings_last_admin_edit_update
  after update on public.settings
  for each row
  when (new.key not in ('last_admin_edit', 'last_publish', 'publish_lock') and old.value is distinct from new.value)
  execute function private.touch_last_admin_edit();

create trigger settings_last_admin_edit_delete
  after delete on public.settings
  for each row
  when (old.key not in ('last_admin_edit', 'last_publish', 'publish_lock'))
  execute function private.touch_last_admin_edit();

create function public.publish_claim()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  last_claim timestamptz;
begin
  if not private.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  -- Two clicks at the same moment: the second waits here, then sees the first one's claim.
  perform pg_advisory_xact_lock(hashtext('publish-site'));
  select (value ->> 'at')::timestamptz into last_claim from public.settings where key = 'publish_lock';
  if last_claim is not null and last_claim > now() - interval '60 seconds' then
    return jsonb_build_object(
      'ok', false,
      'retry_after', greatest(1, ceil(extract(epoch from (last_claim + interval '60 seconds' - now()))))::int
    );
  end if;
  insert into public.settings (key, value) values ('publish_lock', jsonb_build_object('at', now()))
  on conflict (key) do update set value = excluded.value;
  return jsonb_build_object('ok', true, 'at', now());
end;
$$;

create function public.publish_finish(claimed_at timestamptz, succeeded boolean)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if succeeded then
    insert into public.settings (key, value) values ('last_publish', to_jsonb(claimed_at))
    on conflict (key) do update set value = excluded.value;
  else
    delete from public.settings
    where key = 'publish_lock' and (value ->> 'at')::timestamptz = claimed_at;
  end if;
end;
$$;

revoke all on function public.publish_claim() from public, anon;
revoke all on function public.publish_finish(timestamptz, boolean) from public, anon;
grant execute on function public.publish_claim() to authenticated;
grant execute on function public.publish_finish(timestamptz, boolean) to authenticated;
