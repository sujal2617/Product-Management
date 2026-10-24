# DP backlog

Priority: **P0** data at risk now · **P1** wrong data or crashes · **P2** daily annoyances · **P3** polish.
Source: code audit on 2026-10-24 (read-only, not yet tested on a device). Tick items as they merge.

## What we want

- [ ] Only logged-in shop users can see or change data; only admins can delete.
- [ ] Every product and purchase shows, with correct numbers.
- [ ] The app never loses purchase history by accident.
- [ ] Works the same on iOS and Android.
- [ ] _Sujal: add new features you want here._

## P0: data at risk now

| # | Issue | Where | Fix |
|---|---|---|---|
| 1 | RLS is off: anyone with the public anon key can read, edit or delete every table | `lib/supabase.js`, Supabase | Supabase third-party auth with Firebase, RLS policies on all 4 tables |
| 2 | Anyone can make themselves admin (client sends `role`) | `RegisterScreen.js:87-118` | Role set server-side only; users can't change it |
| 3 | Admin email hard-coded; registering it first makes you admin | `RegisterScreen.js:90-96` | Remove; set admin in DB; require email verification |
| 4 | Phone login lets anyone list all users' emails and phones | `LoginScreen.js:83-96` | Server-side lookup function; no open read on `users` |
| 5 | Product delete wipes purchases first, no error checks → history lost if 2nd step fails | `AdminScreen.js:107-123` | One DB transaction (cascade or RPC), check errors |
| 6 | Admin checks only hide buttons; any user can edit any purchase or the shared note | ProductDetail, Profile, Notes, App.js | Enforced by RLS from #1 |

## P1: wrong data or crashes

| # | Issue | Where | Fix |
|---|---|---|---|
| 7 | **Likely ~328 products missing**: DB has 1,328 but Supabase returns max 1,000 per request | `ProductsScreen.js:42-47`, `AdminScreen.js` | Server-side search + paging |
| 8 | Quantity/price not validated; can save empty or NaN; stored 0 blocks editing | AddPurchase, EditPurchase | Validate numbers, number keyboards |
| 9 | Edit purchase crashes on save if date is missing | `EditPurchaseScreen.js:~97` | Fallback date |
| 10 | Double tap on Save creates duplicates | all save buttons | Disable while saving |
| 11 | Product detail shows old name after edit | `ProductDetailScreen.js:44` | Refetch on focus |
| 12 | Registration half-fails → account stuck (Firebase yes, profile no) | `RegisterScreen.js:84-130` | Create profile on first login if missing |
| 13 | Duplicate phone numbers break phone login | `users.phone` | Unique constraint + format check |
| 14 | Duplicate-product check treats `%` `_` as wildcards; racy | `AddProductScreen.js:48-56` | Unique index on `lower(name)` |

## P2: daily annoyances

| # | Issue | Fix |
|---|---|---|
| 15 | Failed loads look like empty lists (no loading or error state) | Loading, error, retry, pull-to-refresh |
| 16 | Keyboard covers fields on add/edit screens (iOS) | `KeyboardAvoidingView` |
| 17 | Android date picker may stay stuck open | `display="default"` on Android, test on device |
| 18 | Success alert appears after screen already went back (Android) | Navigate on OK |
| 19 | Repeated taps open the same product screen several times | `navigate` instead of `push` |
| 20 | Debug `console.log`s leak data in production | Remove |

## P3: polish

| # | Issue | Fix |
|---|---|---|
| 21 | ~15 hard-coded colors outside `theme.js` | Use theme tokens |
| 22 | "Dark mode" is light only | Real dark palette or drop it |
| 23 | Icon buttons have no screen-reader labels; small touch targets | Labels, 44px targets |
| 24 | Unused deps `react-native-modern-datepicker`, `react-native-vector-icons` | Remove |
| 25 | Purchase list nested inside ScrollView (slow with long history) | Single FlatList |

## Order of work

1. P0 #1-#4, #6 together (one RLS change), then #5.
2. P1 #7 (missing products), then #8-#10, then the rest.
3. P2, then P3.
