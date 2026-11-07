-- 003: stop duplicate product names and duplicate phone numbers.
-- Checked 2026-10-26: live data has 0 duplicates, so both indexes build cleanly.
-- Run in Supabase SQL Editor only after Sujal's OK and a fresh backup.
-- Undo: drop index if exists products_name_unique; drop index if exists users_phone_unique;

-- Same name ignoring case and extra spaces counts as a duplicate.
create unique index if not exists products_name_unique
  on public.products (lower(regexp_replace(btrim(name), '\s+', ' ', 'g')));

-- One account per phone number (empty phones allowed).
create unique index if not exists users_phone_unique
  on public.users (phone)
  where phone is not null and phone <> '';
