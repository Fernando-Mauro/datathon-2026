---
phase: 1
slug: foundation-amplify-backend-skeleton
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-25
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
| **Estimated runtime** | ~30 seconds (quick: ~10s; full: ~30s; sandbox deploy: ~2 min, requires AWS) |

---

## Sampling Rate

- **After every task commit:** Run `bun run lint && bun run typecheck && bun run audit` (~10s; no AWS call)
- **After every plan wave:** Run quick + `bun run build` (~30s)
- **Before `/gsd-verify-work`:** Full suite + `npx ampx sandbox --once` (requires AWS account)
- **Max feedback latency:** 30 seconds (excluding sandbox deploy gated to phase end)

---

## Per-Task Verification Map

> Filled by gsd-planner during plan creation. Stub rows below seeded from RESEARCH.md §"Phase Requirements → Validation Map" — planner replaces with task-keyed entries (`{N}-{plan}-{task}`).

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-XX-XX | XX | A | INFRA-03 | — | PostCSS XSS GHSA-qx2v-qp2m-jg93 closed | smoke | `bun audit --audit-level=moderate` | ✅ | ⬜ pending |
| 1-XX-XX | XX | A | INFRA-03 | — | postcss resolved to ≥ 8.5.10 | smoke | `bun pm ls \| grep postcss` | ✅ | ⬜ pending |
| 1-XX-XX | XX | C | INFRA-01 | — | `amplify/backend.ts` exists with `defineBackend({})` | smoke | `test -f amplify/backend.ts && grep -q 'defineBackend({})' amplify/backend.ts` | ✅ | ⬜ pending |
| 1-XX-XX | XX | C | INFRA-01 | — | `amplify/package.json` declares ESM | smoke | `node -e "process.exit(JSON.parse(require('fs').readFileSync('amplify/package.json')).type === 'module' ? 0 : 1)"` | ✅ | ⬜ pending |
| 1-XX-XX | XX | C | INFRA-01 | — | Backend TypeScript valid | smoke | `cd amplify && npx tsc --noEmit` | ✅ | ⬜ pending |
| 1-XX-XX | XX | E | INFRA-01 | — | Sandbox deploys cleanly | integration | `AWS_PROFILE=$P npx ampx sandbox --once` (exit 0) | ⚠ requires AWS | ⬜ pending |
| 1-XX-XX | XX | A | ROADMAP §1 SC4 | — | `bun run lint` green with `--max-warnings=0` | smoke | `bun run lint` | ✅ | ⬜ pending |
| 1-XX-XX | XX | C/D | ROADMAP §1 SC4 | — | `bun run build` green after Amplify added | smoke | `bun run build` | ✅ | ⬜ pending |
| 1-XX-XX | XX | B | D-04 | — | error/loading/not-found boundaries exist | smoke | `for f in app/error.tsx app/loading.tsx app/not-found.tsx; do test -f $f \|\| exit 1; done` | ✅ | ⬜ pending |
| 1-XX-XX | XX | A | D-09 | — | `audit` and `typecheck` scripts present | smoke | `node -e "['audit','typecheck'].every(s => s in require('./package.json').scripts) \|\| process.exit(1)"` | ✅ | ⬜ pending |
| 1-XX-XX | XX | B | D-03 | — | `.env.example` documents AWS_PROFILE/REGION + warns about credentials | smoke | `test -f .env.example && grep -q AWS_PROFILE .env.example && grep -q AWS_REGION .env.example && grep -qi 'NOT.*credentials' .env.example` | ✅ | ⬜ pending |
| 1-XX-XX | XX | B | D-07/D-08 | — | gitignore covers Amplify outputs and `.env*` allow-lists `.env.example` | smoke | `for p in '.amplify' 'amplify_outputs' '!.env.example'; do grep -qF "$p" .gitignore \|\| exit 1; done` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] None — all validation tools already present (Bun ≥1.3 has `bun audit`, Node ≥20.6, `npx`, optional AWS CLI)
- [ ] AWS account access — required to validate INFRA-01 end-to-end (Wave E). Developer must complete README §"Setup AWS" steps before Wave E runs.

*No new fixtures, test files, or framework installs needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| AWS sandbox deploys an empty CloudFormation stack | INFRA-01 | Requires AWS account credentials configured locally | After completing README §Setup, run `AWS_PROFILE=datathon-2026 npx ampx sandbox --once`. Expect: exit code 0, `amplify_outputs.json` generated at repo root, CloudFormation stack visible at `https://console.aws.amazon.com/cloudformation/home?region=us-east-1` named `amplify-datathon-2026-{whoami}-sandbox`. CDK bootstrap takes 5-8 min on first run per region. |
| AWS CLI installed and IAM user reachable | Setup precondition | Per-developer environment | `aws sts get-caller-identity --profile datathon-2026` returns the IAM user's ARN with exit code 0. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or are marked manual with explicit instructions
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (none for this phase)
- [ ] No watch-mode flags in any verify command
- [ ] Feedback latency < 30s for non-AWS commands
- [ ] `nyquist_compliant: true` set in frontmatter once planner has filled per-task table

**Approval:** pending
