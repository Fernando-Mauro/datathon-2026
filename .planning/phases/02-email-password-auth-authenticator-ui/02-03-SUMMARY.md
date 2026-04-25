---
phase: 2
plan: "02-03"
status: complete
completed: 2026-04-25
duration_minutes: 3
tasks_completed: 5
files_changed: 6
commits:
  - "a06cd38"
  - "5f532ab"
  - "5353750"
  - "90aaed8"
  - "08fce05"
requirements_addressed:
  - AUTH-03
  - AUTH-05
subsystem: frontend
tags:
  - frontend
  - amplify-ui
  - app-router
  - next-16
dependency_graph:
  requires:
    - aws-amplify@6.16.4
    - "@aws-amplify/ui-react@6.15.3"
    - amplify_outputs.json (currently empty {"version":"1.4"}; auth block lands in Plan 02-04)
  provides:
    - "AmplifyProvider (root mount; Amplify.configure ssr:true at module-load)"
    - "/login route (Authenticator + post-auth redirect to /app)"
    - "/app placeholder route (Welcome + SignOutButton)"
    - "Sign in link on home page (top-right)"
  affects:
    - app/layout.tsx (additive: provider mount + Amplify CSS)
    - app/page.tsx (additive: Sign in Link)
tech_stack:
  added: []
  patterns:
    - "Client-only AmplifyProvider hoisted to root layout (RESEARCH §7 — supersedes CONTEXT D-23)"
    - "Cookie-based token storage via Amplify.configure(outputs, { ssr: true }) (RESEARCH L-3 — supersedes CONTEXT D-28 wording, fix lands in Plan 02-05)"
    - "useAuthenticator selector form to limit re-renders to authStatus changes (RESEARCH §6)"
    - "Bare <Authenticator /> Zero Configuration (RESEARCH L-6) — fields auto-rendered from amplify_outputs.json#standard_required_attributes"
    - "useEffect-driven router.push redirect on authStatus === 'authenticated' (D-26)"
    - "await signOut() BEFORE router.push (RESEARCH L-14 — cookie clear ordering)"
    - "v6 subpath imports: aws-amplify/auth (NOT v5 Auth namespace)"
    - "App Router useRouter from next/navigation (NOT Pages Router next/router per L-7)"
key_files:
  created:
    - app/AmplifyProvider.tsx
    - app/login/page.tsx
    - app/app/page.tsx
    - app/app/SignOutButton.tsx
  modified:
    - app/layout.tsx
    - app/page.tsx
key_decisions:
  - "AmplifyProvider lives at app/AmplifyProvider.tsx (ROOT) — supersedes CONTEXT D-23 which scoped it to /login. Reason: signOut() in /app would race against Amplify.configure() if provider were /login-only (RESEARCH §7 / L-2)."
  - "Amplify.configure(outputs, { ssr: true }) — REQUIRED for Next.js per official docs. Switches token storage to cookies (RESEARCH L-3). AUTH-05 still met (cookies survive refresh). CONTEXT D-28 wording fix is Plan 02-05 Task 5, NOT this plan."
  - "<Authenticator /> rendered bare — no signUpAttributes, formFields, components, loginMechanisms props. Zero Configuration auto-renders Email + Name + Password from amplify_outputs.json#standard_required_attributes (RESEARCH L-6)."
  - "useRouter sourced from next/navigation everywhere (App Router). next/router is Pages Router only and is forbidden by anti-pattern grep (L-7)."
  - "signOut imported from aws-amplify/auth (v6 subpath). v5 Auth namespace import is forbidden by anti-pattern grep."
  - "/app intentionally unguarded in Phase 2 per D-17. Phase 4 will add the redirect-if-no-session guard. Page copy explicitly mentions this."
  - "Home page additive change per D-16 (Claude's discretion) + RESEARCH OQ1: single absolute-positioned <Link href='/login'> top-right. All existing Image/h1/anchors preserved."
metrics:
  duration_minutes: 3
  tasks_completed: 5
  files_created: 4
  files_modified: 2
---

# Phase 2 Plan 03: Frontend Wiring (AmplifyProvider + /login + /app + Sign in link) Summary

JWT/Cognito-cookie auth UI wired end-to-end via AWS Amplify UI Authenticator: client-only `AmplifyProvider` at the root layout runs `Amplify.configure(outputs, { ssr: true })` at module-load, `/login` renders the bare `<Authenticator />` and redirects to `/app` on `authStatus === "authenticated"`, `/app` shows a Welcome placeholder + a `SignOutButton` that awaits `signOut()` before navigating home, and the home page gets a single top-right "Sign in" Link.

---

## What was built

### Task 1 — `app/AmplifyProvider.tsx` (CREATE, client component)

Client wrapper that:
- Imports `Amplify` from `aws-amplify`, `Authenticator` from `@aws-amplify/ui-react`, `outputs` from `@/amplify_outputs.json`
- Runs `Amplify.configure(outputs, { ssr: true })` at the **module top level** (before component definition) — fires once at bundle load
- Named-exports `AmplifyProvider({ children })` returning `<Authenticator.Provider>{children}</Authenticator.Provider>`
- Inline-typed props (`{ children: React.ReactNode }`) matching `app/error.tsx:13-16` style
- Inline comment explains `ssr: true` rationale (cookies, supersedes D-28 wording)

**Commit:** `a06cd38`

### Task 2 — `app/layout.tsx` (MODIFY, 3 additive changes)

Three additive changes to the existing 33-line root layout, preserving everything else:
- ADDED `import { AmplifyProvider } from "./AmplifyProvider";` (sibling import, between `next/font/google` and `./globals.css`)
- ADDED `import "@aws-amplify/ui-react/styles.css";` (after `./globals.css` so Amplify CSS layer can override globals if needed)
- WRAPPED `{children}` with `<AmplifyProvider>{children}</AmplifyProvider>` inside `<body>`

PRESERVED EXACTLY:
- `metadata.title === "Create Next App"`, `metadata.description === "Generated by create next app"`
- Geist + Geist_Mono font setup
- `<html lang="en" className="${geistSans.variable} ${geistMono.variable} h-full antialiased">`
- `<body className="min-h-full flex flex-col">`
- No `"use client"` directive (layout remains a Server Component; `AmplifyProvider` is the client boundary)

**Commit:** `5f532ab`

### Task 3 — `app/login/page.tsx` (CREATE, client component)

Client component that:
- Imports `useEffect` from `react`, `useRouter` from `next/navigation` (App Router), `Authenticator` + `useAuthenticator` from `@aws-amplify/ui-react`
- Uses `useAuthenticator((context) => [context.authStatus])` selector form to limit re-renders to authStatus changes only (RESEARCH §6)
- `useEffect` with `[authStatus, router]` dep array (exhaustive — no eslint-disable bypass per L-15) calls `router.push("/app")` when `authStatus === "authenticated"`
- Renders bare `<Authenticator />` with NO props (Zero Configuration per L-6)
- Renders `<p className="text-sm opacity-70">Loading…</p>` during transient `"configuring"` cookie-rehydration state
- Hides the Authenticator after `authStatus === "authenticated"` to avoid flash of the form during the brief navigation window
- Centered layout: `flex min-h-screen items-center justify-center p-8`

**Commit:** `5353750`

### Task 4 — `app/app/page.tsx` (CREATE, server component) + `app/app/SignOutButton.tsx` (CREATE, client component)

`app/app/page.tsx` (Server Component — no `"use client"`):
- Default-exports `AppPlaceholder()` rendering centered `<main>` with `<h1>Welcome</h1>`, muted `<p>` mentioning "Phase 4 will add the auth guard so /app is only reachable when signed in", and `<SignOutButton />` child
- Sibling import: `import { SignOutButton } from "./SignOutButton"`
- /app intentionally UNGUARDED per CONTEXT D-17 — Phase 4 adds the redirect-if-no-session guard

`app/app/SignOutButton.tsx` (Client Component — `"use client";`):
- Named-exports `SignOutButton()`
- Imports `useRouter` from `next/navigation`, `signOut` from `aws-amplify/auth` (v6 subpath, NOT v5 Auth namespace)
- `async function handleClick()` declared at module level (not inline arrow) — RESEARCH §7 named-handler pattern
- `await signOut(); router.push("/");` — await BEFORE navigation per L-14 (cookie clear ordering)
- `<button type="button">` to prevent accidental form submission
- Outlined-button styling adapted from `app/not-found.tsx:8-12` (`rounded-md border border-foreground/20 px-4 py-2 text-sm hover:bg-foreground/5`)
- NOT `signOut({ global: true })` — single-tab sign-out only per D-27

**Commit:** `90aaed8`

### Task 5 — `app/page.tsx` (MODIFY, additive Sign in link)

Two additive changes to the existing 65-line home page, preserving everything else:
- ADDED `import Link from "next/link";` BEFORE the existing `import Image from "next/image";`
- ADDED `<Link href="/login" className="absolute top-4 right-4 rounded-md border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5">Sign in</Link>` as the FIRST child of the outer `<div>`

PRESERVED EXACTLY:
- `Home` function name
- `<Image>` element with all attributes
- `<h1>` copy + the two big `<a>` anchors (Templates, Learning, Deploy Now, Documentation)
- Outer `<div>` className (`bg-zinc-50` etc.)
- `<main>` className
- No `"use client"` (Link works in Server Components)

**Commit:** `08fce05`

---

## Acceptance criteria — all green

**Per-task automated greps:**

- File `app/AmplifyProvider.tsx` exists; line 1 `"use client";`; contains `Amplify.configure(outputs, { ssr: true })`, `from "aws-amplify"`, `from "@aws-amplify/ui-react"`, `from "@/amplify_outputs.json"`, `Authenticator.Provider`, `export function AmplifyProvider`. Does NOT contain `export default`. ✓
- File `app/layout.tsx` contains `import { AmplifyProvider } from "./AmplifyProvider"`, `@aws-amplify/ui-react/styles.css`, `<AmplifyProvider>{children}</AmplifyProvider>`. Preserves `title: "Create Next App"`, `description: "Generated by create next app"`, `min-h-full flex flex-col`, `h-full antialiased`. Does NOT contain `"use client"`. ✓
- File `app/login/page.tsx` exists; line 1 `"use client";`; contains `from "next/navigation"`, `<Authenticator`, `useAuthenticator((context) => [context.authStatus])`, `router.push("/app")`, `authStatus === "authenticated"`, `[authStatus, router]`. Does NOT contain `from "next/router"`, `signUpAttributes`, `eslint-disable`. Default-exports `LoginPage`. ✓
- File `app/app/page.tsx` exists; does NOT start with `"use client"`; contains `export default function AppPlaceholder`, `<SignOutButton />`, `import { SignOutButton } from "./SignOutButton"`. ✓
- File `app/app/SignOutButton.tsx` exists; line 1 `"use client";`; contains `from "aws-amplify/auth"`, `from "next/navigation"`, `await signOut()`, `router.push("/")`, `type="button"`, `export function SignOutButton`. Does NOT contain `from "next/router"`, `import { Auth } from "aws-amplify"`, `export default`, `signOut({ global`. ✓
- File `app/page.tsx` contains `import Link from "next/link"`, `href="/login"`, `Sign in`, `absolute top-4 right-4`, `export default function Home`, `<Image`, `bg-zinc-50`. Does NOT contain `"use client"`. ✓

**Anti-pattern checks (must NOT find — all clean):**

- `! grep -rq 'from "next/router"' app/` ✓
- `! grep -rq 'import { Auth } from "aws-amplify"' app/` ✓
- `! grep -rq 'eslint-disable' app/AmplifyProvider.tsx app/login/page.tsx app/app/` ✓

**Final repo gates (must all exit 0):**

- `bun run lint` exit 0 ✓
- `bun run typecheck` exit 0 ✓
- `bun run build` exit 0 — Next 16.2.4 Turbopack, **4 routes prerendered** as static content: `/`, `/_not-found`, `/app`, `/login` ✓
- `bun run audit` exit 0 (existing 24 ignores from Phase 1 cover Amplify v6 transitives) ✓

---

## Critical confirmations (per `<output>` requirements)

**Confirmation 1 — AmplifyProvider is at ROOT (not /login per superseded D-23):**
File path is `app/AmplifyProvider.tsx` (root). NOT `app/login/AmplifyProvider.tsx`. The provider import in `app/layout.tsx` is `import { AmplifyProvider } from "./AmplifyProvider"` (sibling at root). No `app/login/layout.tsx` was created. Reason: per RESEARCH §7 / L-2, `signOut()` in `app/app/SignOutButton.tsx` would throw "no auth config" if `Amplify.configure()` were scoped to `/login` only — every route's bundle now inherits the configured singleton.

**Confirmation 2 — `Amplify.configure` uses `{ ssr: true }` (per L-3, supersedes D-28 wording):**
Module-level statement in `app/AmplifyProvider.tsx`: `Amplify.configure(outputs, { ssr: true });`. Token storage is therefore COOKIES (not localStorage as CONTEXT D-28 originally documented). AUTH-05 (session survives refresh) is still met — cookies serve the same persistence role. The CONTEXT D-28 wording fix lands in Plan 02-05 Task 5 (not this plan's responsibility).

**Confirmation 3 — `<Authenticator />` is bare (Zero Configuration per L-6):**
Single occurrence in `app/login/page.tsx`: `{authStatus !== "authenticated" && <Authenticator />}`. NO `signUpAttributes`, `formFields`, `components`, `loginMechanisms`, or theme props. Fields are auto-inferred from `amplify_outputs.json#standard_required_attributes: ["email", "name"]` once Plan 02-04 redeploys the sandbox.

**Confirmation 4 — `useRouter` is from `next/navigation` everywhere (per L-7):**
Two `useRouter` imports in this plan, both from `next/navigation`:
- `app/login/page.tsx:4` → `import { useRouter } from "next/navigation";`
- `app/app/SignOutButton.tsx:3` → `import { useRouter } from "next/navigation";`
Anti-pattern grep `! grep -rq 'from "next/router"' app/` exits 0 (no occurrences anywhere in `app/`).

**Confirmation 5 — `await signOut()` precedes navigation (per L-14):**
`app/app/SignOutButton.tsx:9-12`:
```tsx
async function handleClick() {
  await signOut();
  router.push("/");
}
```
The `await` ensures the cookie clear completes before the navigation triggers a fresh `Amplify.configure` resolution on the home page mount.

**Confirmation 6 — All four repo gates exit 0:**

| Gate | Command | Exit code | Notes |
|---|---|---|---|
| lint | `bun run lint` (= `eslint . --max-warnings=0`) | 0 | No warnings |
| typecheck | `bun run typecheck` (= `tsc --noEmit`) | 0 | No errors |
| build | `bun run build` (= `next build`) | 0 | Next 16.2.4 Turbopack — 4 routes prerendered: `/`, `/_not-found`, `/app`, `/login` |
| audit | `bun run audit` (= `bun audit --audit-level=moderate --ignore=...`) | 0 | Existing 24 ignores cover Amplify v6 transitives |

**Confirmation 7 — `amplify_outputs.json` is currently empty (Plan 02-04 will populate it):**
Current contents: `{"version": "1.4"}`. Typecheck passes against this empty shape because `Amplify.configure` accepts any object (no compile-time auth schema). Runtime sign-in via `<Authenticator />` will only work AFTER Plan 02-04 redeploys the sandbox (which adds `outputs.auth.user_pool_id`, `outputs.auth.user_pool_client_id`, etc.). Build succeeds today because Amplify configuration errors are runtime-only.

---

## Deviations from PLAN

**None.** The plan executed exactly as written. All 5 tasks were autonomous (no checkpoints), no Rule 1/2/3 auto-fixes were needed, and the four repo gates passed on the first attempt after each task. The plan author's verbatim RESEARCH excerpts were copied verbatim (double-quote style preserved throughout).

---

## Files

**Created (4):**
- `app/AmplifyProvider.tsx`
- `app/login/page.tsx`
- `app/app/page.tsx`
- `app/app/SignOutButton.tsx`

**Modified (2):**
- `app/layout.tsx` (3 additive changes: AmplifyProvider import, CSS import, body wrap)
- `app/page.tsx` (2 additive changes: Link import, Sign in `<Link>` top-right)

**Commits (5, atomic per task):**

| Task | Commit | Message |
|---|---|---|
| 1 | `a06cd38` | `feat(02-03): create AmplifyProvider client wrapper for root mount` |
| 2 | `5f532ab` | `feat(02-03): mount AmplifyProvider in root layout + import Amplify CSS` |
| 3 | `5353750` | `feat(02-03): add /login route with Authenticator + post-auth redirect` |
| 4 | `90aaed8` | `feat(02-03): add /app placeholder page + SignOutButton client component` |
| 5 | `08fce05` | `feat(02-03): add 'Sign in' link to home page (top-right)` |

---

## Phase 2 progress

| Plan | Wave | Status |
|---|---|---|
| 02-01 | A — backend auth resource | done |
| 02-02 | B — frontend deps | done |
| 02-03 | C — frontend wiring | done |
| 02-04 | D — sandbox redeploy | next |
| 02-05 | E — manual D-29 flows | pending |

**3/5 plans complete (60%).** Source-code components of AUTH-03 + AUTH-05 closed by this plan. Live deploy still pending Plan 02-04 (which populates `amplify_outputs.json` with the auth block from the new sandbox push). Manual end-to-end flows (sign-up, confirm, sign-in, sign-out, refresh persistence) still pending Plan 02-05 — and that plan also performs the CONTEXT D-28 wording fix (localStorage → cookies).

---

## Notes for Plan 02-04 (sandbox redeploy)

- All 4 routes prerender as static content today; once `amplify_outputs.json` gains the `auth` block from `npx ampx sandbox`, the `<Authenticator />` will render with live Cognito User Pool credentials at runtime (no rebuild required — outputs.json is read at module-load by `Amplify.configure`)
- The `version: "1.4"` field will remain; the sandbox push adds an `auth: { user_pool_id, user_pool_client_id, identity_pool_id?, aws_region, ... }` block alongside it
- Build will continue to succeed because `Amplify.configure` validates runtime, not compile-time

## Notes for Plan 02-05 (manual flows + CONTEXT D-28 wording)

- D-28 wording fix: change "tokens stored in localStorage" → "tokens stored in HTTP cookies (per Amplify ssr:true)" — already implemented in code (Task 1), just needs the doc update
- Manual flows to walk: sign-up → email confirmation → sign-in → land at /app → refresh page (session persists via cookies) → sign-out → land back at /
- Forgot password flow is also rendered by Zero-Configuration `<Authenticator />` and should be smoke-tested

## Self-Check: PASSED

**Created files exist:**
- FOUND: app/AmplifyProvider.tsx
- FOUND: app/login/page.tsx
- FOUND: app/app/page.tsx
- FOUND: app/app/SignOutButton.tsx

**Modified files exist (and contain the additive changes):**
- FOUND: app/layout.tsx (contains `<AmplifyProvider>` wrap + `@aws-amplify/ui-react/styles.css`)
- FOUND: app/page.tsx (contains `import Link from "next/link"` + `href="/login"`)

**Commits exist (verified via git log):**
- FOUND: a06cd38 (Task 1)
- FOUND: 5f532ab (Task 2)
- FOUND: 5353750 (Task 3)
- FOUND: 90aaed8 (Task 4)
- FOUND: 08fce05 (Task 5)
