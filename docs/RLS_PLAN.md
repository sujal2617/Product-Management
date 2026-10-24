# RLS plan (backlog P0 #1 to #6)

Status: plan only. Nothing applied. Written from code reading, not from the live DB. Sujal reviews and applies.

## 0. Decisions and the free-plan answer

- Supabase "Third-Party Auth: Firebase" (official docs, `supabase.com/docs/guides/auth/third-party/firebase-auth`) needs every Firebase ID token to carry the custom claim `role: 'authenticated'`. Without it Supabase treats the caller as `anon`.
- The docs set that claim with a **blocking function** (`beforeUserCreated` / `beforeSignIn`). Those need **Firebase Authentication with Identity Platform** and Cloud Functions, which need the **Blaze (pay as you go) plan**. The free Spark plan cannot do it.
- The docs also give the other way: the **Admin SDK `setCustomUserClaims(uid, { role: 'authenticated' })`**. That runs anywhere, costs nothing, and works on Spark.
- **Chosen:** a local Node script (`scripts/approve-user.js`, to be written by builder) using the Admin SDK. Service-account JSON key lives outside the repo (e.g. `~/secrets/dp-firebase-admin.json`), never committed, never `EXPO_PUBLIC_`.
- **Trade-off, plainly:** a new person who registers in the app gets a Firebase account but **no data access** until Sujal runs the script for them (also creates their `users` row). Only 3 users today, so this is acceptable and is actually a feature (no open sign-ups). Cost to set up: about 20 minutes once, then about 1 minute per new user. Claim changes appear in the user's token only after refresh (app calls `getIdToken(true)` once after login).
- Supabase third-party auth is available on the free Supabase plan (MAU limits apply, 3 users is nothing). Not verified against the live project.
- Client: `createClient(url, anonKey, { accessToken: async () => token })`. Docs confirm the `accessToken` option; when set, `supabase.auth.*` is unavailable (the app does not use it, `persistSession:false`).

### Assumptions (change if wrong)
- `users.id` is `text` (Firebase uid is not a UUID). `users.phone` and `users.email` are text.
- Roles: `admin` and `user`. All real users are trusted shop staff.
- `purchases` and `products` have no owner column, so "edit your own purchase" cannot be enforced. Assumption: **any approved user can add and edit products and purchases; only admin deletes anything**; any approved user can read and edit the one shared `app_notes` row (it is a shared shop note); nobody can insert or delete notes from the app.
- `app_notes` has exactly one row already.

### Policy matrix (before -> after)

| Table | Read | Insert | Update | Delete |
|---|---|---|---|---|
| products | before: everyone with anon key. after: approved users | before: everyone. after: approved users | before: everyone. after: approved users | before: everyone. after: admin only (via RPC or policy) |
| purchases | same as products | approved users | approved users | admin only |
| users | before: everyone (emails and phones leak). after: own row; admin reads all | before: everyone (can self-grant admin). after: admin only (created by script, service role bypasses RLS) | before: everyone. after: own row, columns `name`, `phone` only; `role`, `email`, `id` locked | admin only |
| app_notes | before: everyone. after: approved users | nobody (service role only) | approved users | nobody |
| anon (no token) | before: all four tables full access. after: nothing, except RPC `login_email_for_phone` |  |  |  |

"Approved user" = token has `role: authenticated` AND a `users` row exists for `sub`.

## 1. Dashboard steps for Sujal (by hand)

1. Back up first: run `node scripts/backup.js` now (RLS is still off, so it gets everything). Check the file has about 1328 products and 2191 purchases. Keep it outside the repo.
2. Firebase console > Project settings > Service accounts > Generate new private key. Save the JSON to `~/secrets/dp-firebase-admin.json`. Never put it in the repo or `.env`.
3. Firebase console > Project settings: note the **Project ID**.
4. Supabase dashboard > Project Settings > API: copy the **service_role** key into a local, git-ignored file used only by the admin script and backup (not `.env` with `EXPO_PUBLIC_`).
5. In the Supabase SQL editor, run this duplicate check. It must return 0 rows, otherwise fix the phones first:
   `select phone, count(*) from public.users group by phone having count(*) > 1;`
   Also check `select id, role, email from public.users;` and confirm the 3 ids are the Firebase uids and one row is your admin.
6. Run the admin script (once builder writes it) for all 3 existing users: sets claim `role: authenticated` in Firebase. For your own uid it also confirms `users.role = 'admin'`.
7. Supabase dashboard > Authentication > Sign In / Up (or "Third-Party Auth") > Add provider > Firebase > enter the Project ID from step 3. Save. This changes nothing while RLS is off.
8. Apply migration `001_prep.sql` (additive, safe) in the SQL editor.
9. Ship the app code change (section 3) and test with RLS still OFF (checklist A).
10. Apply `002_enable_rls.sql`. Run checklist B immediately. If anything fails, run the rollback block.
11. Rotate the anon key? Not needed; it stays public by design once RLS is on.

Files to create under `supabase/migrations/` by builder or Sujal: `001_prep.sql` (parts A below) and `002_enable_rls.sql` (parts B).

## 2. SQL

### 001_prep.sql (additive, no behaviour change while RLS is off)

```sql
-- Helper: current user's Firebase uid
create or replace function public.current_uid()
returns text language sql stable as $$ select auth.jwt() ->> 'sub' $$;

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
grant execute on function public.is_admin() to authenticated;

-- Helper: has an approved users row
create or replace function public.is_member()
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (select 1 from public.users where id = (auth.jwt() ->> 'sub'))
$$;
revoke all on function public.is_member() from public;
grant execute on function public.is_member() to authenticated;

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
grant execute on function public.admin_delete_product(bigint) to authenticated;
```

If `products.id` is uuid, change `bigint` in both places. A plpgsql function body is one transaction, so a failure rolls back both deletes.

### 002_enable_rls.sql

```sql
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
create policy products_update on public.products for update to authenticated using (public.is_member()) with check (public.is_member());
create policy products_delete on public.products for delete to authenticated using (public.is_admin());

-- purchases
drop policy if exists purchases_select on public.purchases;
drop policy if exists purchases_insert on public.purchases;
drop policy if exists purchases_update on public.purchases;
drop policy if exists purchases_delete on public.purchases;
create policy purchases_select on public.purchases for select to authenticated using (public.is_member());
create policy purchases_insert on public.purchases for insert to authenticated with check (public.is_member());
create policy purchases_update on public.purchases for update to authenticated using (public.is_member()) with check (public.is_member());
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
  using (id = public.current_uid() or public.is_admin())
  with check (id = public.current_uid() or public.is_admin());
create policy users_delete on public.users for delete to authenticated using (public.is_admin());

-- Column lock: clients may only change name and phone. Role, email, id cannot be changed by the app.
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
```

Notes:
- Admin cannot change a role from the app either (column grant). Promote or demote in the SQL editor or with the service-role script. That is deliberate.
- Table grants for `authenticated` on products, purchases, app_notes already exist by Supabase default. Not verified on the live DB.
- **Phone lookup honesty:** `login_email_for_phone` is callable by anyone with the anon key. It leaks one email for one exact phone, so an attacker can test phone numbers one by one (enumeration) and there is no per-IP rate limit in SQL. Supabase gateway limits are the only brake. With 3 users the harm is small (an email address, no password). Zero-risk alternative: drop phone login and use email only (open question 2).
- Phone must be stored in the same format the user types at login. The RPC trims only; keep the app trimming and, ideally, normalising digits.

## 3. App code changes (for builder, not applied)

1. `lib/supabase.js:11-20`: import `auth` from `./firebase`. Add `accessToken: async () => { await auth.authStateReady?.(); return (await auth.currentUser?.getIdToken()) ?? null; }` as an option of `createClient`, and remove the `auth: {...}` block (not allowed together with `accessToken`). When no user is logged in the client falls back to the anon key, which now only reaches the RPC.
2. `screens/LoginScreen.js:83-96`: replace `.from('users').select('email').eq('phone', ...).single()` with `supabase.rpc('login_email_for_phone', { p_phone: loginEmail.trim() })`; `data` is the email string or null. Keep the single generic error "Incorrect phone/email or password" for both unknown phone and wrong password, to reduce enumeration. After `signInWithEmailAndPassword`, call `await auth.currentUser.getIdToken(true)` so the new claim is loaded.
3. `screens/RegisterScreen.js:87-118`: delete the role logic (`role = 'user'` and the hard-coded `sujalpattewar26@gmail.com` check at lines 90-96) and the `users` insert. After `createUserWithEmailAndPassword`, call `updateProfile(user, { displayName: name })`, then show "Account created. Ask the shop admin to approve you." and sign out. The admin script creates the `users` row (name, phone, email, role `user`).
4. `screens/AdminScreen.js:107-117`: replace the two `.delete()` calls with one `supabase.rpc('admin_delete_product', { p_id })` and check `error`. Remove the `console.log` at line 69 while there.
5. `screens/EditPurchaseScreen.js:176`: the purchase delete now only works for admin. Hide the Delete button for non-admins (read role as `ProductDetailScreen.js:70` already does) and always check `error`.
6. `screens/ProfileScreen.js` and `ProductDetailScreen.js:70` read only the user's own row: they keep working. Any write to `users` must send only `name` and `phone`.
7. `scripts/approve-user.js` (new, run on Sujal's Mac only): takes `<uid> <name> <phone> [admin]`, calls Admin SDK `setCustomUserClaims(uid, { role: 'authenticated' })`, then upserts the `users` row using the service-role key from a local env var. Reads the service account path from an env var.
8. **`scripts/backup.js` (data-loss risk):** it uses the anon key. After RLS, anon reads return an empty array with no error, so a backup would silently be empty. Change it to use the service-role key (env var not prefixed `EXPO_PUBLIC_`, never bundled in the app) and make it exit with an error if any table returns 0 rows.

## 4. Rollout (never locks Sujal out)

Order: backup -> claims for all users (harmless) -> enable Firebase provider in Supabase (harmless) -> 001 (additive) -> ship app code, RLS still off -> checklist A -> 002 -> checklist B. At every step before 002 the old app keeps working because RLS is off and the anon key still works.

Lockout guards: your admin row and claim exist before 002; the service-role key and SQL editor always bypass RLS, so rollback is always possible.

Old installed builds (without the token code) stop working at 002. If the app is installed via an EAS build and not Expo Go, ship an EAS update or build before 002 (open question 1).

### Checklist A (RLS off, new code), iOS and Android via Expo Go
- Email login works; phone login works through the RPC; wrong phone gives the generic error.
- Products list loads, all 1328 products.
- Admin delete of a test product removes it and its purchases; failure shows an error.

### Checklist B (RLS on), both platforms
- Admin: read, add and edit products, add and edit purchases, delete a test purchase and a test product, edit notes, view Profile.
- Normal user: read all, add and edit purchases, cannot delete (button hidden; forced attempt returns an error), edit Profile name and phone, cannot read other users.
- New registration: account is created, login shows no data until approved; after the script runs and re-login, data appears.
- Logged out: with the anon key only (curl or app), `products`, `purchases`, `users`, `app_notes` return `[]` or 401, `login_email_for_phone` returns one email.
- A user tries `update users set role='admin'` on their own row: fails with permission denied.
- Counts still 1328 / 2191 as admin. Run `node scripts/backup.js` with the service-role key and diff counts.

### Rollback (SQL editor, instant)
```sql
alter table public.products  disable row level security;
alter table public.purchases disable row level security;
alter table public.users     disable row level security;
alter table public.app_notes disable row level security;
grant all on public.products, public.purchases, public.users, public.app_notes to anon;
-- policies can stay; they do nothing while RLS is disabled.
```
This returns to today's open state. Then fix the issue and re-apply 002.

## 5. Open questions for Sujal

1. How does your father run the app: Expo Go, or an EAS-installed build? Installed builds need a new build or update before RLS is switched on.
2. Keep phone login (small enumeration risk, section 2) or switch to email only (zero risk)?
3. Are you happy that new sign-ups get no access until you approve them with the script (free-plan trade-off), or do you want the Blaze plan with Identity Platform for auto-approval?
4. Confirm the assumption: any approved user may add and edit products, purchases and the shared note, and only admin may delete. Should the father (if not admin) be allowed to delete purchases?

## Could not verify
- Live schema (id types, existing grants, existing policies, FKs, whether `app_notes` has one row), Supabase plan limits, current Firebase plan, and whether the Firebase provider setting accepts the project in the dashboard. Docs read from the official Supabase page only; the `security-and-hardening` skill could not be invoked in this environment (no Skill tool), so its checklist was applied from general knowledge.
