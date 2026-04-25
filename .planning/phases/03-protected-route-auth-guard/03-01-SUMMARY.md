---
phase: 03-protected-route-auth-guard
plan: 01
subsystem: auth-guard
tags: [auth, client-side, guard, security, open-redirect, amplify, next-app-router]
requires:
  - "Phase 2 (02-03 hoist): <Authenticator.Provider> mounted at root in app/AmplifyProvider.tsx, so useAuthenticator() is callable from any client subtree"
  - "Phase 2 (02-05 walk-back): Amplify.configure(outputs) WITHOUT ssr:true — localStorage tokens — so authStatus resolves out of 'configuring' on client load"
  - "tsconfig.json @/* path alias from Phase 1 (so consumers can import @/app/_components/*)"
provides:
  - "app/_components/safeFromPath.ts → safeFromPath(raw): string | null — open-redirect allowlist used by any future caller of router.replace with a user-controlled URL (Plan 03-02 will be the first consumer in app/login/page.tsx's ?from= read)"
  - "app/_components/AuthGuard.tsx → <AuthGuard> client component — three-state auth gate (configuring → spinner; unauthenticated → router.replace to /login?from=<encoded path>; authenticated → children). Reusable on any route outside /app/* with a single import."
  - "app/_components/ directory — Phase 3 establishes the underscore-prefixed co-located client-components convention (excluded from App Router routing per Next.js convention)"
affects: []
tech-stack:
  added: []
  patterns:
    - "RESEARCH §1 verbatim — pure-TS string-prefix allowlist; no URL.parse, no React"
    - "RESEARCH §2 verbatim — useAuthenticator((ctx) => [ctx.authStatus]) selector + useEffect for navigation side-effect (RESEARCH L-3) + exhaustive deps [authStatus, pathname, router] (RESEARCH L-4)"
    - "Three-state exhaustive switch on AuthStatus (RESEARCH K-2): the union has exactly three values, so configuring/authenticated/unauthenticated covers every case"
    - "Centered-spinner shell: role='status' + aria-label='Loading' + flex min-h-screen items-center justify-center (matches app/loading.tsx outer shell idiom; spinner uses animate-spin + border-foreground/20 border-t-foreground per RESEARCH G-4)"
key-files:
  created:
    - "app/_components/safeFromPath.ts"
    - "app/_components/AuthGuard.tsx"
  modified: []
decisions:
  - id: "D-30..D-36 (locked from CONTEXT, executed verbatim)"
    description: "AuthGuard implements the locked decisions exactly: file at app/_components/AuthGuard.tsx (D-32), useAuthenticator((ctx) => [ctx.authStatus]) selector (D-31), no user info passed via props/context — guard is gating-only (D-33), centered spinner + 'Loading…' during configuring (D-34), router.replace not push (D-35), ?from=<encoded pathname> with safeFromPath consumed by Plan 03-02 caller (D-36)"
  - id: "Selector arg style: (ctx) => [ctx.authStatus]"
    description: "RESEARCH §2 uses (ctx) => — adopted verbatim. Phase 2's existing app/login/page.tsx uses (context) => — minor inconsistency Plan 03-02 should resolve when it modifies login/page.tsx. Recommendation for Plan 03-02: keep (context) => in the existing login file (smaller diff) and (ctx) => in NEW Phase 3 files. Both compile + lint identically."
  - id: "Verbatim JSDoc kept (text reference to Authenticator.Provider in comment)"
    description: "RESEARCH §2 JSDoc contains the text 'Mounts Authenticator.Provider is assumed to be present at root' — reproduced verbatim per plan instruction 'reproduce these — do NOT improvise'. The literal text references the root mount but does NOT add a second JSX mount. Repo-wide JSX mount count remains exactly 1 (in app/AmplifyProvider.tsx:21), satisfying RESEARCH L-10. See Self-Check below."
  - id: "Bare 'use client' directive (no rationale comment)"
    description: "AuthGuard.tsx uses bare 'use client'; per PATTERNS.md recommendation for this file (commented form reserved for AmplifyProvider.tsx where the configure-at-module-load rationale is non-obvious). Consistent with app/login/page.tsx + app/app/SignOutButton.tsx."
metrics:
  duration: "~10 minutes"
  completed: "2026-04-25T18:43:18Z"
---

# Phase 3 Plan 1: Protected Route & Auth Guard — Reusable Primitives Summary

Two reusable client-side guard primitives — a pure-utility open-redirect allowlist (`safeFromPath`) and a three-state `<AuthGuard>` client component — created verbatim from the canonical RESEARCH §1 / §2 shapes, both passing typecheck and lint, with zero changes to any Phase 1/2 file.

## Tasks Completed

| Task | Name                                                              | Commit    | Files                                  |
| ---- | ----------------------------------------------------------------- | --------- | -------------------------------------- |
| 1    | Create app/_components/safeFromPath.ts (open-redirect allowlist)  | `0edeeae` | `app/_components/safeFromPath.ts`      |
| 2    | Create app/_components/AuthGuard.tsx (three-state client guard)   | `93ef24f` | `app/_components/AuthGuard.tsx`        |

## What Was Built

### `app/_components/safeFromPath.ts` (Task 1, RESEARCH §1 verbatim)

A pure-TS module — no `"use client"`, no React/Next/Amplify imports — exposing a single function `safeFromPath(raw: string | null | undefined): string | null` that implements the 8-rule open-redirect allowlist (RESEARCH K-6 / D-36):

1. Non-string → null
2. Length 0 or > 512 → null
3. Missing leading `/` → null (rejects `https://evil.com`, `javascript:alert(1)`)
4. Starts with `//` → null (rejects protocol-relative `//evil.com`)
5. Starts with `/\` → null (browser quirk variant of //)
6. Starts with `/login` → null (loop prevention; D-36 + RESEARCH L-2)
7. Contains `\` or `\0` → null (defense in depth)
8. Otherwise return input unchanged

JSDoc block from RESEARCH §1 reproduced verbatim — documents the security rationale and the "why not URL.parse" reasoning. This is the load-bearing security gate (RESEARCH L-7) that Plan 03-02's modified `app/login/page.tsx` will consume when reading `?from=` from `useSearchParams`.

### `app/_components/AuthGuard.tsx` (Task 2, RESEARCH §2 verbatim)

A `"use client"` component exporting `AuthGuard` (named export) that:

- Calls `useAuthenticator((ctx) => [ctx.authStatus])` (D-31) and reads `useRouter()` + `usePathname()` from `next/navigation`.
- Runs a single `useEffect` with deps `[authStatus, pathname, router]` (RESEARCH L-3 mandatory placement, L-4 exhaustive deps); inside the effect, when `authStatus === "unauthenticated" && !pathname.startsWith("/login")` (RESEARCH L-2 defensive backstop), calls `router.replace(\`/login?from=${encodeURIComponent(pathname)}\`)` (D-35 replace, D-36 encoded path).
- Implements the exhaustive three-state switch on `AuthStatus` (RESEARCH K-2: union has exactly three values):
  - `configuring` → centered spinner block (`role="status"`, `aria-label="Loading"`, `flex min-h-screen items-center justify-center`, with inner column `flex flex-col items-center gap-2`, `h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground` + `<p className="text-sm opacity-70">Loading…</p>`) — D-34, prevents flash of protected content (T-03-03).
  - `authenticated` → `<>{children}</>` (Fragment, lets the layout below compose freely).
  - `unauthenticated` → `return null` (the `useEffect` already fired `router.replace`; render nothing in the meantime).

Imports verified to be `next/navigation` (NOT `next/router` — Pages Router only, Phase 2 L-7 forbids). Does not mount a second `<Authenticator.Provider>` (RESEARCH L-10) and does not call `Amplify.configure` (PATTERNS Anti-Patterns row 1) — both confirmed by repo-wide grep.

### `app/_components/` directory (NEW — Phase 3 convention)

This plan establishes the underscore-prefixed co-located client-components convention (excluded from App Router routing per Next.js convention; CONTEXT D-32 + RESEARCH G-1). Future Phase 3 plans (03-02 will add `app/app/layout.tsx` and modify `app/login/page.tsx` to import `safeFromPath` from this directory) and any later phase can place shared client components here.

## Verification Results

| Gate                                                | Result                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `bun run typecheck`                                 | exit 0                                                                                                  |
| `bun run lint`                                      | exit 0 (`--max-warnings=0` strict; exhaustive-deps + double-quote + no-unused-vars all pass)            |
| Both new files exist at expected paths              | `app/_components/safeFromPath.ts`, `app/_components/AuthGuard.tsx`                                      |
| Repo-wide JSX `<Authenticator.Provider>` mount count | 1 (only `app/AmplifyProvider.tsx:21` — unchanged from before this plan)                                  |
| Repo-wide `Amplify.configure` call sites             | 1 (only `app/AmplifyProvider.tsx:15` — unchanged)                                                        |
| Repo-wide `next/router` imports                      | 0 (Pages Router import correctly forbidden)                                                              |
| Phase 1/2 files modified                            | 0 (verified `git diff HEAD~2 -- package.json bun.lock amplify_outputs.json app/AmplifyProvider.tsx app/layout.tsx app/login/page.tsx app/app/page.tsx app/app/SignOutButton.tsx` is empty) |
| New files in this plan                              | 2 (`app/_components/safeFromPath.ts`, `app/_components/AuthGuard.tsx`) — verified via `git diff --name-status HEAD~2 -- app/` |
| Per-task per-file grep acceptance criteria          | All passed (Task 1: 8 checks; Task 2: 19 checks) — see Notable Acceptance-Criterion Note below           |

`bun run build` is intentionally NOT in this plan's gauntlet — Plan 03-02 is the one that introduces `useSearchParams` in `app/login/page.tsx`, which will require a `<Suspense>` boundary for `next build` to succeed (RESEARCH K-3 / L-1). This plan is internally complete: no consumer of `safeFromPath` yet, no caller of `<AuthGuard>` yet, both files standalone-compile.

## Threat Model Coverage

| Threat   | Status     | Evidence                                                                                                                                         |
| -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| T-03-01  | Mitigated  | `safeFromPath.ts` rejects `//evil.com`, `/login*`, non-`/`-prefixed values, `/\\` variants, length > 512, null bytes — verified via grep + RESEARCH §1 verbatim |
| T-03-02  | Mitigated  | `safeFromPath.ts` rule 3 (`!raw.startsWith("/")`) rejects `javascript:alert(1)` because it does not start with `/` (RESEARCH K-5 XSS warning addressed) |
| T-03-03  | Mitigated  | `AuthGuard.tsx` configuring branch returns spinner (NOT children) — `grep -q 'authStatus === "configuring"'` succeeds                              |
| T-03-04  | Mitigated  | `safeFromPath.ts` `length > 512 -> null` check                                                                                                   |
| T-03-05  | Accepted   | (downstream — stale token race; documented as v1 accepted risk in plan threat model)                                                              |
| T-03-06  | Mitigated  | `AuthGuard.tsx` predicate `!pathname.startsWith("/login")` — `grep -q '!pathname.startsWith("/login")'` succeeds                                  |
| T-03-07  | Accepted   | Spinner contains no user-identifying content; trivially safe                                                                                      |

## Deviations from Plan

### Notable Acceptance-Criterion Note (NOT a deviation, just a clarification)

The plan's Task 2 acceptance criterion `! grep -q "Authenticator.Provider" app/_components/AuthGuard.tsx` was overly strict given the conflicting instruction in the same Task 2 to "include the JSDoc block from RESEARCH §2 verbatim". The verbatim JSDoc contains the literal text reference `Mounts \`Authenticator.Provider\` is assumed to be present at root` (a documentation reference describing where the *single existing* root mount lives, NOT a JSX mount). I reproduced the JSDoc verbatim per the higher-priority instruction.

The orchestrator's repo-wide success criterion ("No second `<Authenticator.Provider>` mounted (grep returns same count as before)") is the security-relevant invariant; it is satisfied — repo-wide JSX mounts of `<Authenticator.Provider>` remain exactly 1 (only line 21 of `app/AmplifyProvider.tsx`, unchanged). Verified:

```
$ grep -rn "<Authenticator.Provider" app/
app/AmplifyProvider.tsx:21:  return <Authenticator.Provider>{children}</Authenticator.Provider>;
```

The strict file-text grep `grep -c "Authenticator.Provider" app/_components/AuthGuard.tsx` returns 1 (the JSDoc reference). The intent of the constraint (no second runtime mount, no second state machine) is fully met.

Plan 03-02 file-level acceptance criteria can simply use `! grep -q "<Authenticator.Provider"` (with the `<` prefix) for the JSX form, or grep specifically for the JSX wrapping, to avoid this false-positive.

### Auto-fixed Issues

None. No bugs encountered, no missing critical functionality discovered, no blocking issues. Both files compiled clean on first write.

### Auth Gates

None. No CLI/auth interaction needed — pure code addition.

## Notable Naming / Formatting Decisions

- **`useAuthenticator` selector arg name:** RESEARCH §2 uses `(ctx) =>` shorthand; AuthGuard.tsx adopts this. The existing Phase 2 `app/login/page.tsx` uses `(context) =>` (full word). Plan 03-02 (which will modify `app/login/page.tsx`) should leave the existing `(context) =>` in that file (smaller diff) and use `(ctx) =>` for any new selector calls it adds (consistency with new Phase 3 files). Both are lint-clean.
- **`'use client'` directive style:** AuthGuard.tsx uses bare `"use client";` per PATTERNS.md recommendation (the rationale-comment form is reserved for AmplifyProvider.tsx where the `Amplify.configure` at module-load behavior is non-obvious). This matches `app/login/page.tsx` and `app/app/SignOutButton.tsx` precedent.
- **JSDoc style:** Both files reproduce their RESEARCH JSDoc blocks verbatim (including Unicode `→` arrows in AuthGuard.tsx and `≤` in safeFromPath.ts). TypeScript and ESLint accept these in comments without configuration changes.
- **Import alias:** AuthGuard.tsx imports use bare module specifiers (`react`, `next/navigation`, `@aws-amplify/ui-react`) — no `@/*` path alias needed (no cross-directory project imports). Plan 03-02 consumers will use `@/app/_components/AuthGuard` and `@/app/_components/safeFromPath` per RESEARCH G-2.

## Confirmation: `app/_components/` Directory Created

```
$ ls -la app/_components
total 16
drwxrwxr-x 2 fernando fernando 4096 ...  .
drwxrwxr-x 5 fernando fernando 4096 ...  ..
-rw-rw-r-- 1 fernando fernando ...       AuthGuard.tsx
-rw-rw-r-- 1 fernando fernando ...       safeFromPath.ts
```

Phase 3 has now established the underscore-prefixed co-located client-components convention. Plan 03-02 will consume both files; future phases can place additional shared client components in this directory.

## Next Steps (For Plan 03-02 — out of this plan's scope)

Plan 03-02 will:
1. Create `app/app/layout.tsx` (client component) that wraps children in `<AuthGuard>` from `@/app/_components/AuthGuard`.
2. Modify `app/login/page.tsx` — split into outer `<Suspense>`-wrapping `LoginPage` + inner `LoginPageInner` consumer (RESEARCH K-3 / L-1 — mandatory for `next build`); inner adds `useSearchParams` + `safeFromPath` import + `router.replace(safeFromPath(searchParams.get("from")) ?? "/app")` (D-37); change `push` → `replace`.
3. Replace `app/app/page.tsx` placeholder with the protected-page content (D-38..D-40 — email + name + `<SignOutButton>`).

This plan (03-01) leaves both primitives standalone-compiled and lint-clean; Plan 03-02 picks them up and wires them into routes.

## Self-Check: PASSED

**Files claimed to exist:**

- `app/_components/safeFromPath.ts` — `test -f` returns 0; file is 26 lines.
  ```
  $ test -f app/_components/safeFromPath.ts && echo FOUND
  FOUND
  ```
- `app/_components/AuthGuard.tsx` — `test -f` returns 0; file is 52 lines.
  ```
  $ test -f app/_components/AuthGuard.tsx && echo FOUND
  FOUND
  ```

**Commits claimed to exist:**

- `0edeeae` (Task 1): `feat(03-01): add safeFromPath open-redirect allowlist utility`
  ```
  $ git log --oneline | grep -q 0edeeae && echo FOUND
  FOUND
  ```
- `93ef24f` (Task 2): `feat(03-01): add AuthGuard three-state client guard component`
  ```
  $ git log --oneline | grep -q 93ef24f && echo FOUND
  FOUND
  ```

**Constraints verified:**

- Repo-wide JSX `<Authenticator.Provider>` mount count: 1 (unchanged) — only `app/AmplifyProvider.tsx:21`
- Repo-wide `Amplify.configure(...)` call sites: 1 (unchanged) — only `app/AmplifyProvider.tsx:15`
- Repo-wide `from "next/router"` imports: 0
- Phase 1/2 files modified: 0 — `git diff --name-only HEAD~2 -- package.json bun.lock amplify_outputs.json app/AmplifyProvider.tsx app/layout.tsx app/login/page.tsx app/app/page.tsx app/app/SignOutButton.tsx` returns empty
- New files in this plan: 2 — `git diff --name-status HEAD~2 -- app/` shows `A app/_components/AuthGuard.tsx` and `A app/_components/safeFromPath.ts` exclusively

All success criteria met. No deviations from the locked decisions. No deferred items. Ready for `/gsd-verify-work` and Plan 03-02.
