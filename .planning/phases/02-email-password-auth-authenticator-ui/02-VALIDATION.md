---
phase: 2
slug: email-password-auth-authenticator-ui
status: planned
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-25
updated: 2026-04-25
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source of truth: `.planning/phases/02-email-password-auth-authenticator-ui/02-RESEARCH.md` §"Validation Architecture".

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Shell smoke + manual browser session against live sandbox (no unit-test framework — backlog) |
| **Config file** | none — uses `package.json` scripts |
| **Quick run command** | `bun run lint && bun run typecheck` (~10s; no AWS/network) |
| **Full suite command** | Quick + `bun run build` + `bun run audit` + `npx ampx sandbox --once --profile aws-cli-amplify` (~3-5 min including deploy) |
| **Phase gate** | Quick + full all exit 0; CloudFormation stack `UPDATE_COMPLETE`; D-29 manual flows (4) all pass |

---

## Sampling Rate

- **After every task commit:** Run `bun run lint && bun run typecheck` (~10s; no network)
- **After every plan wave:** Run quick + `bun run build` + `bun run audit` (~30-60s)
- **Before `/gsd-verify-work`:** Full suite + sandbox redeploy + 4 manual flows
- **Max feedback latency:** 30s for non-AWS commands (manual flows ~10-15 min wall-clock)

---

## Per-Task Verification Map

> Filled by gsd-planner during plan creation. Task IDs follow `{phase}-{plan}-{task}` (e.g., `2-1-1` = Phase 2, Plan 01, Task 1). All XX placeholders have been replaced with real plan/task IDs.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-1-1 | 01 | 1 (A) | AUTH-01 | T-2-01-01 | `amplify/auth/resource.ts` declares correct shape (email + fullname + EMAIL_ONLY) | smoke | `test -f amplify/auth/resource.ts && grep -q 'defineAuth' amplify/auth/resource.ts && grep -q '"EMAIL_ONLY"' amplify/auth/resource.ts && grep -q 'fullname:' amplify/auth/resource.ts` | ✅ | ⬜ pending |
| 2-1-2 | 01 | 1 (A) | AUTH-01 | T-2-01-01 | `amplify/backend.ts` wires auth resource | smoke | `grep -q 'defineBackend({ auth })' amplify/backend.ts && grep -q "from \"./auth/resource\"" amplify/backend.ts` | ✅ | ⬜ pending |
| 2-1-2 | 01 | 1 (A) | AUTH-01 | T-2-01-01 | Backend TypeScript valid | smoke | `cd amplify && npx --no-install tsc --noEmit` | ✅ | ⬜ pending |
| 2-2-1 | 02 | 2 (B) | AUTH-03 | T-2-02-01 | `aws-amplify` and `@aws-amplify/ui-react` installed in dependencies (NOT devDependencies) | smoke | `node -e "const p=require('./package.json'); process.exit((p.dependencies['aws-amplify']==='^6.16.4' && p.dependencies['@aws-amplify/ui-react']==='^6.15.3' && !p.devDependencies?.['aws-amplify'] && !p.devDependencies?.['@aws-amplify/ui-react']) ? 0 : 1)"` | ✅ | ⬜ pending |
| 2-2-2 | 02 | 2 (B) | AUTH-03 | T-2-02-02 | `bun audit` clean (existing 24 ignores + any new v6 advisories with justification) | smoke | `bun run audit` | ✅ | ⬜ pending |
| 2-3-1 | 03 | 3 (C) | AUTH-03 | T-2-03-01, T-2-03-03, T-2-03-08 | `AmplifyProvider` exists at root + `Amplify.configure({ssr:true})` + `Authenticator.Provider` wraps children | smoke | `test -f app/AmplifyProvider.tsx && grep -q 'Amplify.configure(outputs, { ssr: true })' app/AmplifyProvider.tsx && grep -q 'Authenticator.Provider' app/AmplifyProvider.tsx && grep -q 'export function AmplifyProvider' app/AmplifyProvider.tsx` | ✅ | ⬜ pending |
| 2-3-2 | 03 | 3 (C) | AUTH-03 | T-2-03-01, T-2-03-07 | `app/layout.tsx` mounts AmplifyProvider + imports Amplify CSS, preserves existing scaffold | smoke | `grep -q 'import { AmplifyProvider } from "./AmplifyProvider"' app/layout.tsx && grep -q '@aws-amplify/ui-react/styles.css' app/layout.tsx && grep -q 'title: "Create Next App"' app/layout.tsx` | ✅ | ⬜ pending |
| 2-3-3 | 03 | 3 (C) | AUTH-03 | T-2-03-04, T-2-03-08 | `app/login/page.tsx` exists, uses `<Authenticator>` + `useAuthenticator` selector + redirect | smoke | `test -f app/login/page.tsx && grep -q '<Authenticator' app/login/page.tsx && grep -q 'router.push("/app")' app/login/page.tsx && ! grep -q 'from "next/router"' app/login/page.tsx` | ✅ | ⬜ pending |
| 2-3-4 | 03 | 3 (C) | AUTH-05 | T-2-03-05, T-2-03-06 | `app/app/page.tsx` placeholder exists with sign-out (await + push) | smoke | `test -f app/app/page.tsx && test -f app/app/SignOutButton.tsx && grep -q 'await signOut()' app/app/SignOutButton.tsx && grep -q 'from "aws-amplify/auth"' app/app/SignOutButton.tsx` | ✅ | ⬜ pending |
| 2-3-5 | 03 | 3 (C) | AUTH-03 | — | `app/page.tsx` has Sign-in link to /login (Claude's discretion per D-16) + repo gauntlet green | smoke | `grep -q 'import Link from "next/link"' app/page.tsx && grep -q 'href="/login"' app/page.tsx && bun run lint && bun run typecheck && bun run build && bun run audit` | ✅ | ⬜ pending |
| 2-4-1 | 04 | 4 (D) | AUTH-01 | T-2-04-01 | AWS pre-flight check: identity reachable + sandbox stack in deployable state | integration (requires AWS) | `aws sts get-caller-identity --profile aws-cli-amplify --query 'Account' --output text \| grep -q '^992839645871$'` | ⚠ requires AWS | ⬜ pending |
| 2-4-2 | 04 | 4 (D) | AUTH-01 | T-2-04-01, T-2-04-04 | Sandbox redeploys cleanly with auth resource | integration (requires AWS) | `AWS_PROFILE=aws-cli-amplify npx ampx sandbox --once --profile aws-cli-amplify` (exit 0) + `aws cloudformation describe-stacks ... \| grep -qE '_COMPLETE$'` | ⚠ requires AWS | ⬜ pending |
| 2-4-3 | 04 | 4 (D) | AUTH-01 | T-2-04-02 | Cognito User Pool exists in AWS + amplify_outputs.json populated correctly + remains gitignored + repo gates green | integration | `aws cognito-idp list-user-pools --max-results 10 --profile aws-cli-amplify --region us-east-1 --query 'UserPools[?contains(Name, \`amplify-datathon2026-fernando\`)] \| length(@)' --output text` (>=1) AND `node -e "const o=require('./amplify_outputs.json'); process.exit(o.auth?.user_pool_id?.startsWith('us-east-1_') ? 0 : 1)"` AND `git check-ignore -v amplify_outputs.json` AND `bun run lint && typecheck && build && audit` | ⚠ requires AWS (after deploy) | ⬜ pending |
| 2-5-1 | 05 | 5 (E) | AUTH-03 | T-2-05-01, T-2-05-02, T-2-05-05 | D-29 flow #1 — Sign-up + email verify + sign-in works end-to-end | manual | Open `/login`, sign up with `<dev-email>+phase2-test1@…`, receive code (check spam), enter, see redirect to `/app` showing user name | manual | ⬜ pending |
| 2-5-2 | 05 | 5 (E) | AUTH-05 | T-2-05-05 | D-29 flow #2 — Sign-out then re-sign-in succeeds | manual | From `/app` click Sign out → land on `/`, navigate to `/login`, sign in → land on `/app` | manual | ⬜ pending |
| 2-5-3 | 05 | 5 (E) | AUTH-05 | T-2-05-04, T-2-05-05 | D-29 flow #3 — Refresh post-sign-in stays logged in (cookie storage validates L-3) | manual | Post-sign-in browser refresh on `/app` does NOT redirect to `/login`; user data still present; (optional) DevTools confirms cookies (NOT localStorage) | manual | ⬜ pending |
| 2-5-4 | 05 | 5 (E) | AUTH-03 | T-2-05-01, T-2-05-02, T-2-05-05 | D-29 flow #4 — Reset password flow works | manual | "Forgot password?" → enter email → receive code (check spam) → set new password → sign in with new | manual | ⬜ pending |
| 2-5-5 | 05 | 5 (E) | AUTH-05 | T-2-05-06 | CONTEXT D-28 wording corrected to reflect cookie storage (per L-3 supersession) | smoke | `grep -q 'tokens guardados en \*\*cookies\*\*' .planning/phases/02-email-password-auth-authenticator-ui/02-CONTEXT.md && grep -q 'L-3' .planning/phases/02-email-password-auth-authenticator-ui/02-CONTEXT.md` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] None — all validation tools already present (Bun ≥1.3 + bun audit, Node ≥20.6, npx, AWS CLI v2 from Phase 1)
- [x] AWS account access — required for Wave 4 (D) + Wave 5 (E). Already satisfied (profile `aws-cli-amplify`, account 992839645871, us-east-1).
- [x] Real email inbox — required for Wave 5 (E) manual flows. Developer's own email with `+phase2-test1`/`+phase2-test2` aliases recommended.
- [x] Cognito email deliverability acknowledged — emails from `no-reply@verificationemail.com` may land in spam; plan instructions warn the developer (per L-5).

*No new fixtures, test framework, or installs needed beyond `aws-amplify` + `@aws-amplify/ui-react` (which Wave 2 / Plan 02-02 installs).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sign-up + email verification + sign-in (D-29 #1) | AUTH-03 | Requires real email inbox, browser UI, human action | After Wave 4 (Plan 02-04) deploys auth: open browser to `http://localhost:3000/login`, click "Create Account", use `<your-email>+phase2-test1@example.com`, fill name + strong password, submit. Check inbox (and spam folder) for code from `no-reply@verificationemail.com`. Enter code. Should redirect to `/app` showing your name. |
| Sign-out + re-sign-in (D-29 #2) | AUTH-05 | UI interaction, browser session | From `/app`, click Sign out button. Should land on home `/`. Navigate to `/login`. Sign in with the same credentials. Should land back on `/app`. |
| Refresh persistence (D-29 #3) | AUTH-05 | Browser refresh, cookie storage check | Post-sign-in on `/app`, hit browser Refresh (Ctrl+R or Cmd+R). Page should NOT redirect to `/login`; user data (name, email) still visible. Optionally inspect DevTools → Application → Cookies to see `CognitoIdentityServiceProvider.*` cookies (this confirms the L-3 ssr:true behavior — storage is COOKIES, not localStorage as CONTEXT D-28 originally claimed). |
| Reset password (D-29 #4) | AUTH-03 | Real email + multi-step flow | On `/login`, click "Forgot password?". Enter `<your-email>+phase2-test1@example.com`. Check inbox (and spam folder) for code. Enter code + new password (must satisfy default policy: 8+ chars, upper, lower, digit, symbol). Sign in with new password. Should land on `/app`. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or are marked manual with explicit instructions
- [x] Sampling continuity: no 3 consecutive auto tasks without automated verify (Wave 5 / Plan 02-05 is manual-only by design; the CONTEXT edit task in 02-05-Task-5 is automated)
- [x] Wave 0 covers all MISSING references (none for this phase)
- [x] No watch-mode flags in any verify command (`--once` used for ampx; `--max-warnings=0` is strict not watch)
- [x] Feedback latency < 30s for non-AWS commands; manual flows batched at end of phase (all in Plan 02-05)
- [x] `nyquist_compliant: true` set in frontmatter (planner has filled per-task table with real IDs)

**Approval:** validated by gsd-planner on 2026-04-25 — ready for executor.
