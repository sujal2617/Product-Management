-- 001_prep.sql: additive and idempotent. Safe to run while RLS is OFF; changes no behaviour.
-- Nothing here deletes data.
-- Note: users.role for Prashant is already 'user' (checked), so no role fix is needed.
-- Check before running: products.id type. If it is uuid, change bigint to uuid in admin_delete_product (2 places).
-- Check before running: select phone, count(*) from public.users group by phone having count(*) > 1;  (must be 0 rows)

-- Helper: current user's Firebase uid
create or replace function public.current_uid()
returns text language sql stable as $$ select auth.jwt() ->> 'sub' $$;
revoke all on function public.current_uid() from public;
revoke execute on function public.current_uid() from anon;
grant execute on function public.current_uid() to authenticated;

-- Helper: is caller an admin (reads users.role, bypasses RLS to avoid recursion)
create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from public.users
    where id = (auth.jwt() ->> 'sub') and role = 'admin'
  )
$$;
revoke all on function public.is_admin() from public;
revoke execute on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- Helper: has an approved users row
create or replace function public.is_member()
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (select 1 from public.users where id = (auth.jwt() ->> 'sub'))
$$;
revoke all on function public.is_member() from public;
revoke execute on function public.is_member() from anon;
grant execute on function public.is_member() to authenticated;

-- Audit columns (already exist live as text; guard only)
alter table public.products add column if not exists created_by text;
alter table public.purchases add column if not exists created_by text;

-- Data hygiene: valid role, unique phone
alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check check (role in ('user','admin'));
create unique index if not exists users_phone_key on public.users (phone);
create unique index if not exists users_email_key on public.users (lower(email));

-- Phone login: returns ONLY the email for one exact phone.
create or replace function public.login_email_for_phone(p_phone text)
returns text language sql stable security definer
set search_path = public as $$
  select email from public.users where phone = btrim(p_phone) limit 1
$$;
revoke all on function public.login_email_for_phone(text) from public;
grant execute on function public.login_email_for_phone(text) to anon, authenticated;

-- Safe product delete: one transaction, admin only (backlog #5)
create or replace function public.admin_delete_product(p_id bigint)  -- change type to match products.id
returns void language plpgsql security definer
set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  delete from public.purchases where product_id = p_id;
  delete from public.products  where id = p_id;
end $$;
revoke all on function public.admin_delete_product(bigint) from public;
revoke execute on function public.admin_delete_product(bigint) from anon;
grant execute on function public.admin_delete_product(bigint) to authenticated;
