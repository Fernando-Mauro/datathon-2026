---
phase: 1
slug: foundation-amplify-backend-skeleton
status: planned
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-25
last_updated: 2026-04-25
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source of truth: `.planning/phases/01-foundation-amplify-backend-skeleton/01-RESEARCH.md` §"Validation Architecture".

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Shell-driven smoke tests (no unit-test framework — testing infra is a CONCERNS.md backlog item, not Phase 1 scope) |
| **Config file** | none — commands run via `package.json` scripts |
| **Quick run command** | `bun run lint && bun run typecheck && bun run audit` |
| **Full suite command** | `bun run lint && bun run typecheck && bun run audit && bun run build` |
| **Estimated runtime** | ~30 seconds (quick: ~10s; full: ~30s; sandbox deploy: 5-8 min on first-ever run in a region, ~1-2 min on subsequent runs) |

---

## Sampling Rate

- **After every task commit:** Run `bun run lint && bun run typecheck && bun run audit` (~10s; no AWS call)
- **After every plan wave:** Run quick + `bun run build` (~30s)
- **Before `/gsd-verify-work`:** Full suite + `npx ampx sandbox --once` (requires AWS account; gated to plan 05)
- **Max feedback latency:** 30 seconds (excluding sandbox deploy gated to plan 05)

---

## Per-Task Verification Map

> Filled by gsd-planner during plan creation. Task IDs follow `{phase}-{plan}-{task}` (e.g., `1-1-1` = Phase 1, Plan 01, Task 1).

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-1-1   | 01   | A    | INFRA-03 | T-1-01 | PostCSS XSS GHSA-qx2v-qp2m-jg93 closed (postcss bumped to >= 8.5.10) | smoke | `bun audit --audit-level=moderate && bun pm ls \| grep -E "postcss@(8\.[5-9]\.\|[1-9][0-9]+\.\|9\.\|[1-9][0-9])" \| head -1` | ✅ Wave 0 (Bun built-in) | ⬜ pending |
| 1-1-2   | 01   | A    | INFRA-03 / D-02 / D-09 | T-1-03 | Strict lint + typecheck + audit + clean scripts present and green on clean scaffold | smoke | `bun run lint && bun run typecheck && bun run audit && node -e "const s=require('./package.json').scripts; if(s.lint!=='eslint . --max-warnings=0')process.exit(1); if(!s.typecheck\|\|!s.audit\|\|!s.clean)process.exit(2)"` | ✅ | ⬜ pending |
| 1-2-1   | 02   | B    | INFRA-01 / D-04 | T-1-07, T-1-08 | error/loading/not-found boundaries exist using Next 16.2 conventions (`unstable_retry`, NOT `reset`); next/link in not-found | smoke | `test -f app/error.tsx && test -f app/loading.tsx && test -f app/not-found.tsx && head -1 app/error.tsx \| grep -qF '"use client";' && grep -qF 'unstable_retry' app/error.tsx && ! grep -qF 'reset' app/error.tsx && grep -qF 'from "next/link"' app/not-found.tsx && bun run lint && bun run typecheck && bun run build` | ✅ | ⬜ pending |
| 1-2-2   | 02   | B    | INFRA-01 / D-03 / D-07 / D-08 | T-1-04, T-1-05, T-1-06 | `.env.example` documents AWS_PROFILE/REGION + warns about credentials; gitignore covers Amplify outputs and allow-lists `.env.example` | smoke | `test -f .env.example && grep -qF 'AWS_PROFILE=datathon-2026' .env.example && grep -qF 'AWS_REGION=us-east-1' .env.example && grep -qiE 'NOT.*credentials' .env.example && grep -qF '.amplify' .gitignore && grep -qF 'amplify_outputs*' .gitignore && grep -qF '!.env.example' .gitignore && ! git check-ignore -q .env.example && git check-ignore -q amplify_outputs.json` | ✅ | ⬜ pending |
| 1-3-1   | 03   | C    | INFRA-01 / D-05 / D-06 | T-1-12, T-1-13 | Amplify Gen 2 devDeps installed via Bun (NOT npm create amplify); aws-cdk-lib pinned exactly 2.244.0; aws-amplify (frontend) NOT installed; no package-lock.json | smoke | `node -e "const d=require('./package.json').devDependencies; ['@aws-amplify/backend','@aws-amplify/backend-cli','aws-cdk-lib','constructs','tsx','esbuild'].forEach(p=>{if(!d[p])throw new Error('missing '+p)}); if(d['aws-cdk-lib']!=='2.244.0')throw new Error('pin '+d['aws-cdk-lib']); if(d['aws-amplify'])throw new Error('frontend client must not be in Phase 1')" && ! test -f package-lock.json && bun run lint && bun run typecheck && bun run build && bun run audit` | ✅ | ⬜ pending |
| 1-3-2   | 03   | C    | INFRA-01 / D-05 / D-06 | T-1-09, T-1-10, T-1-11 | `amplify/backend.ts` exists with `defineBackend({})`; `amplify/package.json` declares ESM; `amplify/tsconfig.json` correct; root tsconfig excludes `amplify/**/*`; no auth/data/storage subdirs | smoke | `test -f amplify/backend.ts && grep -qF 'defineBackend({})' amplify/backend.ts && grep -qF 'from "@aws-amplify/backend"' amplify/backend.ts && ! test -d amplify/auth && ! test -d amplify/data && ! test -d amplify/storage && node -e "if(require('./amplify/package.json').type!=='module')process.exit(1)" && node -e "const t=require('./amplify/tsconfig.json'); if(!t.compilerOptions.paths['\$amplify/*'])process.exit(1)" && node -e "if(!require('./tsconfig.json').exclude.includes('amplify/**/*'))process.exit(1)" && (cd amplify && npx --no-install tsc --noEmit) && bun run build` | ✅ | ⬜ pending |
| 1-4-1   | 04   | D    | INFRA-01 / D-10 / D-11 | T-1-14, T-1-15, T-1-16, T-1-17, T-1-18 | README §Setup section before Getting Started, covers AWS CLI install + IAM + profile + verify + env + sandbox + teardown; uses `npx ampx` (NOT `bunx`); no Gen 1 commands; no leaked AWS keys | smoke | `SETUP=$(grep -n '^## Setup' README.md \| head -1 \| cut -d: -f1) && GS=$(grep -n '^## Getting Started' README.md \| head -1 \| cut -d: -f1) && [ "$SETUP" -lt "$GS" ] && grep -qF 'AmplifyBackendDeployFullAccess' README.md && grep -qF 'AWS_PROFILE=datathon-2026 npx ampx sandbox' README.md && grep -qF '5-8 min' README.md && grep -qF 'awscli-exe-linux-x86_64.zip' README.md && grep -qiE 'aws configure sso' README.md && ! grep -qF 'bunx ampx' README.md && ! grep -qF 'amplify init' README.md && ! grep -qE 'AKIA[A-Z0-9]{16}' README.md` | ✅ | ⬜ pending |
| 1-5-1   | 05   | E    | INFRA-01 (manual gate) | T-1-19 | Developer confirms AWS CLI v2 installed + IAM user + `aws configure --profile datathon-2026` + `aws sts get-caller-identity` returns OK + `.env.local` exists | manual | Resume signal: paste output of `aws sts get-caller-identity --profile datathon-2026` (JSON with Account/UserId/Arn — no secrets) | ⚠ requires AWS account | ⬜ pending |
| 1-5-2   | 05   | E    | INFRA-01 / ROADMAP §1 SC3 | T-1-20, T-1-21, T-1-22, T-1-24 | `npx ampx sandbox --once` deploys CloudFormation stack; `amplify_outputs.json` generated at root and gitignored; backend files unchanged; repo gates still green | integration (requires AWS) | `AWS_PROFILE_VALUE=$(grep '^AWS_PROFILE=' .env.local \| head -1 \| cut -d= -f2-) && AWS_REGION_VALUE=$(grep '^AWS_REGION=' .env.local \| head -1 \| cut -d= -f2-) && aws sts get-caller-identity --profile "$AWS_PROFILE_VALUE" && test -f amplify_outputs.json && git check-ignore -q amplify_outputs.json && aws cloudformation list-stacks --profile "$AWS_PROFILE_VALUE" --region "$AWS_REGION_VALUE" --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --query "StackSummaries[?contains(StackName, 'sandbox')].StackName" --output text \| grep -q . && bun run lint && bun run typecheck && bun run build && bun run audit` | ⚠ requires AWS account | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

### Coverage check

- **INFRA-03** (PostCSS CVE): covered by 1-1-1.
- **INFRA-01** (Amplify Gen 2 backend skeleton + sandbox-deployable):
  - File-existence + structure: 1-3-1, 1-3-2
  - Boundaries + env + gitignore that wraps Amplify outputs: 1-2-1, 1-2-2
  - Documentation prerequisite for sandbox deploy: 1-4-1
  - End-to-end deploy validation: 1-5-1 (manual gate) + 1-5-2 (automated post-gate)
- **ROADMAP §Phase 1 Success Criteria 1-4**: criterion 1 → 1-1-1; criterion 2 → 1-3-2; criterion 3 → 1-5-2; criterion 4 → 1-1-1, 1-1-2, 1-3-1, 1-3-2 (every plan re-runs `bun run build && bun run lint`).

### Sampling continuity (Nyquist)

- No 3 consecutive tasks lack automated verification: every task except 1-5-1 (the explicit manual gate) has an `<automated>` block. 1-5-1 is the ONE truly manual task in the phase, and it is followed immediately by 1-5-2 which is fully automated.
- Feedback latency: every non-AWS automated command targets < 30s. The AWS command in 1-5-2 is bounded by AWS itself (5-8 min worst case, first-run-only).

---

## Wave 0 Requirements

- [x] None — all validation tools already present (Bun ≥1.3 has `bun audit`, Node ≥20.6, `npx`, optional AWS CLI to be installed by developer in plan 05's manual gate)
- [x] AWS account access — surfaced as plan 05 task 1 (manual gate). Developer must complete README §Setup steps 1-5 before plan 05 task 2 can run.

*No new fixtures, test files, or framework installs needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| AWS sandbox deploys an empty CloudFormation stack | INFRA-01 | Requires AWS account credentials configured locally; first deploy takes 5-8 min for CDK bootstrap | After completing README §Setup, run `AWS_PROFILE=datathon-2026 npx ampx sandbox --once --profile datathon-2026`. Expect: exit code 0, `amplify_outputs.json` generated at repo root, CloudFormation stack visible at `https://console.aws.amazon.com/cloudformation/home?region=us-east-1` containing `sandbox` in its name. CDK bootstrap takes 5-8 min on first run per region. |
| AWS CLI installed and IAM user reachable | Setup precondition (plan 05 task 1) | Per-developer environment; Claude cannot install AWS CLI or write `~/.aws/credentials` | `aws sts get-caller-identity --profile datathon-2026` returns the IAM user's ARN with exit code 0. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify, OR are marked manual with explicit instructions (only 1-5-1 is manual; it has an explicit resume signal)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (verified above)
- [x] Wave 0 covers all MISSING references (none for this phase — all tooling pre-existing or installed by manual gate)
- [x] No watch-mode flags in any verify command (plan 05 explicitly uses `--once`, NOT default watch mode)
- [x] Feedback latency < 30s for non-AWS commands (full Phase 1 quick-suite ~30s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** planned (PLAN.md files 01-05 reference this validation contract; ready for execution)
