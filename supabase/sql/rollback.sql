-- rollback.sql: returns to the old open state instantly. Policies can stay.

alter table public.products  disable row level security;
alter table public.purchases disable row level security;
alter table public.users     disable row level security;
alter table public.app_notes disable row level security;
grant all on public.products, public.purchases, public.users, public.app_notes to anon;
-- policies can stay; they do nothing while RLS is disabled.
