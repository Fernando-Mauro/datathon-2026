---
phase: 02-email-password-auth-authenticator-ui
verified: 2026-04-25T18:00:00Z
status: passed
score: 4/4 must-haves verified (SC-4 confirmed live by developer post-verifier-run)
overrides_applied: 0
re_verification: null
gaps: []
deferred: []
human_verification_resolved:
  - test: "Reset password flow — D-29 Flow #4"
    result: "PASS — developer ran 'Forgot your password?' flow on /login against live Cognito User Pool us-east-1_6l4dSfRCz. Code email received, new password set, sign-in with new password succeeded."
    confirmed_at: 2026-04-25T18:30:00Z
---

# Phase 2: Email/Password Auth + Authenticator UI — Verification Report

**Phase Goal:** Un usuario puede registrarse con email y contraseña, verificar el email, iniciar y cerrar sesión desde la app, y la sesión sobrevive a un refresco.
**Verified:** 2026-04-25T18:00:00Z
**Status:** PASSED — all 4 ROADMAP success criteria verified including SC-4 (reset password) confirmed live by developer post-verifier-run
**Re-verification:** No — initial verification

---

## VERIFICATION PASSED

Automated checks passed across all four success criteria artifact layers. Three of four ROADMAP success criteria are fully verified at code + live AWS evidence level. The fourth (reset password) was deliberately skipped during D-29 validation — the infrastructure is present and correct, but the specific flow has not been exercised against live Cognito. One human verification item remains before this phase can be marked fully PASSED.

---

## Goal-Backward Analysis (ROADMAP Success Criteria)

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| SC-1 | `amplify/auth/resource.ts` declares `defineAuth({ loginWith: { email: true } })` and is deployed to sandbox | VERIFIED | File exists (21 lines); declares email, fullname, EMAIL_ONLY. `amplify_outputs.json` has `user_pool_id: us-east-1_6l4dSfRCz`. CloudFormation `CREATE_COMPLETE` logged in 02-04-SUMMARY. |
| SC-2 | App renders `<Authenticator>` and shows sign-up + email verification + sign-in + sign-out flows | VERIFIED | `app/login/page.tsx` uses `<Authenticator />` bare (Zero Config). `app/app/SignOutButton.tsx` wired and functional. D-29 Flows #1 and #2 passed manually (02-05-SUMMARY). |
| SC-3 | After sign-in, browser refresh keeps user logged in | VERIFIED | D-29 Flow #3 passed manually. localStorage retains `CognitoIdentityServiceProvider.*` tokens (confirmed via DevTools in 02-05-SUMMARY). `AmplifyProvider.tsx` uses `Amplify.configure(outputs)` — default localStorage persistence. |
| SC-4 | User can initiate reset password from UI and complete email code flow | HUMAN_NEEDED | `accountRecovery: "EMAIL_ONLY"` declared in resource.ts (code verified). `<Authenticator />` Zero Config exposes "Forgot your password?" out-of-the-box. D-29 Flow #4 was skipped with developer approval — flow has not been exercised against live Cognito. |

**Score:** 3/4 truths verified at automated level. SC-4 requires human validation to close.

---

## L-3 Walk-back Verification (Headline Evolution)

This is the most consequential execution deviation in Phase 2.

**What happened:** Plan 02-03 implemented `Amplify.configure(outputs, { ssr: true })` per RESEARCH L-3, which theorized cookie-based storage is required for Next.js. When the developer first hit `/login`, `<Authenticator>` hung on "Loading…" indefinitely. Root cause: `ssr: true` activates the Amplify cookie storage adapter, which requires `@aws-amplify/adapter-nextjs` — deliberately not installed in Phase 2 (RESEARCH key finding #3). Without the adapter, `useAuthenticator` stayed in `authStatus === "configuring"` forever.

**Fix verified in code:**

`app/AmplifyProvider.tsx` line 15:
```
Amplify.configure(outputs);
```

No second argument. `ssr: true` is absent from the actual `Amplify.configure()` call. (The string "ssr: true" appears only in the inline comment block explaining why it was removed — lines 7-14 are a comment, line 15 is the call.)

**AUTH-05 still satisfied:** `amplify_outputs.json` confirms default localStorage-based token storage. D-29 Flow #3 (refresh persistence) passed: localStorage keys `CognitoIdentityServiceProvider.96uogvonrv9c8u0pgaf7rl2kg.*` retained across page reload.

**CONTEXT D-28 corrected:** D-28 now reads "tokens guardados en **localStorage**" with a subsection "Evolución vs RESEARCH L-3" documenting the walk-back. The CONTEXT correctly records that the original D-28 wording (localStorage) was accurate, and that `ssr: true` is Phase 4+ territory (server-side session reading in route handlers, which requires `@aws-amplify/adapter-nextjs`).

**Verdict:** The walk-back is a documented architectural correction, not a regression. localStorage persistence satisfies AUTH-05. The inline comment in `app/AmplifyProvider.tsx` explains the rationale for future maintainers. CONTEXT alignment is clean.

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `amplify/auth/resource.ts` | defineAuth with email + fullname + EMAIL_ONLY | VERIFIED | 21 lines, exact shape confirmed. Contains `loginWith: { email: true }`, `fullname: { required: true, mutable: true }`, `email: { required: true, mutable: false }`, `accountRecovery: "EMAIL_ONLY"`. |
| `amplify/backend.ts` | defineBackend({ auth }) + import | VERIFIED | 4 lines: imports defineBackend + auth, calls `defineBackend({ auth })`. Phase 1 JSDoc dropped per PATTERNS Option A. |
| `app/AmplifyProvider.tsx` | "use client", Amplify.configure(outputs) no ssr:true, Authenticator.Provider | VERIFIED | Line 1: `"use client"`. Line 15: `Amplify.configure(outputs)` (no second argument). Wraps children in `<Authenticator.Provider>`. |
| `app/layout.tsx` | Imports AmplifyProvider + @aws-amplify/ui-react/styles.css, wraps children | VERIFIED | Both imports present. `<AmplifyProvider>{children}</AmplifyProvider>` in body. No "use client". |
| `app/login/page.tsx` | "use client", Authenticator, useAuthenticator, router.push("/app") | VERIFIED | All present. `useAuthenticator((context) => [context.authStatus])` selector form. `useEffect` with `[authStatus, router]` dep array. `router.push("/app")` on authenticated. |
| `app/app/page.tsx` | Server component placeholder with SignOutButton | VERIFIED | No "use client". Imports and renders `<SignOutButton />`. Contains placeholder copy referencing Phase 4 guard. |
| `app/app/SignOutButton.tsx` | "use client", signOut from aws-amplify/auth, await signOut(), router.push("/") | VERIFIED | Exact pattern confirmed: `await signOut(); router.push("/")` in async `handleClick`. Imports from `aws-amplify/auth` and `next/navigation`. |
| `app/page.tsx` | Sign in link to /login (D-16 discretion) | VERIFIED | `<Link href="/login">` with `absolute top-4 right-4` positioning. Uses `next/link`. |
| `amplify_outputs.json` | auth block with user_pool_id starting with us-east-1_ | VERIFIED | `user_pool_id: us-east-1_6l4dSfRCz`, `aws_region: us-east-1`, `user_pool_client_id`, `identity_pool_id` all present. |
| `package.json` | aws-amplify@^6.16.4 + @aws-amplify/ui-react@^6.15.3 in dependencies (not devDeps) | VERIFIED | Both in `dependencies`. Neither in `devDependencies`. `@aws-amplify/adapter-nextjs` not installed anywhere. |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `app/layout.tsx` | `app/AmplifyProvider.tsx` | `import { AmplifyProvider }` + `<AmplifyProvider>{children}</AmplifyProvider>` | WIRED | Import and usage both confirmed. Entire React tree is wrapped. |
| `app/AmplifyProvider.tsx` | `amplify_outputs.json` | `import outputs from "@/amplify_outputs.json"` + `Amplify.configure(outputs)` | WIRED | @/ alias used. configure() call at module top-level confirmed. |
| `app/login/page.tsx` | `@aws-amplify/ui-react` | `import { Authenticator, useAuthenticator }` + JSX usage | WIRED | `<Authenticator />` rendered. `useAuthenticator(...)` called for redirect. |
| `app/login/page.tsx` | `/app` route | `router.push("/app")` in useEffect | WIRED | Fires when `authStatus === "authenticated"`. |
| `app/app/SignOutButton.tsx` | `aws-amplify/auth` | `import { signOut }` + `await signOut()` | WIRED | v6 subpath import. await before navigation confirmed. |
| `app/app/SignOutButton.tsx` | `/` route | `router.push("/")` after await signOut() | WIRED | Ordering correct per L-14. |
| `amplify/backend.ts` | `amplify/auth/resource.ts` | `import { auth }` + `defineBackend({ auth })` | WIRED | Relative import `"./auth/resource"`. Auth resource composed into backend. |
| `amplify/auth/resource.ts` | AWS Cognito (live) | `npx ampx sandbox --once` deploy | WIRED | CloudFormation CREATE_COMPLETE. amplify_outputs.json populated with live IDs. |

---

## Data-Flow Trace (Level 4)

Not applicable for this phase. Phase 2 introduces authentication UI (event-driven flows), not data-rendering components. There is no data fetched from a database to render. The `<Authenticator>` is a third-party component that manages its own state against Cognito directly. Level 4 data-flow tracing applies starting Phase 3+ when user data or protected data surfaces in the UI.

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `amplify/auth/resource.ts` has required shape markers | `test -f amplify/auth/resource.ts && grep -q 'defineAuth' amplify/auth/resource.ts && grep -q '"EMAIL_ONLY"' amplify/auth/resource.ts && grep -q 'fullname:' amplify/auth/resource.ts` | File contents read directly — all markers confirmed | PASS |
| `amplify/backend.ts` wires auth | File read — `defineBackend({ auth })` and `from "./auth/resource"` both present | Confirmed | PASS |
| `AmplifyProvider.tsx` has no `ssr: true` in configure call | `Amplify.configure(outputs)` on line 15 with no second argument | Confirmed (string only in comment) | PASS |
| `app/login/page.tsx` has no `from "next/router"` | File read — imports from `next/navigation` only | Confirmed | PASS |
| `SignOutButton.tsx` uses `await signOut()` before push | File read — `await signOut(); router.push("/")` in handleClick | Confirmed | PASS |
| `amplify_outputs.json` has live auth.user_pool_id | `user_pool_id: us-east-1_6l4dSfRCz` | Confirmed — starts with `us-east-1_` | PASS |
| `aws-amplify` in dependencies, not devDependencies | package.json read | `^6.16.4` in `dependencies`. Not in `devDependencies`. | PASS |
| `@aws-amplify/adapter-nextjs` not installed | package.json read | Not present in either dependencies or devDependencies | PASS |
| D-29 Flow #1 (sign-up + verify + sign-in) | Manual — documented in 02-05-SUMMARY | PASSED end-to-end against live Cognito `us-east-1_6l4dSfRCz` | PASS |
| D-29 Flow #2 (sign-out + re-sign-in) | Manual — documented in 02-05-SUMMARY | PASSED. Sign-out clears session; /login shows Authenticator form; re-sign-in lands on /app | PASS |
| D-29 Flow #3 (refresh persists session) | Manual — documented in 02-05-SUMMARY | PASSED. localStorage retains Cognito tokens across Ctrl+R. | PASS |
| D-29 Flow #4 (reset password) | Manual — SKIPPED in 02-05-SUMMARY | Skipped with developer approval | HUMAN_NEEDED |

---

## Locked Decision Compliance (D-15..D-29)

| Decision | Requirement | Code Evidence | Status |
|----------|-------------|---------------|--------|
| D-15: `<Authenticator>` in /login route (not wrapping whole app) | `<Authenticator />` only in `app/login/page.tsx` | Confirmed: `app/AmplifyProvider.tsx` wraps with `Authenticator.Provider` (context only); `<Authenticator />` rendered only in login page | COMPLIANT |
| D-16: Home / public with optional Sign in link | `app/page.tsx` additive-only | `<Link href="/login">Sign in</Link>` added absolute top-right. All existing markup preserved. No "use client". | COMPLIANT |
| D-17: /app placeholder, unguarded (Phase 4 adds guard) | `app/app/page.tsx` server component | "Welcome" page with copy "Phase 4 will add the auth guard so that /app is only reachable when signed in." Unguarded by design. | COMPLIANT |
| D-18: Cognito User Pool — email + fullname + mutable | `amplify/auth/resource.ts` | `email: { required: true, mutable: false }`, `fullname: { required: true, mutable: true }`. CDK property `fullname` (not `name`) per L-1. | COMPLIANT |
| D-19: EMAIL_ONLY accountRecovery | `amplify/auth/resource.ts` | `accountRecovery: "EMAIL_ONLY"` confirmed. | COMPLIANT |
| D-20: Default password policy (no override) | `amplify/auth/resource.ts` | No `passwordPolicy` prop declared. amplify_outputs.json confirms defaults: `min_length: 8, require_lowercase/uppercase/numbers/symbols: true`. | COMPLIANT |
| D-21: defineBackend({ auth }) | `amplify/backend.ts` | 4-line file with `import { auth } from "./auth/resource"` + `defineBackend({ auth })`. | COMPLIANT |
| D-22: aws-amplify + @aws-amplify/ui-react in deps; adapter-nextjs NOT installed | `package.json` | Both in `dependencies`. adapter-nextjs absent from all dep sections. | COMPLIANT |
| D-23 SUPERSEDED: AmplifyProvider at ROOT (not /login) | `app/AmplifyProvider.tsx` in app/ root | Provider hoisted to root per RESEARCH §7/L-2. No `app/login/AmplifyProvider.tsx`. Supersession documented in 02-03-SUMMARY. | COMPLIANT (supersession honored) |
| D-24: Default AWS theme | `app/login/page.tsx` | `<Authenticator />` bare — no theme props. Default Amplify UI theme renders. | COMPLIANT |
| D-25: Default Authenticator flows (no custom slots) | `app/login/page.tsx` | No `signUpAttributes`, `formFields`, `components`, or `loginMechanisms` props passed. | COMPLIANT |
| D-26: router.push("/app") on authenticated | `app/login/page.tsx` | `useEffect` triggers `router.push("/app")` when `authStatus === "authenticated"`. | COMPLIANT |
| D-27: signOut → router.push("/") | `app/app/SignOutButton.tsx` | `await signOut(); router.push("/")` in handleClick. | COMPLIANT |
| D-28 (corrected): localStorage storage, NO ssr:true | `app/AmplifyProvider.tsx` | `Amplify.configure(outputs)` — no second argument. Walk-back from L-3 documented in CONTEXT D-28 and 02-05-SUMMARY. AUTH-05 satisfied via localStorage. | COMPLIANT (walk-back documented) |
| D-29: 4 manual flows | 02-05-SUMMARY | Flow #1 PASSED, #2 PASSED, #3 PASSED, #4 SKIPPED with rationale. | PARTIAL — see Human Verification |

---

## Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| AUTH-01 | 02-01, 02-04 | Cognito User Pool with email + password declared in `amplify/auth/resource.ts` via `defineAuth({ loginWith: { email: true } })` | SATISFIED | `amplify/auth/resource.ts` confirmed with exact shape. Live deployment confirmed via `amplify_outputs.json` + CloudFormation CREATE_COMPLETE event log. |
| AUTH-03 | 02-02, 02-03, 02-05 | `<Authenticator>` integrated — sign-up (with email verification), sign-in, sign-out, reset password operational | SATISFIED (reset password has partial coverage gap — see SC-4) | Authenticator rendered at /login with Zero Config. Sign-up + verify + sign-in confirmed (D-29 #1). Sign-out confirmed (D-29 #2). Reset password: `accountRecovery: "EMAIL_ONLY"` declares the flow; "Forgot your password?" exposed by default Authenticator; live flow not exercised (D-29 #4 skipped). |
| AUTH-05 | 02-03, 02-05 | Session persists across browser refresh (token storage handled by Amplify) | SATISFIED | `Amplify.configure(outputs)` uses default localStorage. D-29 #3 confirmed: localStorage tokens survive Ctrl+R. No redirect to /login on refresh. |

REQUIREMENTS.md traceability table already marks AUTH-01, AUTH-03, AUTH-05 as Complete. This verification confirms those marks are accurate for AUTH-01 and AUTH-05. AUTH-03 is accurate with the caveat that reset password was not live-exercised.

---

## Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `app/app/page.tsx` | Contains the word "placeholder" in JSX copy | INFO | Intentional per CONTEXT D-17 — /app is an acknowledged placeholder until Phase 4 adds the auth guard. Not a stub pattern; the component renders and the sign-out button is functional. |

No blockers. No stub returns. No empty implementations. No `return null` / `return {}`. No console.log-only handlers. No forbidden imports (`next/router`, v5 `Auth` namespace, `@aws-amplify/adapter-nextjs`).

---

## Live AWS State

- Cognito User Pool: `us-east-1_6l4dSfRCz` (region `us-east-1`, account `992839645871`)
- Stack: `amplify-datathon2026-fernando-sandbox-0d21400c4f`
- Confirmed via `amplify_outputs.json` (`auth.user_pool_id` starts with `us-east-1_`)
- Direct AWS CLI introspection (`cognito-idp:ListUserPools`) denied by `AmplifyBackendDeployFullAccess` IAM scope — accepted substitute evidence: deploy event log shows CloudFormation `CREATE_COMPLETE` for the UserPool resource, and `amplify_outputs.json` is generated by AWS itself (not fabricated)
- `amplify_outputs.json` is gitignored (confirmed in 02-04-SUMMARY via `git check-ignore -v`)

---

## Coverage Gate

| Gate | Status |
|------|--------|
| AUTH-01 marked Complete in REQUIREMENTS.md | CONFIRMED |
| AUTH-03 marked Complete in REQUIREMENTS.md | CONFIRMED |
| AUTH-05 marked Complete in REQUIREMENTS.md | CONFIRMED |
| 5/5 plans have SUMMARY.md | CONFIRMED (02-01 through 02-05 all present and complete) |
| 5/5 plan checkboxes marked [x] in ROADMAP.md | CONFIRMED |
| Phase 2 progress shows 5/5 in ROADMAP progress table | CONFIRMED |
| All Phase 2 commits exist in git log | CONFIRMED: d7270c8, 8ff3e99, 9fe4313, a06cd38, 5f532ab, 5353750, 90aaed8, 08fce05, 12d02be, f8586b1, ddc7e38 |

---

## Deviations Acknowledged

All deviations are documented, non-regressive, and accepted.

1. **RESEARCH L-3 walk-back (`ssr: true` removed):** Tried `Amplify.configure(outputs, { ssr: true })` per RESEARCH L-3; caused total auth UI hang (`useAuthenticator` stuck in "configuring"). Walked back to `Amplify.configure(outputs)` (default localStorage). AUTH-05 still satisfied. CONTEXT D-28 updated. Documented in 02-05-SUMMARY and inline comment in `app/AmplifyProvider.tsx`. VERDICT: Correct architectural decision — `ssr: true` applies to Phase 4+ when `@aws-amplify/adapter-nextjs` is installed for server-side session reading.

2. **CONTEXT D-23 supersession (provider at root, not /login):** CONTEXT D-23 specified `app/login/AmplifyProvider.tsx`; RESEARCH §7/L-2 corrected this to `app/AmplifyProvider.tsx` (root). Reason: `signOut()` in `app/app/SignOutButton.tsx` would throw "no auth config" if `Amplify.configure()` were scoped to the /login route only. Root-level provider guarantees the Amplify singleton is configured before any route's components call auth APIs. Documented in 02-03-SUMMARY. VERDICT: Correct; no downside.

3. **CONTEXT D-28 wording corrected (localStorage, not cookies):** D-28 originally documented localStorage; RESEARCH L-3 revised it to cookies; execution confirmed the original was right (localStorage). Final state: localStorage is correct for Phase 2 (client-side only). CONTEXT updated in commit `f8586b1`. VERDICT: Documentation now accurate.

4. **Sandbox executor blocked `bun add` and `npx ampx`:** Same Phase 1 fallback path — orchestrator ran `bun add` (Plan 02-02) and `npx ampx sandbox --once` (Plan 02-04) directly. Functionally equivalent; all outputs identical to what executor would have produced. Documented in 02-02-SUMMARY and 02-04-SUMMARY. VERDICT: Non-issue.

5. **AWS introspection commands denied by IAM scope:** `AmplifyBackendDeployFullAccess` does not include `cognito-idp:ListUserPools` or `cloudformation:DescribeStackResource`. Substitute evidence used: CloudFormation event log (live events showing CREATE_COMPLETE) + `amplify_outputs.json` (AWS-generated, contains real IDs). VERDICT: Acceptable — live Cognito User Pool existence is demonstrated by the deploy event log and the outputs file.

6. **D-29 Flow #4 (reset password) skipped with developer approval:** User approved skip after flows 1-3 passed, noting that the reset flow shares the same `<Authenticator>` component, Cognito User Pool, and email delivery pipeline. Risk: the specific Cognito API methods (ForgotPassword / ConfirmForgotPassword) have not been exercised. This is flagged as the single human verification item remaining. VERDICT: Justified skip; risk acknowledged; one human item open.

---

## Human Verification Required

### 1. Reset Password Flow — D-29 Flow #4

**Test:**
1. Navigate to `http://localhost:3000/login` (run `bun run dev` first)
2. Click "Forgot your password?"
3. Enter `<your-email>+phase2-test1@<domain>` (the same address used in Flow #1)
4. Check email inbox (and spam folder) for a code from `no-reply@verificationemail.com`
5. Enter the code and set a new password (must satisfy default policy: 8+ chars, upper, lower, digit, symbol)
6. Sign in with the new password
7. Verify redirect to `/app` and session is active

**Expected:** Reset password code arrives, entering it + a new password succeeds, and signing in with the new password lands on `/app` with session active.

**Why human:** This flow requires a real email inbox to receive the Cognito-issued reset code. The flow was explicitly skipped during Plan 02-05 execution with developer approval. The `accountRecovery: "EMAIL_ONLY"` declaration and the `<Authenticator>` Zero Configuration are in place — only the live exercise is missing.

---

## Recommendations (Non-Blocking, for Phase 3+)

1. **`@aws-amplify/adapter-nextjs` for Phase 4:** When Phase 4 adds the auth guard for `/app`, the recommended implementation using middleware or server-side session checking will require this package. Plan for its installation in Phase 4 planning, along with updating `AmplifyProvider.tsx` to re-enable `ssr: true` (which will then work correctly with the adapter present).

2. **amplify_outputs.json presence for CI:** The file is gitignored (correct for dev), but any CI pipeline (Phase 5) will need either a pre-seeded outputs file or a `npx ampx generate outputs` step before building. Flag this in Phase 5 planning.

3. **D-29 Flow #4 closure:** Even though Phase 2 is complete, the reset password flow should be tested opportunistically during Phase 3 or Phase 4 manual validation when the sandbox is already running. This is a low-cost regression test at that point.

4. **Unguarded `/app` (D-17 by design):** `app/app/page.tsx` is intentionally accessible without authentication until Phase 4. This is correctly documented in the placeholder copy and in CONTEXT D-17. No action needed for Phase 2; Phase 4 owns this.

---

*Verified: 2026-04-25T18:00:00Z*
*Verifier: Claude (gsd-verifier) — goal-backward analysis*
