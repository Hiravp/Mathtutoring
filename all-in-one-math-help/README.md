# MathQuest: The Aether Isles

A mobile-responsive, original fantasy math-practice beta. It is a game-first sampler, not an official standards curriculum or grading system.

## Included

- Original SVG environment, Mosswing companion, and stone guardian (no downloaded character/art/font/IP).
- Memory-only demo with 42 deterministic generated skills across 16 course samplers; numeric, multiple-choice, and exact multi-select answer formats; hints; worked paths; and an explicit guardian-battle restart after victory.
- Optional Supabase email/password cloud save, password-reset and recovery-password forms, and accessible local large-text/reduced-motion settings. Browser read-aloud uses the browser's own speech-synthesis support when available.
- Server-authoritative cloud question issuance/grading design: cloud questions omit expected answers, solutions, hints, seeds, and generator version; the Edge Function verifies bearer JWTs and SQL records single attempts.
- Actual hydrated cloud totals/progress/due dates when the Edge Function and schema are deployed. Demo reports only session accuracy and intentionally has no fabricated review schedule.
- Collection badges (not appearance equipment): purchases are visibly marked collected but do not claim unimplemented cosmetic effects.
- No public profiles, chat, ads, third-party analytics, student-data training, or child/guardian account claims.

## Local development

```sh
cp .env.example .env.local
# Optional cloud mode: fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

With blank public Supabase values, cloud controls explain that configuration is unavailable and the memory-only sampler still works. Demo progress is reset when leaving demo and is never saved.

## Supabase setup (required before enabling cloud mode)

1. Apply `supabase/migrations/001_mathquest.sql` to a Supabase project. It is additive and uses `mq_` tables.
2. Deploy `supabase/functions/mathquest-api/index.ts` as `mathquest-api`; bundle its adjacent `curriculum.ts`, `generators.ts`, and `types.ts`.
3. Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the Edge Function. Do not put the service-role key in browser configuration.
4. Confirm the Auth redirect URL is allowed for the hosted origin so password recovery returns to the app. The app recognizes a `type=recovery` deep link and the Supabase `PASSWORD_RECOVERY` event.
5. Verify SQL/RLS/RPC behavior, Edge deployment, real email/reset flow, deletion, and cloud progress using a real project before release.

### Deployment status — 2026-09-16

The MathQuest migration and `mathquest-api` version 1 are deployed to the selected Supabase project. Database RLS/privileges and rollback-only tests for issuance, ordered hints, cross-owner rejection, exact-once rewards/replays, and deletion cascade passed. Signup supplies fixed `student` metadata for the project's existing user-creation trigger. Frontend hosting configuration, live Auth/email recovery, and authenticated browser-to-Edge progress tests remain pending. No live website release is claimed yet.

## API contract

Authenticated POST JSON to the Edge Function:

- `{action:"me"}` returns own profile, lifetime totals, progress/due rows, and badge IDs.
- `{action:"issue", skillId}` chooses adaptive server-side difficulty and returns a public question without expected-answer/replay data.
- `{action:"hint", questionId, tier}` returns one ordered, pre-grading hint.
- `{action:"answer", questionId, answer, seconds}` records one attempt, using the question's locked hint count for rewards.
- `{action:"course", courseId}` saves a validated course choice.
- `{action:"export"}` is an explicitly bounded (1,000 per collection) own-data export.
- `{action:"purchase", cosmeticId}` and `{action:"delete-account", confirmation:"DELETE"}` mutate only the signed-in account.
- `{action:"tutor"}` is deliberately unavailable in this beta; deterministic hints are the supported help path.

The issue budget stores each issuance reservation and caps the prior 24 hours under an advisory lock. SQL functions are intended for `service_role` only; expected answers remain inaccessible to browser clients.

## QA

See `QA-REPORT.md` for exact local command/browser evidence and the cloud deployment checks that remain unverified.
