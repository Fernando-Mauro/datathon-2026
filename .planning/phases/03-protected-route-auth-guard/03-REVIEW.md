---
phase: 03-protected-route-auth-guard
reviewed: 2026-04-25T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - app/_components/safeFromPath.ts
  - app/_components/AuthGuard.tsx
  - app/app/layout.tsx
  - app/app/page.tsx
  - app/login/page.tsx
findings:
  critical: 0
  warning: 2
  info: 4
  total: 6
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-04-25
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Phase 3 implementation is **security-sound and structurally correct**. The `safeFromPath` allowlist holds against the documented threat vectors (T-03-01/08 open redirect, T-03-09 `javascript:` URL, T-03-10 `/login` loop). `<AuthGuard>` correctly avoids rendering protected children before `authStatus === "authenticated"`, places `router.replace` inside `useEffect` (L-3), and has an exhaustive dependency array (L-4). `/login/page.tsx` properly Suspense-wraps `useSearchParams` (L-1) and routes only validated paths into `router.replace` (L-7). `app/app/layout.tsx` is `"use client"` without a `metadata` export (L-9). `app/app/page.tsx` cancels its `fetchUserAttributes` effect on unmount and gracefully degrades when `signInDetails.loginId` is undefined (L-11).

Two warnings worth addressing:
1. `<AuthGuard>` only handles three of the Authenticator's possible `authStatus` values explicitly — intermediate states (e.g., a brief `configuring` → unknown transition outside the documented union) render `null` without scheduling a redirect. Low real-world impact but worth a note.
2. `<AuthGuard>` drops the current URL's query string and hash when constructing `?from=` — `usePathname()` returns only the path. Bounce-back loses non-path state.

Both are bugs/anti-patterns that *could* surface but neither blocks ship.

The remaining items are style/quality polish.

## Warnings

### WR-01: `<AuthGuard>` only redirects on exact `"unauthenticated"` status; other non-authenticated states render `null` silently

**File:** `app/_components/AuthGuard.tsx:25-29, 46-51`
**Issue:** The `useEffect` only fires `router.replace(...)` when `authStatus === "unauthenticated"`. The Authenticator hook's `authStatus` union in `@aws-amplify/ui-react` v6.15.x is documented as `"configuring" | "authenticated" | "unauthenticated"`, so today this is exhaustive — but the component treats unknown/future values by returning `null` (line 51 `return null` is reached for anything not in `{configuring, authenticated}`), with no redirect ever scheduled. CONTEXT D-31 explicitly enumerated the non-authenticated states (`signIn`, `signUp`, `confirmSignUp`, etc.) as cases that *should* redirect; if a future Amplify version exposes any of those via `authStatus`, the guard would render a blank page indefinitely instead of bouncing.

This is a defensive-coding gap, not a today-bug. The current Amplify v6.15.x typing makes the `else null` branch only reachable during the brief unauthenticated window before the effect runs (which is correct).

**Fix:** Make the unauthenticated branch the default and the spinner the explicit case, so any non-`authenticated` and non-`configuring` state still triggers the redirect effect:

```typescript
useEffect(() => {
  if (
    authStatus !== "authenticated" &&
    authStatus !== "configuring" &&
    !pathname.startsWith("/login")
  ) {
    router.replace(`/login?from=${encodeURIComponent(pathname)}`);
  }
}, [authStatus, pathname, router]);
```

Alternatively, leave as-is and add a one-line comment justifying the narrow check ("Amplify v6.15.x only emits configuring|authenticated|unauthenticated; other Authenticator route states are not surfaced via authStatus").

### WR-02: `?from=` only preserves pathname, drops query string and hash

**File:** `app/_components/AuthGuard.tsx:27`
**Issue:** `usePathname()` returns only the URL path (e.g., `/app/foo`), excluding `?bar=baz` and `#section`. If a user lands on `/app/dashboard?tab=settings` while signed out, the bounce-back after sign-in goes to `/app/dashboard`, dropping `?tab=settings`. CONTEXT D-36 specified bounce-back to "the URL original" — pathname-only loses fidelity. For v1 with only `/app` (no query usage yet) this is latent, not breaking. Becomes user-visible the moment any protected route uses query params for state.

Note: combining `pathname` + `searchParams` here would also require `useSearchParams` in `<AuthGuard>`, which would force the component (and therefore `app/app/layout.tsx`) into a Suspense boundary (L-1). That's a real cost — flagging as Warning rather than requiring the fix now.

**Fix (deferred-acceptable):** Either accept the limitation and document it, or wrap query-preserving construction:

```typescript
const searchParams = useSearchParams();
useEffect(() => {
  if (authStatus === "unauthenticated" && !pathname.startsWith("/login")) {
    const qs = searchParams.toString();
    const full = qs ? `${pathname}?${qs}` : pathname;
    router.replace(`/login?from=${encodeURIComponent(full)}`);
  }
}, [authStatus, pathname, searchParams, router]);
```

Adding `useSearchParams` requires `<AuthGuard>` consumers to be inside a Suspense boundary — for `app/app/layout.tsx` that means wrapping the layout body. Defer this until a protected route actually relies on query state.

## Info

### IN-01: Redundant backslash check in `safeFromPath`

**File:** `app/_components/safeFromPath.ts:22, 24`
**Issue:** Line 22 (`raw.startsWith("/\\")`) is fully subsumed by line 24 (`raw.includes("\\")`). Any path starting with `/\` will hit line 24 anyway. Defense-in-depth is fine, but the duplication suggests one of the two checks is leftover thinking.
**Fix:** Drop line 22 — line 24 is the authoritative reject. Or keep line 22 and add a `// defense-in-depth: catches /\foo before generic includes check` comment.

### IN-02: Grammatically broken comment in AuthGuard

**File:** `app/_components/AuthGuard.tsx:8-9`
**Issue:** The JSDoc reads `"Protect a client subtree. Mounts \`Authenticator.Provider\` is assumed to be present at root..."`. The sentence merges two clauses: "Mounts protected subtree" + "Authenticator.Provider is assumed to be mounted at root". Reads as a typo.
**Fix:**
```typescript
/**
 * Protect a client subtree. Assumes `Authenticator.Provider` is mounted at
 * the root (`app/AmplifyProvider.tsx`).
 *  ...
 */
```

### IN-03: Comment references undefined token "K-4"

**File:** `app/app/layout.tsx:5`
**Issue:** `// NOTE: client layouts cannot export \`metadata\` (K-4).` references a knowledge item ID with no source. The actual landmine is L-9 (RESEARCH constraint). External readers (or a future Phase 4 reviewer) won't know what K-4 is.
**Fix:** Replace with a self-contained explanation:
```typescript
// Client layouts ("use client") cannot export `metadata` — Next.js App Router
// only collects metadata from server components. The root layout already
// provides metadata, so this layout intentionally omits it.
```

### IN-04: Mixed import path style for sibling components

**File:** `app/app/page.tsx:6` vs `app/app/layout.tsx:3`
**Issue:** `app/app/page.tsx` imports `SignOutButton` via relative path `"./SignOutButton"`, while `app/app/layout.tsx` imports `AuthGuard` via alias `"@/app/_components/AuthGuard"`. CONVENTIONS.md allows both, and the rule of thumb (relative for siblings, alias for cross-tree) is being followed here, so this is consistent with the implicit convention. Flagging only because future contributors may not see the rule and might "fix" one or the other.
**Fix:** None required. Optionally add a one-liner to CONVENTIONS.md: "Relative imports for same-directory siblings; `@/...` alias for cross-tree imports."

---

## Out-of-scope checks performed (informational, not findings)

- **Hardcoded secrets:** None detected (`grep -nE '(password|secret|api_key|token|apikey)' ` matches only the documented `password`-string in `safeFromPath.ts` and `signInDetails.loginId` field access, neither a credential).
- **Dangerous functions:** No `eval`, `innerHTML`, `dangerouslySetInnerHTML`, `exec`, `system` calls.
- **Empty catch blocks:** None — the only `try/catch` in scope (`app/app/page.tsx:16-23`) logs the error in non-prod and silently degrades in prod, which is the documented behavior (D-39).
- **`any` / `as` casts:** None.
- **Pages-Router imports (`next/router`):** None — all routing imports are from `next/navigation`.
- **Amplify v5 namespace (`Auth.signOut`, `Auth.currentSession`):** None — all calls go through `aws-amplify/auth` v6 named exports.
- **`router.replace` in render body:** None — both call sites are inside `useEffect`.
- **`metadata` export in `"use client"` files:** Not present in any of the 5 files (`grep -n 'metadata' app/app/layout.tsx app/login/page.tsx app/app/page.tsx app/_components/*.{ts,tsx}` returns only the `layout.tsx:5` comment).
- **Threat model coverage:** T-03-01/08 (open redirect via `?from=`) blocked by `safeFromPath` lines 20-21; T-03-09 (`javascript:`) blocked by line 20 (does not start with `/`); T-03-10 (`?from=/login*` loop) blocked by line 23.

---

_Reviewed: 2026-04-25_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
