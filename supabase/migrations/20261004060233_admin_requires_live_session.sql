-- Phase 3, step 1 follow-up: logging out takes away admin access in the database at once.
--
-- An access token (JWT) stays valid until it expires (1 hour), even after "Log out" or
-- "Log out everywhere" deleted its session. private.is_admin(), used by every admin policy, now
-- also requires the token's session to still exist in auth.sessions (and not be past a
-- time-box limit, if one is ever set). A logged-out device is refused immediately.
--
-- Normal long logins are unaffected: refreshing a token keeps the same session, and the
-- authenticator step upgrades that same session to aal2, so the session_id claim stays valid
-- for as long as the browser keeps its login.
--
-- Edge Functions used by admin features must apply the same rule: verified JWT with aal = 'aal2',
-- a row in public.admins, and a live session.

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2'
     and exists (select 1 from public.admins where user_id = (select auth.uid()))
     and exists (
       select 1
       from auth.sessions
       where id = nullif((select auth.jwt() ->> 'session_id'), '')::uuid
         and user_id = (select auth.uid())
         and (not_after is null or not_after > now())
     );
$$;
