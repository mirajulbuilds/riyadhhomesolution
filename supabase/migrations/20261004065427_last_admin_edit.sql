-- Phase 3, step 2: remember when content was last changed, for the dashboard's
-- "Unpublished changes" indicator (the Publish button arrives in step 4 and will store last_publish).
--
-- Row-level triggers on the admin-edited tables write settings.last_admin_edit = now(). Row-level,
-- not statement-level: an update that RLS filters down to 0 rows (non-admin, password-only or
-- logged-out session) fires no row trigger, so it cannot touch the timestamp. SECURITY DEFINER
-- because settings is only writable by admins; nobody can call the function directly.

create or replace function private.touch_last_admin_edit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.settings (key, value) values ('last_admin_edit', to_jsonb(now()))
  on conflict (key) do update set value = excluded.value;
  return null;
end;
$$;

revoke all on function private.touch_last_admin_edit() from public, anon, authenticated;

create trigger categories_last_admin_edit
  after insert or update or delete on public.categories
  for each row execute function private.touch_last_admin_edit();

create trigger services_last_admin_edit
  after insert or update or delete on public.services
  for each row execute function private.touch_last_admin_edit();
