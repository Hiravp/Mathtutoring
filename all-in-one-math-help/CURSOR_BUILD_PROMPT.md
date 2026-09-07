# All-in-One Math Help + MathQuest — Cursor Build Prompt

## Before you paste this in

A few notes first:

- This prompt merges the existing **All-in-One Math Help** app (teachers, students, AI tutor, worksheet generator, flashcards, mini-games) with the **MathQuest** vision (skill-tree curriculum, infinitely generated adaptive quizzes, Prodigy-style RPG battle game, parent tools, deeper accessibility).
- The app already exists at `all-in-one-math-help/` with Next.js, Supabase, shadcn/ui, and **Puter.js** for AI. **Extend that codebase** — do not scaffold a second app.
- This is intentionally comprehensive. **Don't hand Cursor this whole doc and expect one working app to pop out.** Agents produce much stronger code in focused passes. Paste "Project Overview," "Tech Stack," and "Architecture" first, then work through "Suggested Build Phases" one phase at a time, pulling in the relevant feature section(s) as you reach them.
- Keep the current stack unless a MathQuest feature truly requires an addition (e.g. Phaser for the RPG canvas, KaTeX/mathjs for symbolic grading). Prefer incremental deps over a rewrite.

Everything from here down is written to be pasted directly into Cursor.

---

## Project Overview

Build / evolve **All-in-One Math Help** (optional product rename: **MathQuest**) into a full-stack web app that teaches and drills math from early elementary through calculus and statistics, for three audiences — students, teachers, and parents.

Two layers, tightly connected:
1. A real **adaptive learning engine**: a skill-tree curriculum, infinitely generated (not pre-written) quizzes, mastery tracking, and teacher/parent reporting — plus the existing AI homework tutor, AI worksheet generator, and formula flashcards.
2. A **fantasy RPG game layer**, in the spirit of games like Prodigy Math — original characters, art, and world, not a copy of any existing product's IP — where solving problems correctly is literally how the player moves, battles, and levels up. Keep the existing Rapid Fire / Equation Balancer games as lighter practice modes alongside the RPG.

Preserve what already works: class codes, enrollments, AI assignment generation, homework scanner, flashcards, progress cards, and role-gated dashboards.

## Current Supabase Project

Use this existing Supabase project:

```text
Project ID: bbfltvlfjggimrwtuvfr
```

Do NOT create a new Supabase project. Use credentials from environment variables.

- Browser/client: **Publishable/Anon key** only (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- NEVER put `sb_secret_...` or service-role keys in browser code
- NEVER commit secrets to Git

## Tech Stack

**Keep (already in the repo):**
- Frontend: Next.js App Router + React + TypeScript + Tailwind CSS + shadcn/ui + Lucide
- Backend: Next.js Server Actions / Route Handlers
- Database + Auth: Supabase PostgreSQL + Supabase Auth (`@supabase/ssr`)
- AI: **Puter.js** (`@heyputer/puter.js`) — single SDK for chat, OCR, and TTS across 500+ models (user-pays / account credits). Docs: https://docs.puter.com/llms.txt
- Validation: Zod
- Server Components by default; Client Components only when needed
- Footer must include a link to https://developer.puter.com labeled **Powered by Puter**

**Puter.js AI usage (required):**
- Chat / generation: `puter.ai.chat()` via `src/lib/ai/puter.ts` (`generateWithPuter`) for worksheets, homework tutor, flashcards, and future Socratic tutor chat
- Server Actions: initialize with `init(process.env.PUTER_AUTH_TOKEN)` from `@heyputer/puter.js/src/init.cjs` (keep token server-only)
- Client features: import `puter` from `@heyputer/puter.js` only in `"use client"` modules (Next.js needs browser APIs)
- OCR: `puter.ai.img2txt()` for homework image scanning (`src/lib/ocr.ts`)
- TTS (a11y phase): `puter.ai.txt2speech()` for question read-aloud
- Prefer `normalize: true` on chat so `message.content` is a string across vendors
- Default model: `gpt-5-nano` unless a feature needs a stronger model; pin `provider` only when needed
- Do **not** add Cerebras, OpenRouter, or Anthropic SDKs — route all AI through Puter.js
- Apps must be served over HTTP(S), not `file://`

**Add as MathQuest features land:**
- Game canvas: Phaser 3, mounted inside a React route for the world map + battle scenes
- State (game/client): Zustand where Phaser ↔ React bridging needs it
- Math rendering: KaTeX
- Answer checking: mathjs (or a small custom CAS) so equivalent expressions (`x+2` vs `2+x`) both grade correctly
- Charts: Recharts (or keep existing chart components) for teacher/parent dashboards
- PDF export: printable worksheets from the same generators
- Realtime (stretch): Supabase Realtime or Socket.io for live leaderboards / class battles
- Testing: Vitest + React Testing Library, Playwright for e2e
- Deploy: Vercel (app) + existing Supabase (DB/auth)

Roles (expand from current `teacher` | `student`):

```text
student | teacher | parent | admin
```

## Architecture

Structure so curriculum content is **data, not code** — covering every math class means adding data, not rewriting features. Extend the existing `src/` layout:

```text
src/app                  — Next.js routes (student, teacher, parent, admin)
src/components           — shared UI (keep layout/, teacher/, student/, games/, flashcards/, ui/)
src/game                 — Phaser scenes, sprites, battle logic
src/curriculum           — skill graph + course definitions (JSON/TS data, not components)
src/generators           — one question-generator module per skill or skill family
src/lib                  — auth, supabase, AI, answer-checking, spaced-repetition scheduler
src/actions              — server actions
supabase/schema.sql      — DB schema (+ migrations for new MathQuest tables)
```

---

## 1. Curriculum Engine — the skill tree

Model the **entire curriculum as a directed graph of Skills**, so "every math class" is data, not features.

- Each `Skill`: id, title, strand, grade band, prerequisite skill ids, standards codes (Common Core/state/IB — flexible string array), difficulty range.
- Group skills into **Courses** that are curated, ordered views over the graph: Kindergarten Math, Grades 1–5, Pre-Algebra, Algebra I & II, Geometry, Trigonometry, Pre-Calculus, Calculus AB/BC, Statistics & Probability, intro Linear Algebra, Consumer/Financial Math, intro Discrete Math, and SAT/ACT-style test prep.
- Keep existing subject nav (Algebra, Geometry, Algebra 2, Precalculus, Calculus, AP Math, IB Math) as course views over the graph.
- Seed real content across at least: number sense & operations, fractions/decimals, ratios & proportions, expressions & equations, functions, geometry & measurement, trigonometry, statistics & probability, and calculus (limits/derivatives/integrals).
- Every skill points to one or more **question generators** rather than a fixed question bank.

```typescript
interface Skill {
  id: string;
  title: string;
  strand: 'number-sense' | 'algebra' | 'geometry' | 'trigonometry'
        | 'statistics' | 'calculus' | 'discrete-math' | 'financial-literacy';
  gradeBand: string; // "K-2", "6-8", "Algebra I", "AP Calc AB", ...
  prerequisiteSkillIds: string[];
  standardsCodes: string[];
  difficultyRange: [number, number]; // 1-10
}
```

## 2. Adaptive Quiz & Question Generation Engine

Build **generator functions, not question banks** — alongside (not replacing) the existing Puter.js AI worksheet generator.

- One `QuestionGenerator` per skill: takes difficulty (1–10), returns a fresh `Question` with randomized numbers/wording and a programmatically computed correct answer.
- Question types: multiple-choice, numeric entry, multi-select, equation/expression entry (symbolic check), drag-to-order, matching pairs, click-a-point (graph/number line), step-graded free response.
- Word problems: template-based with randomized names/contexts/numbers.
- **Purposeful distractors** reflecting common mistakes (sign errors, forgotten distribute, flipped fractions).
- **Adaptive difficulty**: per-student, per-skill mastery (Elo-style) nudges difficulty up after streaks and down after misses.
- **Spaced repetition**: SM-2-style review of mastered skills.
- Store a **generation seed** on every question for exact regeneration (teacher tests, "see that one again").
- Every answer gets a **step-by-step worked solution**.

```typescript
interface Question {
  id: string;
  skillId: string;
  type: 'multiple-choice' | 'numeric' | 'multi-select' | 'equation-input'
      | 'graph-point' | 'drag-order' | 'matching' | 'free-response';
  difficulty: number;
  prompt: string; // LaTeX between $...$
  choices?: string[];
  correctAnswer: string | number | string[];
  explanationSteps: string[];
  generatorSeed: number;
}

// Illustrative sketch — harden edge cases before shipping
function generateLinearEquationQuestion(difficulty: number): Question {
  const a = randomInt(1, difficulty + 2);
  const b = randomInt(-10, 10);
  const x = randomInt(-10, 10);
  const c = a * x + b;

  const distractors = [x + 1, -x, Math.round((c + b) / a)];

  return {
    id: generateId(),
    skillId: 'algebra-linear-equations',
    type: 'multiple-choice',
    difficulty,
    prompt: `Solve for x: $${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = ${c}$`,
    choices: shuffle([x, ...distractors]).map(String),
    correctAnswer: String(x),
    explanationSteps: [
      `Subtract ${b} from both sides: ${a}x = ${c - b}`,
      `Divide both sides by ${a}: x = ${x}`,
    ],
    generatorSeed: Date.now(),
  };
}
```

Wire generators into:
- Student Quick Practice / Timed Drill / Review
- Teacher-assigned skill practice and timed tests
- RPG battles (correct answer = attack)
- PDF worksheet export
- Existing AI assignment flow as an optional "AI-authored" overlay on top of generators

## 3. The Game Layer — RPG World

- **World map**: several original fantasy realms, each tied to a math strand, unlocking as prerequisite skills are mastered.
- **Battles**: turn-based; correct answers land attacks; streaks build combo multipliers; wrong answers chip a shield (low-stakes mistakes).
- **Avatar**: customizable character unlocked with practice-earned currency.
- **Companion/pet**: hatch and level alongside practice; cosmetic evolutions at milestones.
- **Currency & shop**: cosmetics only — never pay-to-win; never buy correctness.
- **Boss battles**: gated mastery checks across a realm's unlocked skills.
- **Quests**: short story objectives tied to skills ("solve 10 fraction problems to help the baker").
- **Guilds**: a teacher's classroom, with class leaderboard and optional collective quests.
- Keep Rapid Fire Mental Math and Equation Balancer as non-RPG practice games.
- Original art/characters only — genre-inspired, not another product's IP.

## 4. Student Experience

Extend `/student/dashboard` and related routes:

- Home: current quest, streak, recommended next practice, skill-tree map with mastery shading.
- Practice modes: Quick Practice (untimed), Timed Drill, Review (spaced-repetition queue), Custom skill selection.
- Keep: classes, assignments, scanner, games hub, flashcards, progress.
- Personal stats: accuracy trend, time on task, streaks, badges.

## 5. Teacher & Parent Portal

**Teacher** (extend existing dashboards):
- Roster management with join-by-code (already exists — keep/harden).
- Assign skills/quizzes/timed tests to a class or individual, with due dates.
- Class mastery heatmap (skills × students) and per-student drill-down.
- Standards-alignment view.
- Printable worksheet export (PDF) from generators.
- Teacher-authored questions on top of generated ones.
- Existing AI assignment generator remains available.
- Analytics: class average, completion, difficult topics, students needing help.

**Parent** (new role + `/parent/*`):
- Read-only progress + weekly summary.
- Link to child accounts managed by parent/teacher (no public student profiles).

## 6. Math Tools & Manipulatives

- Built-in scientific/graphing calculator.
- Virtual manipulatives: number line, fraction bars/circles, base-ten blocks, algebra tiles, interactive coordinate plane, angle/shape tool.
- Step-by-step equation solver students can use to check their own work.

## 7. AI Tutor & Hints

Preserve and deepen the existing homework scanner / Puter.js tutor:

- All LLM calls go through Puter.js (`generateWithPuter` / `puter.ai.chat`).
- Tiered hints: nudge → strategy → first step worked out → full solution (student chooses how much to reveal).
- Chat tutor constrained to **Socratic tutoring** — guiding questions and concepts; system prompt must forbid handing over final answers to graded work.
- AI-assisted word-problem generation as a teacher authoring aid.
- OCR: `puter.ai.img2txt()` via `extractTextFromImage(file)` for snap-a-photo homework scanning.
- Optional multimodal: pass image URLs/Files into `puter.ai.chat(prompt, media)` when tutoring from a photo.

## 8. Accounts, Roles & Auth

- Roles: student, teacher, parent, admin (migrate schema/trigger from teacher|student only).
- Under-13 students created/managed by a teacher or parent — no direct self-signup with personal email for young kids.
- Bulk roster import (CSV); Google Classroom/Clever sync as stretch.
- Server always reads role from DB — never trust client-supplied role.
- Keep existing secure 6-character class codes (exclude O/0/I/1).

## 9. Gamification (cross-cutting)

XP and levels, daily streaks, badges, daily login rewards, class leaderboards (global optional, off by default), limited-time cosmetic events. Tie RPG currency to practice, not purchases of advantage.

## 10. Accessibility & Localization

- Full keyboard navigation, screen-reader labels, WCAG-AA contrast.
- Dyslexia-friendly font toggle, adjustable text size, colorblind-safe palette.
- Text-to-speech read-aloud on every question via `puter.ai.txt2speech()` — essential for pre-/emerging readers.
- Untimed mode always available next to timed modes.
- i18n-ready strings, localized number formatting.
- Keep existing a11y rules for labels, focus, semantic HTML, and not relying on color alone.

## 11. Analytics & Reporting

Event tracking (attempts, time-on-task, hint usage) feeding teacher dashboards and the adaptive-difficulty engine; weekly auto-generated parent summary.

## 12. Trust, Safety & Compliance

Kids' product rules:
- No public student profiles or real names visible to other students.
- No open free-text chat between students by default (safe preset phrases only, if any).
- Clear data-deletion path per student/family; data minimization by default.
- No ads, no third-party ad trackers, no data resale.
- Roles scoped so a teacher only ever sees their own students.
- Keep existing security rules: never expose `PUTER_AUTH_TOKEN` or Supabase secrets to the client; Zod on inputs and AI output; RLS on; verify ownership/enrollment server-side; limit uploads; never expose stack traces.
- Client-side Puter calls use Puter's own auth / user-pays credits — do not ship your Puter auth token in the browser.

## 13. Existing Features to Preserve

Do not regress:
- AI worksheet / assignment generator (Puter.js + Zod)
- AI homework tutor / scanner (Puter.js chat + img2txt OCR)
- Formula flashcards (Puter.js generation)
- Rapid Fire Mental Math + Equation Balancer
- Class create/join, enrollments, submissions
- Progress components (`StatCard`, `ProgressCard`, `SubjectProgress`, `AccuracyChart`)
- Command search (⌘K / Ctrl+K)
- Landing page positioning (update copy to mention adaptive practice + adventure mode when those ship)

## 14. Testing

- Unit tests for every question generator: brute-force-verify computed answers across many random seeds.
- E2E (Playwright) core loop: teacher creates a class → student joins → completes a quiz/battle practice → teacher sees the result.
- Continue running `npm run lint` and `npm run build` before declaring a phase complete.

## 15. Suggested Build Phases

Work one phase at a time. Stop and wait for confirmation between major phases unless the user says otherwise.

0. **Stabilize foundation** (largely done) — auth + roles, schema, dashboards, AI tutor, assignments, games, flashcards. Fix any remaining auth/RLS gaps before expanding.

1. **Curriculum + generators MVP** — skill graph data model, seed one strand (e.g. elementary arithmetic + fractions), 3–4 question types, basic adaptive difficulty, practice UI wired to generators.

2. **RPG loop** — Phaser world map + one battle type driven by the same generators; XP/currency cosmetics-only; quests for that strand.

3. **Teacher analytics depth** — mastery heatmap, skill assignments with due dates, standards view, PDF worksheet export from generators.

4. **Parent + roles expansion** — parent role, linking, read-only progress, weekly summary; under-13 account flows.

5. **Breadth** — expand skill graph through Algebra/Geometry and beyond; pets/avatar/shop; keep adding generators.

6. **Depth** — spaced-repetition review, symbolic answer checking (mathjs), richer AI tutor chat, manipulatives, calculator.

7. **Polish** — accessibility pass (TTS, dyslexia font, etc.), localization, offline/PWA, live class battles, performance.

## 16. Stretch Goals

- Snap-a-photo handwritten-problem solver (Puter `img2txt` + chat solve/tutor).
- Google Classroom/Clever roster sync.
- Weekly parent email digest.
- Seasonal in-game events.
- AR mode for manipulatives.

---

## Development Rules

- Extend `all-in-one-math-help/`; do not create a parallel app.
- Do not make one giant file; prefer modular generators and scenes.
- TypeScript strictly; avoid unnecessary `any`.
- Server Actions for privileged operations; Zod on all privileged inputs and AI outputs.
- Original game IP only.
- When asked for both a feature and a full rewrite, prefer incremental delivery against the phases above.
