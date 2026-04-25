---
phase: 01-foundation-amplify-backend-skeleton
plan: 01
subsystem: infra

tags:
  - postcss
  - cve
  - lint
  - bun
  - hygiene
  - eslint
  - overrides

# Dependency graph
requires: []
provides:
  - "PostCSS CVE GHSA-qx2v-qp2m-jg93 closed via package.json overrides (postcss >= 8.5.10 forced through entire dep tree, including next's exact pin)"
  - "Strict lint gate (`eslint . --max-warnings=0`) installed in package.json"
  - "Verification scripts (`typecheck`, `audit`, `clean`) installed in package.json"
  - "Phase 1 baseline gauntlet `bun run lint && bun run typecheck && bun run audit && bun run build` exits 0 on the clean scaffold"
affects:
  - "All subsequent Phase 1 plans (02-05) and every later phase — they all rely on these gates being green"
  - "Plan 02 (boundaries + .env.example) — must keep `bun run lint` green under `--max-warnings=0`"
  - "Plan 03 (Amplify devDeps + amplify/ skeleton) — must keep `bun run audit` green when adding new devDeps"

# Tech tracking
tech-stack:
  added:
    - "package.json overrides field (Bun-supported npm overrides) — used to force postcss@^8.5.10 across the whole resolution tree"
  patterns:
    - "Use package.json overrides to force-bump exact-pinned transitive vulnerable deps (when bun update / bun add fallback fails)"
    - "Strict ESLint flat-config gate via `eslint . --max-warnings=0` (NOT `next lint`, removed in Next 16 per G-1)"
    - "Phase 1 quick-gauntlet: `bun run lint && bun run typecheck && bun run audit` (~10s), full gauntlet adds `bun run build` (~30s)"

key-files:
  created: []
  modified:
    - "package.json (scripts block hardened; overrides block added)"
    - "bun.lock (postcss collapsed to 8.5.10 across all instances; previous next/postcss@8.4.31 entry removed)"

key-decisions:
  - "Used Bun-supported package.json `overrides` field to close PostCSS CVE because next@16.2.4 declares postcss as an exact pin (8.4.31), so neither `bun update postcss` nor the documented fallback `bun add -D postcss@latest` could lift the nested next/postcss entry. Overrides is the canonical mechanism per Bun's official docs (https://bun.sh/docs/install/overrides)."
  - "Discarded the transient direct `postcss` dep accidentally added to root `dependencies` by `bun add -D postcss@latest` — restored `dependencies` block to its original state, honoring the plan's 'do not modify dependencies' constraint."
  - "Included the `clean` script (Claude's discretion per CONTEXT D-09) — `rm -rf .next .amplify amplify_outputs.json` — because researcher and PATTERNS both recommended it and it matches Amplify's own throwaway-state pattern."

patterns-established:
  - "CVE remediation pattern: try `bun update <pkg>` first → fall back to `bun add -D <pkg>@latest` → if BOTH fail because a top-level dep declares an exact pin, use `package.json` `overrides`. Always re-run `bun audit --audit-level=moderate` to confirm."
  - "Phase 1 verification gauntlet: `bun run lint && bun run typecheck && bun run audit && bun run build` — every subsequent plan must keep this green."

requirements-completed:
  - INFRA-03

# Metrics
duration: 3min
completed: 2026-04-25
---

# Phase 01 Plan 01: PostCSS CVE remediation + strict lint/typecheck/audit/clean scripts Summary

**Closed PostCSS XSS CVE GHSA-qx2v-qp2m-jg93 via package.json `overrides` (because next@16.2.4 exact-pins postcss@8.4.31), and installed the Phase 1 verification gauntlet (`eslint . --max-warnings=0`, `tsc --noEmit`, `bun audit`, `clean`) that every subsequent plan in the phase will run against.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-25T06:21:28Z
- **Completed:** 2026-04-25T06:24:09Z
- **Tasks:** 2
- **Files modified:** 2 (`package.json`, `bun.lock`)

## Accomplishments

- **CVE GHSA-qx2v-qp2m-jg93 closed.** `bun audit --audit-level=moderate` now exits 0 ("No vulnerabilities found"). Lockfile collapsed from two postcss entries (root `postcss@8.5.10` AND `next/postcss@8.4.31`) to a single `postcss@8.5.10` entry covering all consumers.
- **Strict lint gate installed.** `lint` script is now `eslint . --max-warnings=0` (NOT `next lint` — that was removed in Next.js 16 per G-1). Existing scaffold passes the strict gate cleanly.
- **`typecheck`, `audit`, `clean` scripts added** per CONTEXT D-09 plus Claude-discretion `clean`.
- **Phase 1 baseline gauntlet green:** `bun run lint && bun run typecheck && bun run audit && bun run build` all exit 0.

## Task Commits

Each task was committed atomically:

1. **Task 1: Bump PostCSS lockfile to close CVE GHSA-qx2v-qp2m-jg93** — `0a68114` (fix)
2. **Task 2: Replace lint script with strict ESLint and add typecheck/audit/clean scripts** — `539f6fc` (chore)

## Files Created/Modified

- `package.json` — scripts block expanded from 4 entries to 7 (`dev`, `build`, `start`, `lint`, `typecheck`, `audit`, `clean`); new top-level `overrides` block added (`{ "postcss": "^8.5.10" }`); `dependencies`, `devDependencies`, `ignoreScripts`, and `trustedDependencies` blocks unchanged.
- `bun.lock` — postcss entries collapsed to a single `postcss@8.5.10` entry. The previously-present nested `"next/postcss": ["postcss@8.4.31", ...]` entry is gone.

## Before / After Snapshots

**`bun audit` BEFORE Task 1:**
```
postcss  <8.5.10
  @tailwindcss/postcss › postcss
  next › postcss
  moderate: PostCSS has XSS via Unescaped </style> in its CSS Stringify Output - https://github.com/advisories/GHSA-qx2v-qp2m-jg93
1 vulnerabilities (1 moderate)
```

**`bun audit --audit-level=moderate` AFTER Task 1 (with overrides applied):**
```
No vulnerabilities found
```
Exit code: 0.

**Lockfile postcss entries BEFORE:**
```
"postcss": ["postcss@8.5.10", ..., "sha512-pMMHxBOZKFU6..."]
"next/postcss": ["postcss@8.4.31", ..., "sha512-PS08Iboia9mts/2..."]   ← VULNERABLE
```

**Lockfile postcss entries AFTER:**
```
"postcss": ["postcss@8.5.10", ..., "sha512-pMMHxBOZKFU6..."]
```
(Single entry — `next/postcss@8.4.31` removed by overrides.)

**`package.json` `scripts` block AFTER Task 2:**
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint . --max-warnings=0",
  "typecheck": "tsc --noEmit",
  "audit": "bun audit",
  "clean": "rm -rf .next .amplify amplify_outputs.json"
}
```

**Final verification gauntlet output (`bun run lint && bun run typecheck && bun run audit && bun run build`):**
```
$ eslint . --max-warnings=0          → exit 0
$ tsc --noEmit                       → exit 0
$ bun audit                          → "No vulnerabilities found", exit 0
$ next build                         → "✓ Compiled successfully in 1140ms", exit 0
```
All four gates green.

## Decisions Made

- **Used `package.json` `overrides` to force the postcss bump** (instead of the plan's documented fallback `bun add -D postcss@latest`). Rationale: see Deviations below — `next@16.2.4` declares `"postcss": "8.4.31"` as an EXACT pin, so neither `bun update` nor a top-level direct dep can lift the nested resolution. Bun supports the npm-standard `overrides` field exactly for this case (verified via Bun official docs).
- **Included the `clean` script** (Claude's discretion per CONTEXT D-09 + recommended by both researcher and PATTERNS).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] CVE not closed by either of the plan's documented fix paths — used `package.json overrides` instead**

- **Found during:** Task 1 (Bump PostCSS lockfile)
- **Issue:** Plan §1 RESEARCH says `bun update postcss` should suffice, with documented fallback `bun add -D postcss@latest`. Both were tried in sequence; both lifted the top-level `postcss` resolution to `8.5.10` but **neither removed the nested `next/postcss@8.4.31` entry from the lockfile**, because `next@16.2.4`'s own `package.json` declares `"postcss": "8.4.31"` as an exact pin (verified via `grep -A 2 '"postcss"' node_modules/next/package.json`). After both fix paths ran, `bun audit` still reported the CVE with exit code 1 — the must-have truth "GHSA-qx2v-qp2m-jg93 no longer reported by `bun audit`" was unsatisfied.
- **Fix:** Added a top-level `overrides` block to `package.json`: `"overrides": { "postcss": "^8.5.10" }`. This is Bun's official mechanism (npm-compatible) for forcing transitive metadependency resolution, including across exact-pinned parents. After `bun install`, the lockfile's `next/postcss` entry was removed and only a single `postcss@8.5.10` entry remained. `bun audit --audit-level=moderate` then exited 0 with "No vulnerabilities found".
- **Cleanup:** The transient `postcss` direct dep that the plan's fallback path mistakenly added to `dependencies` (where `bun add -D` placed it under this Bun version) was reverted as part of the same edit, restoring the `dependencies` block to its original 3-entry state and honoring the plan's "do not modify `dependencies`" constraint.
- **Files modified:** `package.json` (added `overrides`; reverted accidental `postcss` dep), `bun.lock` (postcss tree collapsed to single 8.5.10 entry).
- **Verification:** `bun audit --audit-level=moderate` exits 0; `grep "postcss@" bun.lock` shows only `postcss@8.5.10` (no `next/postcss@8.4.31`); `bun run build` still exits 0.
- **Committed in:** `0a68114` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking)
**Impact on plan:** The fix is functionally equivalent to the plan's intent (close the CVE without touching unrelated deps). The `overrides` mechanism is more robust than the plan's documented fallback because it handles exact-pinned transitives (which neither `bun update` nor a direct top-level dep can address). Plan's "do not modify `dependencies` block" constraint was honored. No scope creep.

## Issues Encountered

- **The plan's documented `bun add -D postcss@latest` fallback added `postcss` to `dependencies` instead of `devDependencies`** under Bun 1.3.5. This is unexpected (the `-D` short flag is documented as `--dev` / `--development`), but it's not load-bearing here because the override-based fix made the direct dep unnecessary anyway — the dep was reverted as part of the same Task 1 commit. Worth flagging for future plans that may rely on `bun add -D` placing devDeps correctly.

## User Setup Required

None — this plan is purely lockfile + `package.json` hygiene. No external service configuration, no env vars, no AWS calls.

## Next Phase Readiness

- Phase 1 baseline gates are green (`lint`, `typecheck`, `audit`, `build` all exit 0).
- Plan 02 (boundaries + `.env.example`) can proceed — its `bun run lint` runs will be enforced under `--max-warnings=0` per the new strict gate.
- Plan 03 (Amplify devDeps install) will rely on `bun run audit` to detect any CVEs introduced by new transitive deps; the gate is now in place.
- The `overrides` block is now part of the contract — if a later phase needs to bump postcss further (e.g., a 9.x release), update the override range there too.

## Self-Check: PASSED

Verified before writing:

- `[FOUND]` `package.json` (modified, contains `"lint": "eslint . --max-warnings=0"`, `"overrides": { "postcss": "^8.5.10" }`)
- `[FOUND]` `bun.lock` (modified, single postcss@8.5.10 entry, no next/postcss@8.4.31)
- `[FOUND]` Commit `0a68114` (Task 1 — fix CVE)
- `[FOUND]` Commit `539f6fc` (Task 2 — scripts)
- `[VERIFIED]` `bun audit --audit-level=moderate` exits 0
- `[VERIFIED]` `bun run lint && bun run typecheck && bun run audit && bun run build` all exit 0
- `[VERIFIED]` `dependencies`, `ignoreScripts`, `trustedDependencies` blocks unchanged from pre-plan state

---
*Phase: 01-foundation-amplify-backend-skeleton*
*Completed: 2026-04-25*
