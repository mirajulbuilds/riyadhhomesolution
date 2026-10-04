-- Trigger functions run without the caller holding EXECUTE, so nobody needs it (not callable over the API).
revoke all on function private.reviews_before_insert() from public, anon, authenticated;
revoke all on function private.reviews_keep_original() from public, anon, authenticated;
