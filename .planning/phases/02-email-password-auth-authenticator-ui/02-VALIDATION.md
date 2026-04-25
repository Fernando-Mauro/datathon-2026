---
phase: 2
slug: email-password-auth-authenticator-ui
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-25
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

> Filled by gsd-planner during plan creation. Task IDs follow `{phase}-{plan}-{task}` (e.g., `2-1-1` = Phase 2, Plan 01, Task 1). Stub rows seeded from RESEARCH §"Validation Architecture" — planner replaces `XX` placeholders with real plan/task IDs.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-XX-XX | XX | A | AUTH-01 | — | `amplify/auth/resource.ts` declares correct shape (email + fullname + EMAIL_ONLY) | smoke | `test -f amplify/auth/resource.ts && grep -q 'defineAuth' amplify/auth/resource.ts && grep -q '"EMAIL_ONLY"' amplify/auth/resource.ts && grep -q 'fullname' amplify/auth/resource.ts` | ✅ | ⬜ pending |
| 2-XX-XX | XX | A | AUTH-01 | — | `amplify/backend.ts` wires auth resource | smoke | `grep -q 'defineBackend({ auth })' amplify/backend.ts && grep -q "from \"./auth/resource\"" amplify/backend.ts` | ✅ | ⬜ pending |
| 2-XX-XX | XX | A | AUTH-01 | — | Backend TypeScript valid | smoke | `cd amplify && npx --no-install tsc --noEmit` | ✅ | ⬜ pending |
| 2-XX-XX | XX | B | AUTH-03 | — | `aws-amplify` and `@aws-amplify/ui-react` installed in dependencies | smoke | `node -e "const p=require('./package.json'); process.exit(p.dependencies['aws-amplify'] && p.dependencies['@aws-amplify/ui-react'] ? 0 : 1)"` | ✅ | ⬜ pending |
| 2-XX-XX | XX | C | AUTH-03 | — | `AmplifyProvider` exists at root + `Amplify.configure({ssr:true})` + `Authenticator.Provider` wraps children | smoke | `grep -rq 'Amplify.configure' app/ && grep -rq 'ssr: true' app/ && grep -rq 'Authenticator.Provider' app/` | ✅ | ⬜ pending |
| 2-XX-XX | XX | C | AUTH-03 | — | `app/login/page.tsx` exists and uses `<Authenticator>` | smoke | `test -f app/login/page.tsx && grep -q '<Authenticator' app/login/page.tsx` | ✅ | ⬜ pending |
| 2-XX-XX | XX | C | AUTH-05 | — | `app/app/page.tsx` placeholder exists with sign-out | smoke | `test -f app/app/page.tsx && grep -rq 'signOut' app/app/` | ✅ | ⬜ pending |
| 2-XX-XX | XX | C | AUTH-03 | — | `@aws-amplify/ui-react/styles.css` imported in app tree | smoke | `grep -rq "@aws-amplify/ui-react/styles.css" app/` | ✅ | ⬜ pending |
| 2-XX-XX | XX | C | AUTH-03 | — | `bun run lint && typecheck && build && audit` all green | smoke | `bun run lint && bun run typecheck && bun run build && bun run audit` | ✅ | ⬜ pending |
| 2-XX-XX | XX | D | AUTH-01 | — | Sandbox redeploys cleanly with auth resource | integration (requires AWS) | `AWS_PROFILE=aws-cli-amplify npx ampx sandbox --once --profile aws-cli-amplify` (exit 0) | ⚠ requires AWS | ⬜ pending |
| 2-XX-XX | XX | D | AUTH-01 | — | Cognito User Pool exists in AWS | integration | `aws cognito-idp list-user-pools --max-results 10 --profile aws-cli-amplify --region us-east-1 --query 'UserPools[?contains(Name, \`amplify-datathon2026-fernando\`)] \| length(@)' --output text` (>= 1) | ⚠ requires AWS | ⬜ pending |
| 2-XX-XX | XX | D | AUTH-01 | — | `amplify_outputs.json` populated with `auth.user_pool_id` | smoke (post-deploy) | `node -e "const o=require('./amplify_outputs.json'); process.exit(o.auth?.user_pool_id ? 0 : 1)"` | ✅ (after deploy) | ⬜ pending |
| 2-XX-XX | XX | E | AUTH-03 | — | D-29 flow #1 — Sign-up + email verify + sign-in works end-to-end | manual | Open `/login`, sign up with `<email>+phase2-test1@…`, receive code (check spam), enter, see redirect to `/app` showing user name | manual | ⬜ pending |
| 2-XX-XX | XX | E | AUTH-05 | — | D-29 flow #2 — Sign-out then re-sign-in succeeds | manual | From `/app` click Sign out → land on `/`, navigate to `/login`, sign in → land on `/app` | manual | ⬜ pending |
| 2-XX-XX | XX | E | AUTH-05 | — | D-29 flow #3 — Refresh post-sign-in stays logged in (cookie storage) | manual | Post-sign-in browser refresh on `/app` does NOT redirect to `/login`; user data still present | manual | ⬜ pending |
| 2-XX-XX | XX | E | AUTH-03 | — | D-29 flow #4 — Reset password flow works | manual | "Forgot password?" → enter email → receive code (check spam) → set new password → sign in with new | manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] None — all validation tools already present (Bun ≥1.3 + bun audit, Node ≥20.6, npx, AWS CLI v2 from Phase 1)
- [ ] AWS account access — required for Wave D + E (integration + manual). Already satisfied (profile `aws-cli-amplify`).
- [ ] Real email inbox — required for Wave E manual flows. Developer's own email with `+phase2-test1`/`+phase2-test2` aliases recommended.
- [ ] Cognito email deliverability — emails from `no-reply@verificationemail.com` may land in spam; plan instructions warn the developer.

*No new fixtures, test framework, or installs needed beyond `aws-amplify` + `@aws-amplify/ui-react` (which Wave B installs).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sign-up + email verification + sign-in (D-29 #1) | AUTH-03 | Requires real email inbox, browser UI, human action | After Wave D deploys auth: open browser to `http://localhost:3000/login`, click "Create Account", use `<your-email>+phase2-test1@example.com`, fill name + strong password, submit. Check inbox (and spam folder) for code from `no-reply@verificationemail.com`. Enter code. Should redirect to `/app` showing your name. |
| Sign-out + re-sign-in (D-29 #2) | AUTH-05 | UI interaction, browser session | From `/app`, click Sign out button. Should land on home `/`. Navigate to `/login`. Sign in with the same credentials. Should land back on `/app`. |
| Refresh persistence (D-29 #3) | AUTH-05 | Browser refresh, cookie storage check | Post-sign-in on `/app`, hit browser Refresh (Ctrl+R or Cmd+R). Page should NOT redirect to `/login`; user data (name, email) still visible. Optionally inspect DevTools → Application → Cookies to see `CognitoIdentityServiceProvider.*` cookies. |
| Reset password (D-29 #4) | AUTH-03 | Real email + multi-step flow | On `/login`, click "Forgot password?". Enter `<your-email>+phase2-test1@example.com`. Check inbox (and spam folder) for code. Enter code + new password (must satisfy default policy: 8+ chars, upper, lower, digit, symbol). Sign in with new password. Should land on `/app`. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or are marked manual with explicit instructions
- [ ] Sampling continuity: no 3 consecutive auto tasks without automated verify (Wave E is manual-only by design)
- [ ] Wave 0 covers all MISSING references (none for this phase)
- [ ] No watch-mode flags in any verify command
- [ ] Feedback latency < 30s for non-AWS commands; manual flows batched at end of phase
- [ ] `nyquist_compliant: true` set in frontmatter once planner has filled per-task table

**Approval:** pending
