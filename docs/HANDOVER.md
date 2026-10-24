# Dady --- Product Manager / Udhar Ledger App

> Handover document for Claude Code and future development.
>
> **Important:** This README combines details known from prior project
> work with standard Expo instructions. Claude must inspect the current
> repository before changing code. The exact current `package.json`,
> lockfile, installed package versions, Firebase/Supabase configuration,
> and the precise phone-installation method must be verified locally; do
> not assume this document overrides the repository.

## 1. Project overview

**Project name:** Dady / Product Manager\
**Local project directory (Mac):**
`/Users/sujal/DATA/Dady/product-manager`\
**App type:** React Native mobile app built with Expo and JavaScript\
**Primary purpose:** Manage products and their purchase history. The
broader idea discussed recently is an **udhar/credit ledger** for the
user's father: record customer purchases/credit, track outstanding
balances, and eventually send reminders. Do not assume the
udhar/reminder workflow has already been implemented; inspect the code
and ask before adding it.

### Known Expo / app identifiers

Most recently retrieved project information (September 2026): - Expo
SDK: recorded as `57.0.20` - React: recorded as `19.2.3` - React Native:
recorded as `0.86.3` - Babel: recorded as `57.0.10` - EAS project ID:
`8ad9a9cb-defe-4351-ac35-0bcb6d8ec4c9` - iOS bundle identifier:
`com.sujal.dp` - Android package name: `com.sujal.dp` - App version was
previously `1.0.0` - `runtimeVersion` policy was previously `appVersion`

These are historical notes, not a substitute for checking the current
files. Verify `app.json`/`app.config.*`, `package.json`, and the
lockfile before building.

## 2. Core product requirements gathered so far

### Product and purchase management

-   Login screen.
-   Product list displayed as scrollable cards.
-   Add a product using a `+` button.
-   Search products from the top-right area.
-   Sort products alphabetically by product name.
-   Avoid duplicate product names.
-   Selecting a product opens its details.
-   Product details show the product name and seller in the top area.
-   Purchase history is shown as cards.
-   Selecting a purchase shows purchase price, price after transport,
    purchase date, and quantity.
-   Seller is entered on the **Add Purchase** screen, not the **Add
    Product** screen.
-   Purchase saving must work reliably.
-   Purchase date should have a calendar/date picker in mobile and web
    contexts where applicable.
-   Search should match products whose names **start with** the entered
    text, rather than matching the text anywhere in the name.
-   UI should adapt to different screen sizes and look clean on iPhone
    and Android.

### Authentication and roles

-   Login should support email or mobile number, subject to the actual
    authentication implementation.
-   Include a password visibility (eye) control.
-   Show a user-friendly message for incorrect credentials rather than
    exposing raw Firebase errors.
-   Admin-only editing for products, purchases, and users.
-   Ordinary users must not be able to edit user details or access
    admin-only actions.
-   Fix admin login, logout, session persistence, and profile-display
    issues.
-   Past issues included profile name/phone not appearing, "email
    already exists" after user records were deleted, and navigation
    actions not being handled. Verify whether these issues remain.

### Udhar/customer reminder idea --- discussed, not confirmed implemented

The user is exploring an app for their father to record amounts
customers owe. Customers may have **only a phone number and no
app/account**. The desired future behavior may include reminding
customers after a configurable number of days and showing their current
total outstanding amount.

Constraints discussed: - The customer should not be required to install
this app. - SMS APIs generally cost money and Indian business SMS has
provider/DLT requirements. - Push notifications through Firebase Cloud
Messaging only reach devices that have the app/token registered; they
cannot notify an arbitrary phone number by themselves. - WhatsApp
automation through the official Business Platform has setup,
consent/template, and potential message-cost requirements. - A phone
used as an SMS gateway is not automatically free: carrier plan terms and
applicable business-messaging rules must be checked.

**Do not promise free delivery to customers who have no app.** Before
implementing reminders, confirm the desired channel, reminder timing,
consent, and whether the customer receives a transaction-wise message or
the complete current balance.

## 3. Technology stack

Known or historically used: - **React Native + Expo** --- mobile app -
**JavaScript** - **React Navigation** --- navigation; native stack has
been used - **Firebase** --- authentication/persistence was part of the
implementation - **Supabase JS** --- also intentionally used; the user
previously wanted both Firebase and Supabase - **AsyncStorage** ---
local persistence/auth persistence support - **URL polyfill** ---
Supabase/React Native compatibility - **React Native Screens** - **React
Native Safe Area Context** - **React Native Gesture Handler** - **React
Native Reanimated** - **Expo DateTimePicker** --- date picker - **Expo
Updates** - **Expo Vector Icons** --- icons

An older package list also included `@react-navigation/native`,
`@react-navigation/native-stack`, `firebase`, `@supabase/supabase-js`,
`react-native-url-polyfill`,
`@react-native-async-storage/async-storage`, and
`@react-native-community/datetimepicker`.

The exact currently installed dependencies and versions must be read
from `package.json` and the package manager lockfile. Do not blindly
reinstall or downgrade packages based on this historical list.

### Known service/configuration detail

A Supabase URL previously used in `.env` was:
`https://fgikdszqgsbjjqrguqbz.supabase.co`

Treat this as historical configuration and verify it against the current
local `.env`/app setup. Do not expose service keys, Firebase private
credentials, or other secrets in this README, source control, logs, or
chat.

## 4. Local development setup (Mac)

### Prerequisites

-   macOS
-   Node.js and npm compatible with the Expo SDK in the repository
-   Git, if the project is version-controlled
-   Expo tooling via `npx` (a global Expo CLI is not normally required)
-   Access to the project's Firebase and Supabase configuration if the
    app uses them

Check installed versions:

``` bash
node --version
npm --version
```

### Open the project

``` bash
cd "/Users/sujal/DATA/Dady/product-manager"
```

### Install dependencies

First inspect the repository and lockfile. If the dependencies are
already installed and the project runs, do not reinstall unnecessarily.

For an npm project with a valid `package-lock.json`, use:

``` bash
npm install
```

For reproducible installation when the lockfile is valid and in sync,
prefer:

``` bash
npm ci
```

Do not delete `package-lock.json` or change Expo/React Native versions
without first inspecting the current state. Past work encountered
dependency-resolution conflicts and mismatched Expo SDK-compatible
packages.

### Start the development server

Normal launch:

``` bash
npx expo start
```

Clear Metro's cache if bundling/cache problems occur:

``` bash
npx expo start --clear
```

Equivalent short form:

``` bash
npx expo start -c
```

Useful npm scripts may include:

``` bash
npm start
npm run android
npm run ios
```

Check `package.json` before relying on a script; script names can
change.

## 5. How to open and test on phones

The project has been associated with these devices in the user's wider
device context: - **iPhone 15 Plus** - **OnePlus Nord 2 (Android)**

The exact current installation method (Expo Go versus a development
build versus an installed EAS build) was not conclusively recorded.
Follow the method that matches the repository and installed app.

### Typical Expo Go workflow (only if this project is compatible with Expo Go)

1.  Connect the Mac and phone to the same Wi-Fi network.

2.  From the project folder, run:

    ``` bash
    npx expo start
    ```

3.  A QR code should appear in the terminal/browser.

4.  On the **OnePlus Nord 2**, open Expo Go and scan the QR code, if
    Expo Go is installed and compatible.

5.  On the **iPhone 15 Plus**, use the iPhone Camera to scan the QR code
    and open it in Expo Go, if installed and compatible.

6.  Keep the development server running on the Mac while testing.

7.  Save a code change and check whether Fast Refresh updates the app.

If the phone cannot connect, ensure both devices and the Mac can reach
each other on the network. Try tunnel mode if supported by the installed
Expo tooling:

``` bash
npx expo start --tunnel
```

### If Expo Go is not compatible

Native modules, SDK changes, or app configuration may require a
**development build** instead of Expo Go. Check the repository's Expo
SDK and dependencies, then use the project's existing EAS setup. Do not
assume a development build is already installed.

Potential EAS commands (confirm configuration before use):

``` bash
npx eas-cli --version
npx eas-cli build:configure
npx eas-cli build --platform android
npx eas-cli build --platform ios
```

`build:configure` changes project configuration, so inspect files and
existing EAS setup before running it. iOS device distribution/signing
has Apple account and provisioning requirements; Android builds have
their own distribution steps. Use the existing `eas.json` profiles where
available.

### Important phone-use notes

-   Keep the Mac's Expo/Metro server running during local development.
-   A phone running the app does not imply the app is independently
    hosted; local development depends on the dev server.
-   To use a production/standalone app, install a built binary and
    configure its backend correctly.
-   Push notifications, authentication redirects, and native
    functionality may behave differently in Expo Go versus a
    development/production build.
-   The precise previous QR-code/install steps should be confirmed with
    the user or repository notes rather than presented as established
    fact.

## 6. Configuration and secrets

Before running, inspect the repository for: - `.env`, `.env.example`,
and environment-variable references - Firebase configuration files -
Supabase URL and public/anon key usage - `app.json` or `app.config.js` /
`app.config.ts` - `eas.json` - Firebase rules and Supabase RLS
policies - Authentication persistence setup

Do not commit secrets. If using Expo public environment variables
(`EXPO_PUBLIC_*`), remember that values bundled into a client app are
visible to users and must not contain server secrets. Never put
service-role keys, private service-account credentials, or privileged
database credentials in the mobile app.

Check that `.env` is ignored by Git:

``` bash
git status --short
git check-ignore .env
```

If `.env` is not ignored, correct `.gitignore` before committing
sensitive configuration.

## 7. Data and authorization design

Because Firebase and Supabase have both been used, Claude should first
map which service currently owns each responsibility. Do not create
duplicate sources of truth.

Document clearly: - Which database stores products - Which database
stores purchases - Which service handles authentication - How users are
linked to profile records - How admin privileges are determined and
enforced - Whether purchase and product edits are validated
server-side - Whether duplicate product names are blocked in the UI,
database, or both

**Security requirement:** hiding admin buttons in the UI is not
sufficient. Database rules/RLS and backend checks must prevent ordinary
users from changing products, purchases, and user records.

For the future udhar feature, a reasonable conceptual model could
include: - Customers (name, phone, optional notes) - Ledger entries
(credit/order, payment, adjustment, timestamp, creator) - A derived
outstanding balance - Reminder preferences and reminder history/status

Prefer ledger entries over storing only a manually edited balance so
that the transaction history can be audited. Do not implement this model
until it is agreed with the user and reconciled with the current schema.

## 8. Troubleshooting history

Past issues reported during development included: - npm `ERESOLVE`
dependency conflicts, including datetime picker version conflicts -
`babel-preset-expo` missing - Syntax errors in `App.js`,
`RegisterScreen.js`, `LoginScreen.js`, and `ProductsScreen.js` - React
Navigation actions such as `NAVIGATE` or `RESET` not being handled -
Admin login not working correctly - Errors after logout - User profile
name/phone details sometimes missing - "Email already exists" even after
deleting user records - Purchase save action not working -
Date-picker/calendar UI and responsive alignment issues - Expo EAS
project initialization / invalid UUID issues - An earlier period with
Metro overrides around `0.81.5` and Expo SDK/dependency mismatches

These are historical reports, not a claim that every issue still exists.
Reproduce and verify before changing anything.

General debugging sequence:

``` bash
# From project root
node --version
npm --version
npm ls --depth=0
npx expo-doctor
npx expo start --clear
```

If `expo-doctor` reports version mismatches, use the Expo SDK
compatibility guidance for the **actual SDK in the repository**. Do not
blindly run broad upgrade commands or downgrade packages without
reviewing the diff.

## 9. Installed package inventory

This README cannot reliably enumerate every package currently installed
because the live `node_modules` folder and current lockfile have not
been inspected while writing it.

Generate the exact top-level dependency inventory from the project root:

``` bash
npm ls --depth=0
```

Save a copy for handover:

``` bash
npm ls --depth=0 > installed-packages.txt 2>&1
```

List declared dependencies and scripts:

``` bash
node -e "const p=require('./package.json'); console.log(JSON.stringify({name:p.name,version:p.version,scripts:p.scripts,dependencies:p.dependencies,devDependencies:p.devDependencies},null,2))"
```

Record lockfile type:

``` bash
ls -1 package.json package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null
```

`npm ls --depth=0` reflects the current installation and may show
missing/invalid dependencies. `package.json` describes declared
dependencies. Keep both outputs if you want Claude to distinguish
declared packages from installed packages.

## 10. Recommended Claude Code handover procedure

Start Claude Code in the project folder:

``` bash
cd "/Users/sujal/DATA/Dady/product-manager"
claude
```

If the `claude` command is unavailable, resolve the Claude Code
installation/PATH issue separately; do not change the app to work around
a shell command issue.

Give Claude this instruction:

> Read `README.md` completely. Before editing anything, inspect the
> current repository, `package.json`, lockfile, Expo app config,
> `eas.json`, authentication setup, and Firebase/Supabase configuration.
> Run or inspect `npm ls --depth=0` and report the actual installed
> versions. Compare the live project with this README and list
> discrepancies. Do not print secrets. Do not upgrade packages or modify
> database schemas until I approve a plan. First summarize the current
> architecture, how to run it, which phone build workflow is configured,
> what works, and what is broken. Then propose a small, ordered
> implementation plan and wait for approval before making broad changes.

### First files Claude should inspect

-   `README.md`
-   `package.json` and lockfile
-   `App.js` / app entry point
-   `app.json` or `app.config.*`
-   `eas.json`, if present
-   `babel.config.js`
-   Navigation configuration
-   `screens/` and `components/` (or the actual current equivalents)
-   Firebase initialization/auth files
-   Supabase client/database files
-   `.gitignore` and `.env.example` (never print `.env` secrets)
-   Database rules/RLS policies where accessible

## 11. Handover checklist

Before calling the handover complete, confirm:

-   [ ] App starts from the documented command.
-   [ ] Actual Expo SDK / React / React Native versions are recorded.
-   [ ] `npm ls --depth=0` output is saved or reviewed.
-   [ ] iPhone testing method is confirmed (Expo Go, development build,
    or installed build).
-   [ ] Android testing method is confirmed.
-   [ ] Firebase responsibilities and configuration are documented.
-   [ ] Supabase responsibilities and configuration are documented.
-   [ ] Admin/user permissions are enforced outside the UI.
-   [ ] Product creation and duplicate prevention work.
-   [ ] Purchase saving and purchase history work.
-   [ ] Search uses the agreed starts-with behavior.
-   [ ] Date selection and responsive layouts are tested.
-   [ ] Udhar/reminder requirements are agreed before implementation.
-   [ ] No API keys or private credentials are included in the handover.

------------------------------------------------------------------------

**Last updated:** 24 October 2026\
**Purpose:** Project handover to Claude Code; verify all live repository
details before making changes.
