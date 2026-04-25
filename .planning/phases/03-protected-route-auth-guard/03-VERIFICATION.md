---
phase: 03-protected-route-auth-guard
verified: 2026-04-25T00:00:00Z
status: passed
score: 8/8 must-haves verified
overrides_applied: 0
---

# Phase 3: Protected Route & Auth Guard — Verification Report

**Phase Goal:** La ruta `/app` (o equivalente) es inaccesible sin sesión y muestra contenido específico cuando hay sesión.
**Verified:** 2026-04-25
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                          | Status     | Evidence                                                                                                                                                                                                                              |
| --- | ---------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Visiting `/app` without session redirects to `/login` (or shows `<Authenticator>`)             | ✓ VERIFIED | `app/app/layout.tsx:12` wraps children in `<AuthGuard>`; `app/_components/AuthGuard.tsx:25-29` `useEffect` calls `router.replace(\`/login?from=${encodeURIComponent(pathname)}\`)` when `authStatus === "unauthenticated"`. Manual Flow #1 approved (03-03-SUMMARY.md row 1). |
| 2   | Visiting `/app` with session shows protected content including the user's email               | ✓ VERIFIED | `app/app/page.tsx:9-10` reads email via `useAuthenticator(({ user }) => [user]).user?.signInDetails?.loginId`; lines 13-28 fetch `name` async via `fetchUserAttributes()` with cancellation flag; lines 30-40 render `<h1>Welcome, ${name}</h1>` + `<p>Signed in as {email}</p>` + `<SignOutButton/>`. Manual Flow #2 approved (03-03-SUMMARY.md row 2). |
| 3   | Guard pattern is reusable (HOC, layout, or middleware documented)                              | ✓ VERIFIED | `<AuthGuard>` is a named-export client component (`app/_components/AuthGuard.tsx:20`). Mounted at the **layout** level in `app/app/layout.tsx:12` → every nested `/app/*` route inherits gating with zero per-route boilerplate. Routes outside `/app/*` can import via `@/app/_components/AuthGuard` directly. JSDoc at lines 7-19 documents the contract. |
| 4   | `bun run build` exits 0 — Suspense boundary around `useSearchParams` (L-1 / K-3) closure       | ✓ VERIFIED | `app/login/page.tsx:30-45` outer `LoginPage` default export wraps `<LoginPageInner/>` in `<Suspense fallback={...}>`. 03-02-SUMMARY.md and 03-03-SUMMARY.md gauntlet evidence confirms `bun run build` exit 0; route table shows 4 static routes. Manual Flow #4 approved. |
| 5   | Open-redirect impossible: `?from=//evil.com`, `?from=javascript:…`, `?from=/login` all fall back to `/app` | ✓ VERIFIED | `app/_components/safeFromPath.ts:17-26` 8-rule allowlist: rejects `//` (line 21), missing `/` prefix (20), `/login*` (23), `/\` (22), backslash/null bytes (24), length cap (19). `app/login/page.tsx:15` calls `safeFromPath(searchParams.get("from")) ?? "/app"`. Manual Flow #3 approved (all three probes redirected to /app). |
| 6   | Single `<Authenticator.Provider>` JSX mount (RESEARCH L-10)                                    | ✓ VERIFIED | `grep -rn "<Authenticator.Provider" app/` returns exactly 1 line: `app/AmplifyProvider.tsx:21`. No double-mount in Phase 3 files. |
| 7   | `app/app/layout.tsx` is `"use client"` with NO `metadata` export (RESEARCH L-9 / K-4)         | ✓ VERIFIED | First non-blank line is `"use client";` (line 1). No `export const metadata` or `export { metadata }` anywhere in file. Build passes — L-9 closure verified at compile time. |
| 8   | `app/login/page.tsx` uses `router.replace` (NOT `push`) with exhaustive deps `[authStatus, router, searchParams]` (RESEARCH L-4) | ✓ VERIFIED | Line 16: `router.replace(from)`. Line 18: deps `[authStatus, router, searchParams]`. `grep "router.push" app/login/page.tsx` → no match. Lint passes (`react-hooks/exhaustive-deps` clean). |

**Score:** 8/8 truths verified

### Required Artifacts

| Artifact                                | Expected                                                                  | Status     | Details                                                                                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/_components/safeFromPath.ts`       | Pure-TS open-redirect allowlist; named export `safeFromPath`              | ✓ VERIFIED | 27 lines; `export function safeFromPath` line 17; 8-rule chain (typeof, length, `/`, `//`, `/\\`, `/login`, `\`/`\0`, return). No React/Next/Amplify imports. No `"use client"`. |
| `app/_components/AuthGuard.tsx`         | `"use client"` named-export component; three-state switch                 | ✓ VERIFIED | 53 lines; `"use client"` line 1; named export `AuthGuard` line 20; configuring → spinner (lines 31-44); authenticated → `<>{children}</>` (line 47); unauthenticated → null (line 51). Imports from `next/navigation`, `@aws-amplify/ui-react`. |
| `app/app/layout.tsx`                    | Client layout that mounts `<AuthGuard>` for all `/app/*`                  | ✓ VERIFIED | 14 lines; `"use client"` line 1; default export `AppLayout` line 7; returns `<AuthGuard>{children}</AuthGuard>` line 12. Single import: `AuthGuard` via `@/` alias. No `metadata` export. |
| `app/app/page.tsx`                      | Protected page rendering Welcome + email + name + SignOutButton           | ✓ VERIFIED | 42 lines; `"use client"` line 1; default export `AppPage` line 8; uses `useAuthenticator`, `fetchUserAttributes`, renders Welcome/email/SignOutButton. Old `AppPlaceholder` removed; "Phase 4 will add" copy gone. |
| `app/login/page.tsx`                    | Outer Suspense + inner consumer using `safeFromPath` + `router.replace`   | ✓ VERIFIED | 46 lines; `"use client"` line 1; `LoginPageInner` (lines 8-28) consumes `useSearchParams`, calls `safeFromPath(searchParams.get("from")) ?? "/app"` (line 15), `router.replace(from)` (line 16); outer `LoginPage` default export wraps in `<Suspense>` (lines 30-45). |

### Key Link Verification

| From                          | To                                          | Via                                                                          | Status     | Details                                                                                                                                  |
| ----------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `app/app/layout.tsx`          | `app/_components/AuthGuard.tsx`             | `import { AuthGuard } from "@/app/_components/AuthGuard"`                    | ✓ WIRED    | Line 3: `import { AuthGuard } from "@/app/_components/AuthGuard";` Used line 12.                                                          |
| `app/login/page.tsx`          | `app/_components/safeFromPath.ts`           | `import { safeFromPath } from "@/app/_components/safeFromPath"`              | ✓ WIRED    | Line 6: `import { safeFromPath } from "@/app/_components/safeFromPath";` Used line 15.                                                    |
| `app/_components/AuthGuard.tsx` | Authenticator.Provider in AmplifyProvider | `useAuthenticator((ctx) => [ctx.authStatus])` reads root context             | ✓ WIRED    | Line 5 imports `useAuthenticator`; line 23 calls it with selector; root provider mounted at `app/AmplifyProvider.tsx:21` (single mount).  |
| `app/_components/AuthGuard.tsx` | next/navigation router.replace            | `useEffect` side-effect with `/login?from=` URL                              | ✓ WIRED    | Lines 25-29: `useEffect` calls `router.replace(\`/login?from=${encodeURIComponent(pathname)}\`)` when `authStatus === "unauthenticated"`. |
| `app/login/page.tsx`          | next/navigation router.replace             | `useEffect` calls `router.replace(safeFromPath(...) ?? "/app")`              | ✓ WIRED    | Lines 13-18: deps exhaustive `[authStatus, router, searchParams]`. Validated `from` value used.                                          |
| `app/app/page.tsx`            | aws-amplify/auth fetchUserAttributes        | One-shot `useEffect` with cancellation flag                                  | ✓ WIRED    | Line 5 imports `fetchUserAttributes`; lines 13-28 call it inside async IIFE in `useEffect` with `cancelled` flag + try/catch.             |

### Data-Flow Trace (Level 4)

| Artifact                          | Data Variable     | Source                                                            | Produces Real Data | Status     |
| --------------------------------- | ----------------- | ----------------------------------------------------------------- | ------------------ | ---------- |
| `app/app/page.tsx`                | `email`           | `useAuthenticator(({user})=>[user]).user?.signInDetails?.loginId` | Yes (live Cognito session)  | ✓ FLOWING  |
| `app/app/page.tsx`                | `name`            | `await fetchUserAttributes()` (Cognito call, returns attrs.name)  | Yes (live Cognito user pool `us-east-1_6l4dSfRCz`) | ✓ FLOWING  |
| `app/_components/AuthGuard.tsx`   | `authStatus`      | `useAuthenticator((ctx)=>[ctx.authStatus])` (root xstate machine) | Yes (Amplify state machine emits configuring/authenticated/unauthenticated) | ✓ FLOWING  |
| `app/login/page.tsx`              | `from`            | `searchParams.get("from")` → `safeFromPath(...) ?? "/app"`        | Yes (validated URL → router) | ✓ FLOWING  |

Manual Flow #2 confirmed live data: user observed `Welcome, {name}` + `Signed in as {email}` against Cognito sandbox `us-east-1_6l4dSfRCz`.

### Behavioral Spot-Checks

| Behavior                                      | Command                       | Result                       | Status |
| --------------------------------------------- | ----------------------------- | ---------------------------- | ------ |
| ESLint passes with `--max-warnings=0`         | `bun run lint`                | exit 0, no output             | ✓ PASS |
| TypeScript strict typecheck                   | `bun run typecheck`           | exit 0, no output             | ✓ PASS |
| No Pages-Router imports in app/               | `grep -rn 'from "next/router"' app/` | exit 1 (no match)      | ✓ PASS |
| Single `<Authenticator.Provider>` JSX mount   | `grep -rn "<Authenticator.Provider" app/` | 1 line: AmplifyProvider.tsx:21 | ✓ PASS |
| Single `Amplify.configure` call site          | `grep -rn "Amplify.configure" app/` | 2 matches (1 call line 15 + 1 docstring) | ✓ PASS |
| `app/_components/` directory established      | `ls app/_components/`         | AuthGuard.tsx, safeFromPath.ts | ✓ PASS |
| `bun run build` exits 0 (load-bearing for L-1/L-9) | Verified via 03-03-SUMMARY.md gauntlet evidence + Manual Flow #4 approval | exit 0, 4 static routes prerendered | ✓ PASS |

Spot-check `bun run audit` and full `bun run build` not re-run by verifier (ran during 03-03 close-out per SUMMARY evidence; no source changes since); existing evidence accepted.

### Requirements Coverage

| Requirement | Source Plan                       | Description                                                                                                                                          | Status      | Evidence                                                                                                                              |
| ----------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| AUTH-04     | 03-01-PLAN, 03-02-PLAN, 03-03-PLAN | Ruta protegida (ej. `/app` o `/dashboard`) que redirige a `/login` (o muestra `<Authenticator>`) cuando no hay sesión activa, y muestra contenido cuando sí | ✓ SATISFIED | All 3 ROADMAP success criteria observed live (Manual Flows #1, #2, #3, #4 approved). REQUIREMENTS.md maps AUTH-04 → Phase 3 (single mapping, no doubles). |

No orphaned requirements: `grep "Phase 3" .planning/REQUIREMENTS.md` returns only the AUTH-04 row.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| (none) | - | TODO/FIXME/HACK/XXX/PLACEHOLDER scan returned 0 hits across all 5 phase files | - | - |
| (none) | - | "placeholder", "coming soon", "Phase 4 will add" — old placeholder copy fully removed from `app/app/page.tsx` | - | - |
| (none) | - | `router.push` in `app/login/page.tsx` or `app/_components/AuthGuard.tsx` — none found (D-35 honored) | - | - |
| (none) | - | `from "next/router"` (Pages Router) — none found across `app/` | - | - |
| (none) | - | `Authenticator.Provider` JSX double-mount — single mount only at `app/AmplifyProvider.tsx:21` | - | - |
| (none) | - | `Amplify.configure` second call site — single call at `app/AmplifyProvider.tsx:15` | - | - |
| (none) | - | `export const metadata` in `app/app/layout.tsx` (L-9) — none | - | - |

Code review (03-REVIEW.md) found **0 critical, 2 warnings, 4 info** — all acknowledged and documented as acceptable for v1 scope:
- WR-01: Narrow `unauthenticated` check is exhaustive against today's Amplify v6.15.x `authStatus` union (defensive gap only against hypothetical future enum values).
- WR-02: `usePathname()` drops query/hash on bounce-back — `/app` has no query state in v1, deferred until protected route uses query params.
- IN-01..IN-04: Style/quality polish (redundant backslash check, JSDoc grammar, K-4 token reference, mixed import-path style) — non-blocking.

### Human Verification Required

None — all four manual flows from VALIDATION.md were already executed and approved by the user during Wave 3 execution (recorded in 03-03-SUMMARY.md):
- Manual Flow #1 (`/app` w/o session → redirect to `/login?from=%2Fapp`): **APPROVED**
- Manual Flow #2 (signed-in `/app` shows email + name): **APPROVED**
- Manual Flow #3 (open-redirect rejection — 3 probes: `//evil.com`, `javascript:…`, `/login`): **APPROVED**
- Manual Flow #4 (`bun run build` exit 0 with no Suspense/metadata regression): **APPROVED**

Per orchestrator note, these are treated as already-resolved human verifications. No re-prompting required.

### Gaps Summary

None. All 8 must-have observable truths verified, all 5 artifacts pass three-level + data-flow checks, all 6 key links wired, AUTH-04 satisfied, anti-pattern scan clean, code review found zero critical issues, all 4 manual flows pre-approved.

**Phase 3 goal achieved:** `/app` is inaccessible without a Cognito session (redirects to `/login?from=%2Fapp` via `<AuthGuard>` mounted in `app/app/layout.tsx`) and shows specific user content (`Welcome, {name}` + `Signed in as {email}` + `<SignOutButton>`) when session is active. The `<AuthGuard>` pattern is reusable at both layout-level (inheritance) and component-level (direct import) for any future protected route. The `safeFromPath` allowlist closes the open-redirect attack surface (T-03-08/09/10) at runtime, verified live via three browser probes. Zero regressions in Phase 1/2 deliverables; zero new dependencies; single Authenticator.Provider invariant preserved.

Phase 3 ready to proceed to Phase 4 (Amplify Hosting + GitHub CI).

---

_Verified: 2026-04-25_
_Verifier: Claude (gsd-verifier)_
