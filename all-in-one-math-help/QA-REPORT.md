# Local QA report

Date: 2026-09-14

## Automated checks

- `npm install --no-audit --no-fund`: passed (39 project packages).
- `npm test`: passed: 42 skills, 16 courses, deterministic generation, answer parsing, multi-select cardinality, and unsafe answer-shape checks.
- `npm run typecheck`: passed.
- `npm run build`: passed with Next.js 16.3.3/Turbopack; `/` and `/_not-found` prerendered.
- Playwright browser smoke against local `next start`: passed. It covered landing → demo; right and wrong answers for numeric, exact multi-select, and single-choice formats; double-click submission (one award); battle health continuing over questions to explicit victory/restart; real demo-session report state; course switch; settings persistence classes; and 390px viewport with no horizontal document overflow. Screenshots: `../production-qa/desktop-demo-world.png`, `../production-qa/desktop-demo-settings.png`, and `../production-qa/mobile-demo-world.png` (thread work paths below).
- A separate browser smoke build used *placeholder public Supabase values* and Playwright request interception/local session data only (no external Auth). It verified that landing Sign in opens a dialog and `?type=recovery` opens the recovery form and submits a mocked `updateUser` response.

## Security/source review

- Browser cloud questions omit expected answers, hints, worked steps, seed, and generator version. The Edge Function verifies the bearer user and uses server-only question rows.
- Client submits measured elapsed whole seconds; duplicate client submission is synchronously guarded; replay responses do not increment local totals.
- SQL mutation functions revoke public/anon/authenticated execution and explicitly grant `service_role`. Hint and reward accounting use the locked question's `hint_count`.
- Issuance budget records advisory-lock-protected 24-hour reservations in `mq_issue_budgets`, independent of attempts. JSON object/UUID/integer validation is strict. Export is explicitly bounded to 1,000 rows per collection.

## Not verified locally

PostgreSQL/Supabase migration execution, RLS policy behavior, RPC grants, Edge deployment/bundling, email delivery, recovery links in a real Supabase session, live account deletion, and live adaptive difficulty were **not** tested against a Supabase project. They remain deployment blockers; apply and verify the migration and deploy the Edge Function before enabling cloud mode.

Screenshot paths:

- `/tasklet/threads/a_k33gmvphkhex953tajds/work/production-qa/desktop-demo-world.png`
- `/tasklet/threads/a_k33gmvphkhex953tajds/work/production-qa/desktop-demo-settings.png`
- `/tasklet/threads/a_k33gmvphkhex953tajds/work/production-qa/mobile-demo-world.png`
