-- Reviews: no submission limits.
--
-- * The per-phone rule (1 review per phone per 30 days) is removed: a customer can have two jobs
--   in one month, and the owner checks every review before it is published. Repeat numbers are
--   shown to the owner in the admin panel instead (Phase 3).
-- * The per-connection limit (3 per IP address per hour) and the site-wide cap (30 per hour) are
--   removed too: they were per IP address, not per browser, so customers sharing a mobile
--   carrier's IP could be blocked, and the site-wide cap could block real customers during a spam
--   burst. Spam can only ever reach the pending queue (status is forced to 'pending').
-- * client_hash (the salted IP hash those limits used) is no longer collected, so it is dropped.
--
-- Unchanged: phone required + E.164 check on website reviews; public inserts forced to
-- status 'pending' / source 'website' (RLS + column grants); phone, admin_note, source and status
-- unreadable with the public key.

drop trigger reviews_rate_limit on public.reviews;
drop function public.reviews_rate_limit();

drop index public.reviews_client_hash_idx;
alter table public.reviews drop column client_hash;

comment on index public.reviews_phone_created_idx is
  'Admin panel: count other reviews from the same phone number (repeat numbers are allowed).';
