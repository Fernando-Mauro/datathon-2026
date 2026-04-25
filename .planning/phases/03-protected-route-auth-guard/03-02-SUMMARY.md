---
phase: 03-protected-route-auth-guard
plan: 02
subsystem: auth
tags: [next16, app-router, suspense, useSearchParams, useAuthenticator, fetchUserAttributes, amplify-v6, cognito, protected-route, auth-guard, layout, open-redirect]

# Dependency graph
requires:
  - phase: 03-protected-route-auth-guard (Wave 1, Plan 03-01)
    provides: "<AuthGuard> three-state client component (configuring → spinner; authenticated → children; unauthenticated → router.replace to /login?from=<path>) and safeFromPath(raw) → string | null pure validator"
  - phase: 02-email-password-auth-authenticator-ui
    provides: "<Authenticator.Provider> mounted at root in app/AmplifyProvider.tsx; Amplify.configure(outputs) without ssr:true; existing <SignOutButton> at app/app/SignOutButton.tsx; existing app/login/page.tsx redirect-on-authenticated useEffect pattern"
provides:
  - "app/app/layout.tsx — client layout that wraps every /app/* route in <AuthGuard> (D-30); zero-boilerplate inheritance for future protected sub-routes"
  - "app/app/page.tsx — protected /app page rendering Welcome + email (sync, useAuthenticator) + name (async, fetchUserAttributes with cancellation flag) + <SignOutButton> reused"
  - "app/login/page.tsx — split into outer LoginPage (Suspense default export) + inner LoginPageInner (useSearchParams consumer) with safeFromPath-validated ?from= bounce-back via router.replace"
  - "Verified Suspense + useSearchParams pattern compatible with bun run build (Next 16.2.4, Turbopack)"
affects: [03-03 verification gauntlet plan, future protected sub-routes under /app/*, future Phase 4 hosting deploy]

# Tech tracking
tech-stack:
  added: []  # Zero new dependencies — all APIs (useAuthenticator, fetchUserAttributes, useSearchParams, Suspense) already installed by Phase 1/2.
  patterns:
    - "Layout-level <AuthGuard> mount via client app/app/layout.tsx — establishes the canonical Phase-3 reusable-guard pattern (ROADMAP success criterion 3)"
    - "Outer Suspense wrapper + inner useSearchParams consumer split — required for Next 16 production builds when reading URL query string from a Client Component (RESEARCH K-3 / L-1)"
    - "Cancellation-flag pattern around async fetchUserAttributes() in one-shot useEffect — prevents post-unmount setState (React 19 strict-mode-safe)"
    - "Open-redirect defense via safeFromPath ?? \"/app\" routed through router.replace — never pass untrusted searchParams.get() value to router APIs (RESEARCH L-7)"

key-files:
  created:
    - "app/app/layout.tsx"
  modified:
    - "app/app/page.tsx"  # REPLACED — placeholder removed
    - "app/login/page.tsx"

key-decisions:
  - "Reproduced RESEARCH §3 / §4 / §5 verbatim — no API improvisation. Comments and selector style preserved per plan instructions."
  - "Removed `// eslint-disable-next-line no-console` comment from app/app/page.tsx dev-mode console.warn (Rule 3 deviation): the project eslint config (eslint-config-next + nextTs) does NOT enable no-console, so the disable directive itself triggered a 'Unused eslint-disable directive' warning under --max-warnings=0. The dev-mode console.warn now lints clean without it."
  - "Login page useAuthenticator selector kept as `(context) => [context.authStatus]` (Phase 2 form, full word) per plan §canonical_excerpts NOTE — minimizes diff vs the existing Phase 2 line."
  - "amplify_outputs.json copied from parent worktree at execution start so typecheck/build can resolve `@/amplify_outputs.json`. The file is gitignored (line 46 of .gitignore) so it does NOT appear in any commit; it stays a local-only resolution input for the build."

patterns-established:
  - "Pattern: Client layout with no metadata export — `app/app/layout.tsx` shows the only correct shape for a `\"use client\"` layout (RESEARCH K-4 / L-9 — `next build` errors on `\"use client\"` + metadata)"
  - "Pattern: Page-level Suspense for useSearchParams — outer default-export wraps inner consumer; fallback reuses centered \"Loading…\" idiom for visual continuity with the inner `configuring` render"
  - "Pattern: safeFromPath route-through — every router.replace argument that originates from URL query is wrapped: `safeFromPath(searchParams.get(\"from\")) ?? \"/app\"`"

requirements-completed: [AUTH-04]

# Metrics
duration: ~12 min
completed: 2026-04-25
---

# Phase 3 Plan 02: Wire <AuthGuard> + Protected /app + ?from= Bounce-back Summary

**Wave-1 primitives wired into live routes: `app/app/layout.tsx` mounts `<AuthGuard>` for /app/*, `app/app/page.tsx` replaces the Phase 2 placeholder with email + name + sign-out, `app/login/page.tsx` splits into Suspense + safeFromPath-validated `?from=` bounce-back via `router.replace`.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-25T18:46:00Z (approx)
- **Completed:** 2026-04-25T18:58:01Z
- **Tasks:** 3 of 3
- **Files modified:** 3 (1 created, 1 replaced, 1 modified)

## Accomplishments

- **Visiting `/app` without session redirects to `/login?from=%2Fapp`** — `app/app/layout.tsx` (NEW, 13 lines) mounts `<AuthGuard>` at the layout level so every `/app/*` route inherits gating without per-route boilerplate. ROADMAP success criterion 1 mechanically satisfied.
- **Visiting `/app` with session shows email + name + sign-out** — `app/app/page.tsx` (REPLACED, 41 lines) reads email synchronously from `useAuthenticator(({user})=>[user]).user.signInDetails?.loginId` (RESEARCH K-8) and name asynchronously from `fetchUserAttributes()` with cancellation flag + try/catch + dev-mode `console.warn` fallback to email-only. ROADMAP success criterion 2 mechanically satisfied.
- **Reusable layout-level guard pattern established** — `<AuthGuard>` mounted inside the route segment's layout file is the canonical Phase-3 idiom; future `/app/foo`, `/app/bar` etc. inherit it for free. ROADMAP success criterion 3 mechanically satisfied.
- **`bun run build` exits 0** — the load-bearing Suspense regression (RESEARCH L-1 / K-3) is closed at build time. `app/login/page.tsx` (MODIFIED, 45 lines) splits into outer Suspense default export + inner `LoginPageInner` consumer of `useSearchParams`. Without this split, Next 16 errors with "Missing Suspense boundary with useSearchParams" during static generation.
- **Open-redirect attack surface closed** — the inner login useEffect routes `searchParams.get("from")` through `safeFromPath` (Wave 1 deliverable) and falls back to `/app` via `?? "/app"`. `?from=//evil.com`, `?from=javascript:…`, `?from=/login`, `?from=%00…`, and length-overflow inputs all collapse to `/app`. `router.replace` (NOT `push`) used so the browser back button never traps the user in a `/login → /app → /login` loop.
- **Provider invariants preserved** — repo-wide `<Authenticator.Provider` JSX mount count remains 1 (only in `app/AmplifyProvider.tsx:21`); `Amplify.configure` count remains 1 (in `app/AmplifyProvider.tsx:15`). No regression of Phase 2 plan-05 walk-back.
- **Zero net change** to `package.json`, `bun.lock`, `amplify_outputs.json`, `app/AmplifyProvider.tsx`, `app/layout.tsx`, `app/app/SignOutButton.tsx` (Phase 1/2 surface untouched).

## Task Commits

Each task was committed atomically (`--no-verify` per parallel-executor protocol):

1. **Task 1: CREATE app/app/layout.tsx — client layout that mounts &lt;AuthGuard&gt;** — `bd4bd39` (feat)
2. **Task 2: REPLACE app/app/page.tsx — protected page rendering email + name + SignOutButton** — `6882916` (feat)
3. **Task 3: MODIFY app/login/page.tsx — split into Suspense outer + inner consumer with safeFromPath + replace** — `e9cd8e5` (feat)

**Plan metadata:** [pending — final SUMMARY commit follows this file]

## Files Created/Modified

- **`app/app/layout.tsx`** (NEW, 13 lines) — `"use client"` client layout, default export `AppLayout` that returns `<AuthGuard>{children}</AuthGuard>`. Single import: `AuthGuard` from `@/app/_components/AuthGuard`. NO `metadata` export (RESEARCH K-4 / L-9). NO second `<Authenticator.Provider>` (RESEARCH L-10).
- **`app/app/page.tsx`** (REPLACED, 41 lines, was 14-line placeholder) — `"use client"` protected page. Function rename `AppPlaceholder` → `AppPage`. Reads email sync via `useAuthenticator(({user})=>[user]).user?.signInDetails?.loginId`; reads name async via `fetchUserAttributes()` in one-shot `useEffect` with cancellation flag, try/catch fallback to email-only, dev-mode `console.warn` on failure. Renders `<main>` (centered-content variant 2: `flex min-h-screen flex-col items-center justify-center gap-4 p-8`) with `<h1 className="text-2xl font-semibold">{name ? \`Welcome, ${name}\` : "Welcome"}</h1>`, conditional `<p className="text-sm opacity-70">Signed in as {email}</p>`, and `<SignOutButton/>` reused. Deleted the 14-line "Phase 4 will add" placeholder copy.
- **`app/login/page.tsx`** (MODIFIED, 45 lines, was 25 lines) — `"use client"` page split into:
  - `LoginPageInner()` (top-level fn, NOT exported) — consumes `useRouter`, `useSearchParams`, `useAuthenticator((context)=>[context.authStatus])`. `useEffect` reads `searchParams.get("from")`, runs through `safeFromPath`, falls back to `"/app"` via `?? "/app"`, calls `router.replace(from)`. Deps: `[authStatus, router, searchParams]` (exhaustive — RESEARCH L-4). JSX renders `<main>` with `min-h-screen items-center justify-center p-8`, conditional Loading…, and `<Authenticator/>` when not authenticated.
  - `LoginPage()` (default export) — wraps `<LoginPageInner/>` in `<Suspense>` with a centered "Loading…" `<main>` fallback. Inline comment documents WHY the boundary is mandatory (K-3 / L-1).
  - Imports added: `Suspense` (from react), `useSearchParams` (from next/navigation), `safeFromPath` (from `@/app/_components/safeFromPath`).
  - Removed: `router.push("/app")` (replaced with `router.replace(from)`).

## Decisions Made

- **Verbatim reproduction of RESEARCH §3 / §4 / §5.** All three files were written from the canonical excerpts in 03-RESEARCH.md (and reproduced in 03-02-PLAN.md `<canonical_excerpts>`). Zero API improvisation; the only mechanical adjustments were the ones already documented in the plan (selector style preserved, sibling-import style preserved, double-quotes throughout).
- **Login page selector kept as `(context) => [context.authStatus]`** (Phase 2 form, full word `context`) per plan note: "this plan keeps the existing `(context) =>` form in `app/login/page.tsx` because the modification is a minimal-diff (existing line stays identical)." `<AuthGuard>` (Wave 1) uses `(ctx)`. PATTERNS notes both compile clean — selection is per-file consistency, not repo-wide.
- **No custom `User` TS type, no `<Suspense>` around fetchUserAttributes, no rendering of `user.username`** (Cognito sub UUID) — all per RESEARCH Open Q-3 / Q-5 / Q-6 ratified recommendations + plan §canonical_excerpts.
- **`useEffect` deps array for the inner login fn is `[authStatus, router, searchParams]`** — exhaustive per RESEARCH L-4. The old 2-element array `[authStatus, router]` from Phase 2 D-26 is fully replaced; verified by `! grep -E '\[authStatus, router\]\s*\)' app/login/page.tsx`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Removed `// eslint-disable-next-line no-console` comment from `app/app/page.tsx`**
- **Found during:** Task 2 (REPLACE app/app/page.tsx) — `bun run lint` failed with "Unused eslint-disable directive (no problems were reported from 'no-console')" under `--max-warnings=0`.
- **Issue:** The plan instruction (Task 2 action item 5) said "Line-level `// eslint-disable-next-line no-console` is required because the project ESLint config (per Phase 1) flags raw `console.*` calls as warnings, and `--max-warnings=0` would fail the build." This was a planning over-precaution. The actual `eslint.config.mjs` extends only `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` — neither of which enables the `no-console` rule. So `console.warn(...)` on its own lints clean; the disable directive itself becomes the violation.
- **Fix:** Removed the single line `// eslint-disable-next-line no-console` from inside the dev-mode try/catch in `app/app/page.tsx`. The `console.warn(...)` call remains intact and gated by `process.env.NODE_ENV !== "production"` per RESEARCH L-6.
- **Files modified:** `app/app/page.tsx` (one-line deletion)
- **Verification:** `bun run lint` → exit 0 (zero warnings). `bun run typecheck` → exit 0. `bun run build` → exit 0 with the `console.warn` still present in the bundle (dev-only via env guard).
- **Committed in:** `6882916` (Task 2 commit; the fix was applied before the task commit, so the deviation is captured inside the same atomic commit).

**2. [Rule 3 — Blocking] Copied `amplify_outputs.json` from parent worktree at execution start**
- **Found during:** Task 1 verification — `bun run typecheck` failed with `app/AmplifyProvider.tsx(5,21): error TS2307: Cannot find module '@/amplify_outputs.json' or its corresponding type declarations`.
- **Issue:** Worktrees do NOT inherit gitignored files. `amplify_outputs.json` is gitignored (line 46 of `.gitignore`: `amplify_outputs*`), so the freshly-cloned worktree was missing it. Without the file, Phase 2's `app/AmplifyProvider.tsx:5` import fails to resolve → typecheck/build cannot run → the entire verification gauntlet for Phase 3 plan-2 cannot pass.
- **Fix:** `cp /home/fernando/Documents/datathon-2026/amplify_outputs.json amplify_outputs.json` (copied from parent worktree where Phase 2 plan-04/05 generated it via the live sandbox deploy).
- **Files modified:** `amplify_outputs.json` (new in worktree, but gitignored — does NOT appear in any commit). Verified by `git status --short`: only the three intended task files appear.
- **Verification:** `bun run typecheck` exits 0 after copy. The file does not enter version control (gitignored).
- **Committed in:** N/A — gitignored, present in worktree filesystem only for build-time module resolution. No commit hash associated.

**3. [Rule 3 — Blocking] Ran `bun install --frozen-lockfile` before `bun run build`**
- **Found during:** Task 3 verification — `bun run build` requires `node_modules/`, but the worktree was freshly created without dependencies installed.
- **Issue:** Parallel worktree agents inherit only tracked files and gitignored project files at branch creation; `node_modules/` is gitignored and not propagated.
- **Fix:** `bun install --frozen-lockfile` (1233 packages, ~3.5s). Lockfile-locked install — guarantees identical resolution to parent worktree.
- **Files modified:** `node_modules/` populated (all gitignored). `bun.lock` unchanged (frozen).
- **Verification:** `bun run audit` → exit 0 (with the standard ignore list). `bun run build` → exit 0.
- **Committed in:** N/A — `node_modules/` gitignored.

---

**Total deviations:** 3 auto-fixed (3 Rule 3 — Blocking)
**Impact on plan:** Deviation #1 (eslint-disable removal) is a one-line correction to a planning over-precaution; the dev-mode console.warn behaviour is unchanged. Deviations #2 and #3 are environmental (worktree bootstrap of gitignored files) and do not enter version control. Zero scope creep, zero functional changes vs the plan's intent.

## Issues Encountered

- **Suspense boundary not yet validated in production build** (resolved): the load-bearing assertion of Task 3 was that `bun run build` exits 0 — proving RESEARCH L-1 / K-3 is closed. **Resolved.** Build output: `✓ Compiled successfully in 1794ms` and all 6 routes statically generated, including `/login` (which uses `useSearchParams`). The page-level Suspense wrap is correct.
- **Workspace root inference warning** (pre-existing, non-blocking): `bun run build` emits `⚠ Warning: Next.js inferred your workspace root, but it may not be correct. We detected multiple lockfiles…` because the parent repo and the worktree each have a `bun.lock`. This is the standard worktree-bootstrap signal; build still completes successfully. Documented for future resolution if needed (e.g., `turbopack.root` in `next.config.ts`), but out of scope for this plan.

## Verification Gauntlet Evidence (`bun run typecheck && lint && audit && build`)

| Step | Command | Exit | Notes |
|------|---------|------|-------|
| 1 | `bun run typecheck` | 0 | tsc --noEmit clean across all touched files (post-amplify_outputs.json copy) |
| 2 | `bun run lint` | 0 | eslint . --max-warnings=0 clean (post-deviation #1 eslint-disable removal) |
| 3 | `bun run audit` | 0 | bun audit clean at moderate level with the package.json ignore list |
| 4 | `bun run build` | 0 | **Load-bearing.** Next 16.2.4 Turbopack production build, 6/6 static pages including `/login` (proves Suspense boundary is correctly placed for K-3 / L-1). |

## Provider Invariants

```
$ grep -rn "<Authenticator.Provider" app/
app/AmplifyProvider.tsx:21:  return <Authenticator.Provider>{children}</Authenticator.Provider>;
```
Count: 1 (RESEARCH L-10 holds — no double-mount).

```
$ grep -rn "Amplify.configure" app/
app/AmplifyProvider.tsx:1:"use client"; // Runs Amplify.configure at module-load + provides Authenticator Context for hooks called outside <Authenticator>.
app/AmplifyProvider.tsx:15:Amplify.configure(outputs);
```
Count: 1 actual call (line 15) + 1 docstring mention (line 1, inside the `"use client"` comment). The functional invariant holds — exactly one `Amplify.configure(outputs)` call site in the entire `app/` tree, in `app/AmplifyProvider.tsx`. The Phase 2 plan-05 walk-back is preserved (no `ssr: true`, localStorage-backed tokens).

## Next Phase Readiness

- **Plan 03-03 (verification gauntlet plan)** is unblocked: all three Wave-2 file operations are committed atomically, the verification gauntlet (`typecheck && lint && audit && build`) passes, and the four manual flows from `03-VALIDATION.md` are now mechanically possible against `bun run dev`:
  1. Visit `/app` without session → expect redirect to `/login?from=%2Fapp`
  2. Sign in via `<Authenticator>` on `/login?from=/app` → expect redirect to `/app` (NOT hardcoded fallback)
  3. Visit `/app` with session → expect "Welcome, {name}" + "Signed in as {email}" + sign-out
  4. Visit `/login?from=//evil.com` (or `?from=javascript:…`, `?from=/login`) → expect redirect to `/app` after sign-in (NOT to evil.com / NOT executed JS / NOT looped)
- **No blockers** for Plan 03-03. The build proves K-3 / L-1 closure mechanically; the manual flows are the remaining live-runtime evidence.
- **No regressions** in Phase 1/2 surface — `git diff --name-only HEAD~3 HEAD` (i.e., the three task commits) touches only `app/app/layout.tsx`, `app/app/page.tsx`, `app/login/page.tsx`. Phase 1/2 files (`app/AmplifyProvider.tsx`, `app/layout.tsx`, `app/app/SignOutButton.tsx`, `app/error.tsx`, `app/loading.tsx`, `app/not-found.tsx`, `app/page.tsx`, `app/globals.css`) untouched.
- **Wave 1 deliverables** (`app/_components/AuthGuard.tsx`, `app/_components/safeFromPath.ts`) consumed correctly: `AuthGuard` imported in `app/app/layout.tsx`; `safeFromPath` imported in `app/login/page.tsx`. Both via the `@/app/_components/...` alias.

## Self-Check

Verifying claims before declaring complete:

**Files created/modified exist:**
- `app/app/layout.tsx` → FOUND (13 lines, `"use client"` first line, default export AppLayout, single AuthGuard import)
- `app/app/page.tsx` → FOUND (41 lines, REPLACED — placeholder copy gone, `AppPage` default export, useAuthenticator + fetchUserAttributes wired)
- `app/login/page.tsx` → FOUND (45 lines, MODIFIED — `LoginPageInner` + outer `LoginPage` Suspense default export, safeFromPath imported + used, router.replace not push, deps `[authStatus, router, searchParams]`)

**Commits exist on this worktree branch:**
- `bd4bd39` → FOUND (feat(03-02): add app/app/layout.tsx mounting <AuthGuard> for /app/* (D-30))
- `6882916` → FOUND (feat(03-02): replace /app placeholder with protected page (D-38..D-40))
- `e9cd8e5` → FOUND (feat(03-02): split login page for Suspense + ?from= bounce-back (D-37))

**Build proof:**
- `bun run build` → exit 0, 6/6 static pages generated, `/login` route static (Suspense boundary works in production)

## Self-Check: PASSED

---

*Phase: 03-protected-route-auth-guard*
*Plan: 02 (Wave 2 — wire primitives into live routes)*
*Completed: 2026-04-25*
