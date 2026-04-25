---
phase: 03-protected-route-auth-guard
fixed_at: 2026-04-25T00:00:00Z
review_path: .planning/phases/03-protected-route-auth-guard/03-REVIEW.md
iteration: 1
findings_in_scope: 2
fixed: 1
skipped: 1
status: partial
---

# Phase 3: Code Review Fix Report

**Fixed at:** 2026-04-25
**Source review:** `.planning/phases/03-protected-route-auth-guard/03-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope (Critical + Warning): 2
- Fixed: 1
- Skipped: 1

Final gauntlet (lint + typecheck + build) green after fixes. Build output: 6/6 static pages generated; `/app` and `/login` both still prerender as static content, confirming L-1 (Suspense around `useSearchParams`) and L-9 (no `metadata` export from client layout) constraints are intact.

## Fixed Issues

### WR-01: `<AuthGuard>` only redirects on exact `"unauthenticated"` status; other non-authenticated states render `null` silently

**Files modified:** `app/_components/AuthGuard.tsx`
**Commit:** `1813085`
**Applied fix:** Inverted the `useEffect` redirect condition from exact-match
(`authStatus === "unauthenticated"`) to default-deny
(`authStatus !== "authenticated" && authStatus !== "configuring"`). The
component now has an exhaustive three-way mental model:
`configuring` → spinner; `authenticated` → children; everything else → redirect.
This is defensive against any future Amplify AuthStatus widening (e.g.
`signOut`, `refreshing`, or other Authenticator route states) — the guard will
schedule a bounce instead of rendering blank.

Also updated:
- The JSDoc to describe the new three-way model (subsumes IN-02's grammar fix
  for the same JSDoc — the rewrite drops the broken "Mounts ... is assumed"
  sentence entirely).
- The trailing `// unauthenticated — redirect effect has fired` comment to
  match the new branch semantics ("any non-authenticated, non-configuring
  state").

Verification: `bun run lint` clean (0 warnings, `--max-warnings=0`),
`bun run typecheck` clean, `bun run build` succeeded with 6/6 static pages.

## Skipped Issues

### WR-02: `?from=` only preserves pathname, drops query string and hash

**File:** `app/_components/AuthGuard.tsx:27` (now line 35 after WR-01 fix)
**Reason:** Deferred — requires Suspense boundary refactor. Adding
`useSearchParams` to `<AuthGuard>` forces every consumer (currently
`app/app/layout.tsx`) into a Suspense boundary per Next.js App Router rules
(L-1). That refactor is non-trivial and risks a build regression for a latent
bug: no protected route in v1 currently uses query-string state, so the
fidelity loss is theoretical. The orchestrator instructions explicitly
recommended skipping this in iteration 1 and the REVIEW.md itself flagged it
as "deferred-acceptable."
**Original issue:** `usePathname()` returns only the URL path, excluding
`?bar=baz` and `#section`. If a signed-out user lands on
`/app/dashboard?tab=settings`, the post-login bounce-back goes to
`/app/dashboard`, dropping `?tab=settings`. Becomes user-visible the moment
any protected route adopts query-param state.
**Re-open trigger:** Implement WR-02 the iteration before any protected route
starts using `?` query params for routable state. At that point, also wrap
the consumer (`app/app/layout.tsx` body) in `<Suspense>` so the `useSearchParams`
addition does not regress static prerender.

---

_Fixed: 2026-04-25_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
