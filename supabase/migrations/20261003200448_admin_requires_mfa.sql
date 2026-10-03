-- Phase 3, step 1: admin access needs the authenticator code, enforced by the database.
--
-- Every admin RLS policy goes through private.is_admin(): all inserts/updates/deletes on the
-- content tables, settings and reviews; reading inactive rows; reading reviews with their private
-- columns (phone, admin_note, source, status); and the storage policies (uploads, the private
-- "reviews" photo bucket). It now also requires the session's authenticator assurance level to be
-- aal2, i.e. the user typed a 6-digit code from an authenticator app after the password. A
-- password-only session (aal1) gets nothing more than the public key.
--
-- Unchanged on purpose:
--   * every public read policy (active rows, approved reviews, settings, review submission);
--   * "admins: read own row": readable at aal1 so the admin app can turn a non-admin away right
--     after the password step, before any authenticator setup. It only returns the caller's row.
--
-- Edge Functions used by admin features (publish-site, ...) must apply the same rule: verify the
-- JWT, require the claim aal = 'aal2' and a row in public.admins for auth.uid().

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2'
     and exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
