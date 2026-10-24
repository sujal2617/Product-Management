# DP project log

Kept by Jarvis. Newest first. One line per event: what happened, who, where (PR/file).
Read this, `docs/BACKLOG.md` and `docs/HANDOVER.md` at the start of every session.

## Current state

- **Phase:** P0 security (RLS). Plan written, waiting for Sujal's OK to build.
- **Run/test:** Expo Go on iPhone 15 Plus and OnePlus Nord 2 (`npx expo start`). No installed EAS build in use.
- **Git:** Jarvis pushes to a branch per task and opens a PR; Sujal merges to `main`.
- **Supabase RLS:** OFF on all tables (Sujal turned it off because app writes were blocked).
- **Data (2026-10-24 backup):** 1,328 products, 2,191 purchases, 3 users, 1 note.

## Decisions

| Date | Decision | Source |
|---|---|---|
| 2026-10-24 | Admin-only edit/delete for products, purchases, users; members read and add | Handover README |
| 2026-10-24 | Keep phone + email login | Handover README |
| 2026-10-24 | Stay on free Firebase plan; new users approved by hand with a script | Sujal |
| 2026-10-24 | Product search = name **starts with** the text | Handover README |
| 2026-10-24 | Udhar/credit-reminder feature: idea only, agree channel/cost before building | Handover README |

## Log

- 2026-10-24 · Jarvis · Applied README decisions to RLS plan (PR #3).
- 2026-10-24 · Sujal · Shared handover README → saved as `docs/HANDOVER.md`.
- 2026-10-24 · db-guard · Wrote `docs/RLS_PLAN.md` (PR #3).
- 2026-10-24 · Jarvis · Wrote `docs/BACKLOG.md` from code audit, 25 issues P0-P3 (PR #2).
- 2026-10-24 · Sujal · Installed and logged in `gh`; Jarvis may now open PRs.
- 2026-10-24 · Sujal · Merged backup script (PR #1): double-click `backup.command` → `backup/<date>/`.
- 2026-10-24 · db-guard + react-reviewer · Read-only audit of security and bugs.
