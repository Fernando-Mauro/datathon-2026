---
phase: 02-email-password-auth-authenticator-ui
plan: 01
subsystem: auth
tags: [amplify-gen2, cognito, defineAuth, defineBackend, backend-as-code, typescript]

# Dependency graph
requires:
  - phase: 01-foundation-amplify-backend-skeleton
    provides: Amplify Gen2 backend skeleton (defineBackend({}) entrypoint), CDK Bootstrap on us-east-1, sandbox stack amplify-datathon2026-fernando-sandbox-0d21400c4f, root + amplify tsconfigs (strict), audit ignore-list (24 transitive CVEs)
provides:
  - amplify/auth/resource.ts — Cognito User Pool resource declared with defineAuth (email login, fullname required, EMAIL_ONLY recovery)
  - amplify/backend.ts — defineBackend({ auth }) wiring (replaces empty Phase 1 skeleton)
  - AUTH-01 source-code component complete (live deployment is Plan 02-04)
affects:
  - 02-02-PLAN.md (frontend deps install — independent of this file but part of same phase)
  - 02-03-PLAN.md (frontend AmplifyProvider + Authenticator — consumes amplify_outputs.json populated by deploy)
  - 02-04-PLAN.md (sandbox redeploy — synthesizes the resource declared here into CloudFormation: UserPool + UserPoolClient + IdentityPool + IAM roles)
  - 02-05-PLAN.md (manual D-29 flows — verifies the deployed auth resource end-to-end)
  - Phase 3 (Google OAuth) — extends `auth/resource.ts` with externalProviders block

# Tech tracking
tech-stack:
  added: []  # No new packages — uses existing @aws-amplify/backend@1.22.0 already installed in Phase 1
  patterns:
    - "First non-trivial Amplify Gen2 resource module — sets the shape future resources (data, storage) will mirror"
    - "amplify/{resource-type}/resource.ts naming convention adopted (matches Amplify Gen2 docs canonical layout)"
    - "Drop the Phase 1 'intentionally empty' JSDoc from amplify/backend.ts now that the file documents itself by composition"

key-files:
  created:
    - amplify/auth/resource.ts
  modified:
    - amplify/backend.ts

key-decisions:
  - "Used CDK property name `fullname` (NOT `name`) per L-1 — maps to OIDC standard claim 'name' on the wire and in amplify_outputs.json"
  - "Omitted passwordPolicy — Cognito default (≥8 chars + upper + lower + digit + symbol) already matches D-20"
  - "Omitted userVerification — default emailStyle=CODE matches D-19 (email code verification)"
  - "Set email mutable: false — locks the email forever post-signup (sensible for hackathon, per D-18)"
  - "Dropped Phase 1 backend.ts JSDoc per PATTERNS Option A — the 'bare skeleton' explanation no longer applies; file is now 4 plain lines"
  - "Used relative import `./auth/resource` in backend.ts (NOT @/ alias) — amplify/ subtree uses its own tsconfig with $amplify/* path map, not the Next.js @/* alias"

patterns-established:
  - "Backend resource module shape: `import { defineX } from '@aws-amplify/backend'` + JSDoc describing intent + `export const x = defineX({...})`"
  - "Phase-2-and-later wiring style for amplify/backend.ts: minimal 4-line file (2 imports + blank + defineBackend call) — composition speaks for itself, no explanatory comment needed"

requirements-completed:
  - AUTH-01

# Metrics
duration: 3min
completed: 2026-04-25
---

# Phase 2 Plan 01: Cognito User Pool resource declared via defineAuth (email + fullname + EMAIL_ONLY) and wired into defineBackend Summary

**Cognito User Pool resource declared in amplify/auth/resource.ts (email login, fullname required, EMAIL_ONLY recovery, default Cognito password policy) and wired into amplify/backend.ts via `defineBackend({ auth })` — replaces Phase 1 empty skeleton.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-25T15:51:40Z
- **Completed:** 2026-04-25T15:54:13Z
- **Tasks:** 2
- **Files modified:** 2 (1 created, 1 modified)

## Accomplishments
- AUTH-01 source-code component complete: `amplify/auth/resource.ts` exports `auth = defineAuth({ loginWith: { email: true }, userAttributes: { email, fullname }, accountRecovery: "EMAIL_ONLY" })`
- `amplify/backend.ts` now composes `auth` via `defineBackend({ auth })` — no longer the bare Phase 1 skeleton
- Backend TypeScript still compiles cleanly under `amplify/tsconfig.json` (strict mode)
- All four root repo gates carried forward from Phase 1 stay green: `bun run lint`, `bun run typecheck`, `bun run build`, `bun run audit`

## Task Commits

Each task was committed atomically:

1. **Task 1: Create amplify/auth/resource.ts (Cognito User Pool resource)** - `d7270c8` (feat)
2. **Task 2: Wire auth into amplify/backend.ts and verify repo gates** - `8ff3e99` (feat)

**Plan metadata:** `<pending — final docs commit at end>` (docs: complete plan 02-01)

## Files Created/Modified

### Created
- `amplify/auth/resource.ts` (21 lines) — Cognito User Pool resource declaration (CDK construct factory). Exports `auth` constant. Includes JSDoc explaining the `fullname` ↔ `"name"` CDK/OIDC mapping (the L-1 gotcha) for future readers.

### Modified
- `amplify/backend.ts` (8 → 4 lines) — Replaced `defineBackend({})` with `defineBackend({ auth })`; added `import { auth } from "./auth/resource"`; dropped the Phase 1 "Bare backend skeleton" JSDoc per PATTERNS Option A (the exception explaining intentional emptiness no longer applies).

## File Contents Post-Edit

### amplify/auth/resource.ts (verbatim)
```typescript
import { defineAuth } from "@aws-amplify/backend";

/**
 * Phase 2 — first backend resource on top of the Phase 1 skeleton.
 * Cognito User Pool with email + password sign-in, mandatory email verification,
 * and email-based password reset. Default password policy (min 8, upper+lower+digit+symbol).
 *
 * Attribute name note: the CDK property `fullname` maps to the Cognito/OIDC standard
 * claim `"name"`. The <Authenticator> picks this up via Zero Configuration from
 * amplify_outputs.json and auto-renders a "Name" field in the sign-up form.
 *
 * @see https://docs.amplify.aws/react/build-a-backend/auth/
 */
export const auth = defineAuth({
  loginWith: { email: true },
  userAttributes: {
    email: { required: true, mutable: false },
    fullname: { required: true, mutable: true },
  },
  accountRecovery: "EMAIL_ONLY",
});
```

### amplify/backend.ts (verbatim)
```typescript
import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";

defineBackend({ auth });
```

## Verification Results — All 5 Commands Exit 0

| # | Command | Exit | Notes |
|---|---------|------|-------|
| 1 | `test -f amplify/auth/resource.ts && grep -q 'defineAuth' && grep -q '"EMAIL_ONLY"' && grep -q 'fullname:'` | 0 | File exists with required shape markers |
| 2 | `grep -q 'defineBackend({ auth })' amplify/backend.ts && grep -q 'from "./auth/resource"' amplify/backend.ts` | 0 | Wiring + import present |
| 3 | `cd amplify && npx --no-install tsc --noEmit` | 0 | Backend TS strict-mode clean |
| 4 | `bun run lint` | 0 | ESLint flat config (`--max-warnings=0`) clean |
| 5 | `bun run typecheck` | 0 | Root `tsc --noEmit` clean |
| 6 | `bun run build` | 0 | Next 16.2.4 Turbopack build green; routes `/` and `/_not-found` prerendered |
| 7 | `bun run audit` | 0 | Existing 24-ignore list still suffices; no new CVEs surfaced |

## Decisions Made

1. **`fullname` over `name`** — Used CDK property name `fullname` (not `name`) per L-1 / RESEARCH §1, verified against `node_modules/aws-cdk-lib/aws-cognito/lib/private/attr-names.js` (`fullname: "name"`). Writing `name:` would have caused a TS "Object literal may only specify known properties" error.
2. **Default password policy** — Omitted `passwordPolicy` prop. Verified against `node_modules/@aws-amplify/auth-construct/lib/defaults.js` `PASSWORD_POLICY` — Cognito default `{ minLength: 8, requireLowercase: true, requireUppercase: true, requireDigits: true, requireSymbols: true }` already matches CONTEXT D-20.
3. **Default verification style** — Omitted `userVerification` prop. Default `emailStyle = CODE` (verified in `node_modules/aws-cdk-lib/aws-cognito/lib/user-pool.js`) matches D-19's "code by email" expectation.
4. **`mutable: false` on email** — Email auto-mutable per Amplify defaults; explicit `mutable: false` is meaningful and locks the email forever (sensible for hackathon, per D-18).
5. **Dropped Phase 1 backend.ts JSDoc** — Followed PATTERNS Option A. The Phase 1 JSDoc "Phase 1: Bare backend skeleton — no resources yet" was an exception explaining intentional emptiness; that exception no longer applies. File becomes 4 plain lines (3 code + 1 trailing newline).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Verify-command bug] Negative-grep substring collision in PLAN Task 1 verify**
- **Found during:** Task 1 verification
- **Issue:** PLAN's Task 1 `<automated>` verify includes `! grep -q "name: { required" amplify/auth/resource.ts` to assert the L-1 mistake (`name:` as top-level attribute) is absent. But the literal string `name: { required` is also a substring of `fullname: { required` (the correctly used attribute), so the negative grep always returns false → the chained `&&` line fails even when the file is correct.
- **Fix:** Did NOT modify the file (file content matches RESEARCH §Code Examples §1 verbatim and is per-spec). Replaced the substring check with a word-boundary check during verification: `grep -qE "(^| |\{|,)name: \{ required"` returns no match → asserts the L-1 mistake is genuinely absent. Intent of the check satisfied.
- **Files modified:** None (file content correct as written; only the PLAN's literal verify pattern was buggy).
- **Verification:** Word-boundary grep returns no match. `cd amplify && npx --no-install tsc --noEmit` exits 0 (TypeScript would have caught a real `name:` typo as "Object literal may only specify known properties").
- **Committed in:** N/A — no code change. Documented here so plan-checker / future-me knows the literal verify command in 02-01-PLAN.md and 02-VALIDATION.md task 2-1-1 has a known false-positive that should be fixed in a future plan-template polish (out of scope here).

---

**Total deviations:** 1 (Rule 1 — non-blocking verify-command bug; file content per-spec)
**Impact on plan:** Zero scope creep. File matches RESEARCH excerpt verbatim, all type/build/lint/audit gates green, both atomic commits landed cleanly.

## Issues Encountered

None during code authorship. The verify-command substring bug above was caught by running each grep individually and recognising the cause — file content was correct on first write.

## TDD Gate Compliance

Plan is `type: execute` (not `type: tdd`); TDD gate sequence does not apply. No test commits expected. All commits use `feat(02-01): ...` prefix per scope.

## Threat Surface Scan

No new runtime surface introduced by this plan — the Cognito User Pool does not yet exist in AWS until Plan 02-04 deploys it. Threat T-2-01-01 (Tampering — malformed `defineAuth` config) is mitigated by the strict-mode `tsc --noEmit` gate as planned. Other plan threats (T-2-01-02 through T-2-01-05) all `accept` per threat register and remain accepted (no in-scope mitigation work needed).

No threat flags raised.

## User Setup Required

None — no external service configuration required for this plan. (Plan 02-04 will require `aws-cli-amplify` profile to be active for sandbox redeploy; that requirement is documented there, not here.)

## Self-Check: PASSED

- File created: `/home/fernando/Documents/datathon-2026/amplify/auth/resource.ts` — FOUND
- File modified: `/home/fernando/Documents/datathon-2026/amplify/backend.ts` — FOUND with `defineBackend({ auth })`
- Commit `d7270c8` (Task 1: feat — declare Cognito User Pool auth resource) — FOUND in `git log`
- Commit `8ff3e99` (Task 2: feat — wire auth into defineBackend) — FOUND in `git log`
- All 7 verification subcommands exited 0 (see table above)

## Next Plan Readiness

- AUTH-01 source-code component is in place; live deployment is Plan 02-04
- `amplify/auth/resource.ts` is ready to be synthesized to CloudFormation when `npx ampx sandbox --once` runs (Plan 02-04)
- Next up is Plan 02-02: install frontend deps (`bun add aws-amplify@^6.16.4 @aws-amplify/ui-react@^6.15.3`) — independent of this plan's files; can start immediately.
- Plan 02-03 (frontend `AmplifyProvider`, `<Authenticator>`, login/app pages) will indirectly depend on this file via `amplify_outputs.json` (regenerated by Plan 02-04 deploy).
- No blockers. No carried-forward concerns.

---
*Phase: 02-email-password-auth-authenticator-ui*
*Completed: 2026-04-25*
