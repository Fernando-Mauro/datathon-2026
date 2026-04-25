---
phase: 01-foundation-amplify-backend-skeleton
plan: "01-04"
subsystem: docs
tags: [readme, docs, aws-setup, amplify, sandbox, iam, aws-cli]

# Dependency graph
requires:
  - phase: 01-foundation-amplify-backend-skeleton
    provides: "amplify/backend.ts skeleton (01-03), .env.example with AWS_PROFILE/AWS_REGION (01-02)"
provides:
  - "README ## Setup section: AWS CLI v2 install (Linux), IAM user + AmplifyBackendDeployFullAccess, both access-key and SSO profile flows, aws sts validation, env file copy, bun install, npx ampx sandbox lifecycle (deploy + delete), region precedence, 5-8 min CDK bootstrap warning"
affects:
  - 01-05 (manual gate — developer follows README §Setup before running npx ampx sandbox --once)
  - phase 5 (Amplify Hosting) — README ## Deploy on Vercel section preserved but will be replaced

# Tech tracking
tech-stack:
  added: []
  patterns: [step-by-step-setup-docs, profile-named-datathon-2026, region-precedence-callout]

key-files:
  created: []
  modified:
    - README.md (added ## Setup section before ## Getting Started; preserved Getting Started, Learn More, Deploy on Vercel)

key-decisions:
  - "Phrased the bunx warning as 'do not launch via Bun's binary launcher' instead of the literal anti-pattern string `bunx ampx`, so the README never contains the forbidden command verbatim while still steering devs to npx (Rule 1 deviation, see below)."
  - "Used profile name `datathon-2026` consistently across all 7 numbered steps so steps 3-7 wire together without ambiguity (CONTEXT D-10 marks the name as Claude's discretion; chose to lock it in)."

patterns-established:
  - "README setup-docs pattern: numbered ### steps under a single `## Setup`, each with a copy-pasteable bash fenced block, blockquote callouts for security warnings (no keys in .env) and operational gotchas (region precedence)."
  - "Both AWS auth flows documented (Option A access-keys + Option B SSO) with explicit guidance to keep the profile name consistent across flows."

requirements-completed: [INFRA-01]

# Metrics
duration: 3min
completed: 2026-04-25
---

# Phase 01 Plan 04: README Setup Section Summary

**Step-by-step AWS onboarding doc inserted before Getting Started — covers AWS CLI v2 install, IAM + AmplifyBackendDeployFullAccess, aws configure (access-key & SSO), aws sts validation, .env.local, npx ampx sandbox lifecycle (deploy + delete), region precedence, and the 5-8 min CDK bootstrap warning.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-25T13:25:01Z
- **Completed:** 2026-04-25T13:27:19Z
- **Tasks:** 1/1
- **Files modified:** 1

## Accomplishments

- README has a new `## Setup` section at line 3, BEFORE `## Getting Started` (now at line 108).
- Section contains 7 numbered steps + a Prerequisites block + a region-precedence blockquote.
- `## Getting Started` (line 108), `## Learn More` (line 128), `## Deploy on Vercel` (line 137) all preserved unchanged.
- All 4 repo gates green: lint, typecheck, audit, build.

## Task Commits

1. **Task 1: README ## Setup section** — `c4034c5` (`docs(01-04): add README ## Setup section (AWS CLI install, IAM, profile, sandbox lifecycle)`)

## Files Created/Modified

- `README.md` — Inserted ## Setup section (lines 3-106) covering AWS CLI install, IAM user setup, profile config (access-key & SSO), aws sts validation, env file copy, bun install, npx ampx sandbox + delete, and region-precedence callout. Existing sections preserved.

## Section structure added (the seven `### N.` subheadings)

| Line | Heading                                            |
|------|----------------------------------------------------|
| 3    | `## Setup`                                         |
| 7    | `### Prerequisites`                                |
| 14   | `### 1. Install AWS CLI v2 (if not already installed)` |
| 27   | `### 2. Create / pick an AWS IAM user`             |
| 33   | `### 3. Configure your local AWS profile`          |
| 59   | `### 4. Verify AWS access`                         |
| 68   | `### 5. Set the project env`                       |
| 77   | `### 6. Install dependencies`                      |
| 83   | `### 7. Deploy the sandbox`                        |
| 108  | `## Getting Started` (preserved)                   |
| 128  | `## Learn More` (preserved)                        |
| 137  | `## Deploy on Vercel` (preserved)                  |

## Acceptance criteria — all green

| Check                                                              | Result |
|--------------------------------------------------------------------|--------|
| `## Setup` precedes `## Getting Started`                           | line 3 < line 108 ✓ |
| Contains `AmplifyBackendDeployFullAccess`                          | ✓ |
| Contains `aws configure --profile datathon-2026`                   | ✓ |
| Contains `aws sts get-caller-identity --profile datathon-2026`     | ✓ |
| Contains `cp .env.example .env.local`                              | ✓ |
| Contains `AWS_PROFILE=datathon-2026 npx ampx sandbox`              | ✓ |
| Contains `AWS_PROFILE=datathon-2026 npx ampx sandbox delete`       | ✓ |
| Contains `5-8 min`                                                  | ✓ |
| Contains `us-east-1`                                                | ✓ |
| Contains `aws configure sso` (case-insensitive)                    | ✓ |
| Contains `awscli-exe-linux-x86_64.zip`                             | ✓ |
| Anti-pattern `bunx ampx` absent                                    | ✓ (rephrased — see Deviations) |
| Anti-pattern `amplify init` absent                                 | ✓ |
| Anti-pattern `amplify push` absent                                 | ✓ |
| No leaked AWS access keys (`AKIA[A-Z0-9]{16}`)                     | ✓ |
| `## Getting Started`, `## Learn More`, `## Deploy on Vercel` preserved | ✓ |
| `bun run lint` exit 0                                              | ✓ |
| `bun run typecheck` exit 0                                         | ✓ |
| `bun run audit` exit 0                                             | ✓ |
| `bun run build` exit 0 (4 static pages prerendered)                | ✓ |

## Decisions Made

- **Profile name `datathon-2026`** locked in across all 7 steps so the chain is unambiguous (CONTEXT D-10 left this to Claude's discretion).
- **Both AWS auth flows documented** (Option A access-keys + Option B SSO) so devs aren't forced into one — matches CONTEXT Open Question #3.
- **Region precedence as a blockquote** at the end of step 7, not a separate `###` step, so it doesn't fragment the lifecycle flow but still satisfies G-12.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Rephrased the `bunx ampx` warning to avoid the literal anti-pattern string**

- **Found during:** Task 1 (post-write verification)
- **Issue:** PLAN.md verbatim content included the line `Use \`npx ampx\` (NOT \`bunx ampx\`)` as a warning. But the acceptance criterion `! grep -qF 'bunx ampx' README.md` requires the literal string `bunx ampx` to NOT appear anywhere in README.md. The educational warning was self-defeating: it taught the right thing while failing the automated check.
- **Fix:** Rephrased to: `Always invoke the Amplify CLI through \`npx\` (do not launch it via Bun's binary launcher) — Amplify's CLI tooling currently has rough edges with non-\`npx\` package managers.` This conveys the same guidance (use npx, don't use bunx) without printing the literal `bunx ampx`.
- **Files modified:** README.md
- **Verification:** `grep -F 'bunx ampx' README.md` returns empty (anti-pattern absent); `grep -F 'npx ampx' README.md` still matches 4 instances (positive guidance preserved).
- **Committed in:** c4034c5 (single Task 1 commit — fix applied before commit)

---

**Total deviations:** 1 auto-fixed (1 bug — phrasing conflict between PLAN literal content and PLAN acceptance criteria)
**Impact on plan:** No scope creep. Same intent, different phrasing. The threat-model goal (T-1-15-adjacent: don't accidentally teach devs the wrong command) is preserved by keeping the explicit "do not launch via Bun's binary launcher" guidance.

## Issues Encountered

- **Sandbox refused compound shell `&&` chains** during verification (e.g., `grep -qF X README.md && grep -qF Y README.md && ...`). Worked around by running each grep individually. This is an environment quirk, not a code/plan issue.

## User Setup Required

None — this plan modifies only documentation. The README itself describes the AWS environment setup the developer must perform manually before plan 01-05's manual gate runs.

## Next Phase Readiness

- **Plan 01-05** (Wave E — manual gate + `npx ampx sandbox --once`) is now unblocked from the documentation side. The README contains the complete pre-deploy checklist (AWS CLI install, IAM, profile, env, validation), so plan 05's task 1 manual gate has a documented "where do I get an AWS account" answer.
- No new blockers introduced.

## Self-Check: PASSED

- README.md modification verified: `grep -n '^## ' README.md` → Setup at 3, Getting Started at 108, Learn More at 128, Deploy on Vercel at 137.
- Commit `c4034c5` exists in `git log` (verified via post-commit `git status` — working tree clean for tracked file changes other than the unrelated config.json from SDK init).
- All 4 gates green (lint, typecheck, audit, build outputs above).
- All 19 acceptance criteria from PLAN.md verified individually via grep.

---
*Phase: 01-foundation-amplify-backend-skeleton*
*Completed: 2026-04-25*
