-- 002_enable_rls.sql: turns RLS ON. Run only after 001, USE_FIREBASE_TOKEN=true tested, and users approved.
-- If anything breaks, run rollback.sql.

alter table public.products  enable row level security;
alter table public.purchases enable row level security;
alter table public.users     enable row level security;
alter table public.app_notes enable row level security;

-- anon gets nothing on tables (RPC login_email_for_phone stays)
revoke all on public.products, public.purchases, public.users, public.app_notes from anon;

-- products
drop policy if exists products_select on public.products;
drop policy if exists products_insert on public.products;
drop policy if exists products_update on public.products;
drop policy if exists products_delete on public.products;
create policy products_select on public.products for select to authenticated using (public.is_member());
create policy products_insert on public.products for insert to authenticated with check (public.is_member());
create policy products_update on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy products_delete on public.products for delete to authenticated using (public.is_admin());

-- purchases
drop policy if exists purchases_select on public.purchases;
drop policy if exists purchases_insert on public.purchases;
drop policy if exists purchases_update on public.purchases;
drop policy if exists purchases_delete on public.purchases;
create policy purchases_select on public.purchases for select to authenticated using (public.is_member());
create policy purchases_insert on public.purchases for insert to authenticated with check (public.is_member());
create policy purchases_update on public.purchases for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy purchases_delete on public.purchases for delete to authenticated using (public.is_admin());

-- users: own row (admin: all). No client insert. Role locked.
drop policy if exists users_select on public.users;
drop policy if exists users_insert on public.users;
drop policy if exists users_update on public.users;
drop policy if exists users_delete on public.users;
create policy users_select on public.users for select to authenticated
  using (id = public.current_uid() or public.is_admin());
create policy users_insert on public.users for insert to authenticated with check (public.is_admin());
create policy users_update on public.users for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy users_delete on public.users for delete to authenticated using (public.is_admin());

-- Column lock: admin may only change name and phone from the app. Role, email, id cannot be changed by the app.
revoke update on public.users from authenticated;
grant  update (name, phone) on public.users to authenticated;
grant  select on public.users to authenticated;
grant  insert, delete on public.users to authenticated;  -- still gated by the admin-only policies

-- app_notes: read and update the shared row only
drop policy if exists notes_select on public.app_notes;
drop policy if exists notes_update on public.app_notes;
create policy notes_select on public.app_notes for select to authenticated using (public.is_member());
create policy notes_update on public.app_notes for update to authenticated using (public.is_member()) with check (public.is_member());
revoke insert, delete on public.app_notes from authenticated;
