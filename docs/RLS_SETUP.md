# RLS setup (steps for Sujal)

Do these in order. The app keeps working after every step until step 9. Code defaults to the old behaviour (`USE_FIREBASE_TOKEN = false` in `lib/supabase.js`).

Never commit the files below. They live in your home folder, outside the repo.

1. Back up: `node scripts/backup.js` (RLS still off). Expect about 1328 products and 2191 purchases.
2. Firebase console > Project settings > Service accounts > Generate new private key. Save as `~/secrets/dp-firebase-admin.json`.
3. Supabase dashboard > Project Settings > API: copy the `service_role` key.
4. Create `~/.dp-secrets.env` (then `chmod 600 ~/.dp-secrets.env`):
   ```
   FIREBASE_SERVICE_ACCOUNT=/Users/sujal/secrets/dp-firebase-admin.json
   SUPABASE_SERVICE_ROLE_KEY=<service_role key>
   ```
5. Supabase dashboard > Authentication > Sign In / Up (Third-Party Auth) > Add provider > Firebase > enter your Firebase Project ID. Save. Harmless while RLS is off.
6. Supabase SQL editor: run the duplicate phone check from the top of `supabase/sql/001_prep.sql`, check `products.id` type, then run the whole of `supabase/sql/001_prep.sql`.
7. Set the claim for the existing users: `node scripts/approve-user.js --all-existing`. Confirm your own row has `role = admin`.
8. In `lib/supabase.js` set `USE_FIREBASE_TOKEN = true`. Reload Expo Go, log out and in on iPhone and Android. Test with RLS still off: email login, phone login, product list (1328), admin delete of a test product.
9. Run `supabase/sql/002_enable_rls.sql` in the SQL editor. Test at once on both phones: admin can read, add, edit, delete; a normal user can read and add but not edit or delete; logged out sees nothing.
10. Rollback if anything fails: run `supabase/sql/rollback.sql` in the SQL editor. Everything returns to the old open state instantly. (If you also need the old app behaviour, set `USE_FIREBASE_TOKEN = false`.)

## Security notes

- After approving users, `chmod 600 ~/secrets/dp-firebase-admin.json` or delete the downloaded Firebase admin JSON.
- Before running 002, run this in the SQL editor and confirm one row with role = admin (replace the uid with your Firebase uid from Firebase console > Authentication):
  `select id, email, role from public.users where id = '<your Firebase uid>' and role = 'admin';`
  If it returns nothing, you would lock yourself out of admin actions.
- Phone login lookup (`login_email_for_phone`) is open to anon and can be brute-forced to find emails for phone numbers. Accepted risk: owner decided to keep phone login.
- `rollback.sql` reopens all data publicly. Emergencies only.

## Approving a new person later

They register in the app (Firebase account only, no data). Then:

```
node scripts/approve-user.js their@email.com
node scripts/approve-user.js their@email.com --admin --name "Name" --phone 9999999999
```

It asks for name and phone if you leave them out, sets the claim and creates the `users` row. They log in again to see data.

## Backups after RLS

`node scripts/backup.js` uses the service role key from `~/.dp-secrets.env` and fails if any table returns 0 rows.
