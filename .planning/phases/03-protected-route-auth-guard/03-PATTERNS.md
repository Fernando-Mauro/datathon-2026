# Phase 3: Protected Route & Auth Guard - Pattern Map

**Mapped:** 2026-04-25
**Files analyzed:** 5 (3 NEW, 1 MODIFY, 1 REPLACE)
**Analogs found:** 5 / 5 — all in-repo

## File Classification

| File | Status | Role | Data Flow | Closest Analog | Match Quality |
|------|--------|------|-----------|----------------|---------------|
| `app/_components/AuthGuard.tsx` | NEW | client guard component | event-driven (subscribes to authStatus) + request-response (router.replace) | `app/login/page.tsx` | exact (same hook, same effect-pattern, same loading idiom) |
| `app/_components/safeFromPath.ts` | NEW | pure utility | transform (string in → string\|null out) | none in repo (no `_lib/` precedent) | **NO ANALOG** — use RESEARCH §1 |
| `app/app/layout.tsx` | NEW | client layout | wrapper (children → guarded children) | `app/AmplifyProvider.tsx` | role-match (both client wrapper components that pass children through) |
| `app/login/page.tsx` | MODIFY | client page | event-driven (authStatus → redirect) | itself (extending Phase 2) | exact (own evolution) |
| `app/app/page.tsx` | REPLACE | client page | request-response (read user attrs, render) | current `app/app/page.tsx` (placeholder) + `app/app/SignOutButton.tsx` (sibling pattern) | role-match |

---

## Pattern Assignments

### `app/_components/AuthGuard.tsx` (NEW — client guard, event-driven)

**Analog:** `app/login/page.tsx` — same shape: `"use client"` client component, `useRouter` + `useAuthenticator` selector + `useEffect` watching `authStatus`, conditional render based on the three-state machine.

**Imports + directive pattern** (from `app/login/page.tsx:1-5`):
```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
```
**Apply to AuthGuard:** drop the `Authenticator` import, add `usePathname`. Final shape:
```tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";
```

**Hook + selector pattern** (from `app/login/page.tsx:8-9`):
```tsx
const router = useRouter();
const { authStatus } = useAuthenticator((context) => [context.authStatus]);
```
**Apply to AuthGuard:** copy verbatim, plus `const pathname = usePathname();`. The selector `(context) => [context.authStatus]` is the locked Phase 2 form — do NOT change to `(ctx) =>` for consistency (or change everywhere; planner picks but document the choice). RESEARCH §2 uses `(ctx) =>` — that's a minor lint choice.

**Effect-on-authStatus pattern** (from `app/login/page.tsx:11-15`):
```tsx
useEffect(() => {
  if (authStatus === "authenticated") {
    router.push("/app");
  }
}, [authStatus, router]);
```
**Apply to AuthGuard:** invert the predicate (unauthenticated triggers redirect), use `replace` not `push` (D-35), build `?from=` URL, add the `!pathname.startsWith("/login")` defensive check (RESEARCH L-2):
```tsx
useEffect(() => {
  if (authStatus === "unauthenticated" && !pathname.startsWith("/login")) {
    router.replace(`/login?from=${encodeURIComponent(pathname)}`);
  }
}, [authStatus, pathname, router]);
```

**Loading-state-render pattern** (from `app/login/page.tsx:18-21` + `app/loading.tsx:1-12`):

`app/login/page.tsx` only renders text:
```tsx
<main className="flex min-h-screen items-center justify-center p-8">
  {authStatus === "configuring" && (
    <p className="text-sm opacity-70">Loading…</p>
  )}
```

`app/loading.tsx` shows the project's centered-spinner idiom (uses `animate-pulse` + `role="status"` + `aria-label="Loading"` + `sr-only`):
```tsx
<div
  role="status"
  aria-label="Loading"
  className="flex min-h-screen items-center justify-center"
>
  <div className="h-10 w-10 animate-pulse rounded-full bg-foreground/10" />
  <span className="sr-only">Loading…</span>
</div>
```

**Apply to AuthGuard:** combine — the centered+role+aria-label outer shell from `app/loading.tsx`, with a visible-text spinner (RESEARCH §2 / G-4) using `animate-spin` + visible "Loading…" text (D-34 explicit "spinner + texto Loading… centrado"). Final shape from RESEARCH §2:
```tsx
if (authStatus === "configuring") {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-screen items-center justify-center"
    >
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
        <p className="text-sm opacity-70">Loading…</p>
      </div>
    </div>
  );
}
```

**Note:** `app/loading.tsx` uses `animate-pulse` + `bg-foreground/10`; AuthGuard's spinner uses `animate-spin` + `border-foreground/20 border-t-foreground`. Both are valid Tailwind v4 idioms in this repo. The AuthGuard variant is preferred per D-34 (active spinner > passive pulse for an interactive gate).

**Three-state switch + null fallback** (NEW pattern, no direct analog — RESEARCH K-2 establishes it):
```tsx
if (authStatus === "configuring") return <Spinner />;
if (authStatus === "authenticated") return <>{children}</>;
return null; // unauthenticated — effect already fired router.replace
```

**Component export style** (from `app/app/SignOutButton.tsx:6` — named export typed via inline destructured props):
```tsx
export function SignOutButton() { ... }
```
**Apply to AuthGuard:** named export `export function AuthGuard({ children }: { children: React.ReactNode })` — matches sibling. (Note: `app/login/page.tsx` uses `export default` because it's a route page; `<SignOutButton>` is a co-located component using named export. AuthGuard is a co-located component → named export.)

---

### `app/_components/safeFromPath.ts` (NEW — pure utility, transform)

**Analog:** None in this repo. Project has no `_lib/` or `utils/` precedent yet. Phase 3 establishes this convention by co-locating in `app/_components/`.

**Pattern source:** RESEARCH §1 verbatim. Pure TS module, no `"use client"` (no React, no hooks), named export, single function with prefix-string allowlist.

**Shape excerpt** (from RESEARCH §1):
```ts
export function safeFromPath(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  if (raw.length === 0 || raw.length > 512) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//")) return null;
  if (raw.startsWith("/\\")) return null;
  if (raw.startsWith("/login")) return null;
  if (raw.includes("\\") || raw.includes("\0")) return null;
  return raw;
}
```

**Quote convention check:** double quotes ✓ (matches Phase 1 PATTERNS established convention; `"/"`, `"//"` etc. all double-quoted).

---

### `app/app/layout.tsx` (NEW — client wrapper layout)

**Analog:** `app/AmplifyProvider.tsx` — same role: client component that wraps `children` in another component, no metadata, no logic.

**Source pattern** (`app/AmplifyProvider.tsx:1-22`, especially lines 1, 17-22):
```tsx
"use client"; // [reason comment]

// imports...

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  return <Authenticator.Provider>{children}</Authenticator.Provider>;
}
```

**Apply to `app/app/layout.tsx`:**
```tsx
"use client";

import { AuthGuard } from "@/app/_components/AuthGuard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
```

**Differences from AmplifyProvider:**
1. `export default` (not named) — required because Next App Router resolves `layout.tsx` by default export
2. No reason-comment after `"use client"` — keep brief (matches `app/login/page.tsx` and `app/error.tsx` which also use brief or commented forms; planner's call). Per D-30 + RESEARCH K-4 a short note "// client because <AuthGuard> uses client hooks; no metadata export here (K-4)" is justified.
3. NO `metadata` export (RESEARCH L-9 — `next build` errors on `"use client"` + `metadata`). Root `app/layout.tsx:17-20` already declares site metadata.

**Path alias usage:** `@/app/_components/AuthGuard` — verified working alias (`tsconfig.json` per RESEARCH G-2). Sibling-relative `../_components/AuthGuard` is also valid; pick one and stay consistent within the file.

---

### `app/login/page.tsx` (MODIFY — split for Suspense, add ?from=)

**Analog:** itself. This is an evolution, not a re-pattern. RESEARCH §5 has the full target shape.

**BEFORE excerpt** (current `app/login/page.tsx:7-25`):
```tsx
export default function LoginPage() {
  const router = useRouter();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      router.push("/app");
    }
  }, [authStatus, router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      {authStatus === "configuring" && (
        <p className="text-sm opacity-70">Loading…</p>
      )}
      {authStatus !== "authenticated" && <Authenticator />}
    </main>
  );
}
```

**SHAPE OF CHANGE (3 mechanical edits + 1 structural split):**

1. **Imports** (lines 1-5):
   - Add `Suspense` to react import: `import { Suspense, useEffect } from "react";`
   - Add `useSearchParams` to next/navigation import: `import { useRouter, useSearchParams } from "next/navigation";`
   - Add new local import: `import { safeFromPath } from "@/app/_components/safeFromPath";` (or sibling-relative; planner consistency)

2. **Rename current default export** to `LoginPageInner` (function fn, no `default` keyword) — this becomes the inner consumer. Keep all current logic in this fn.

3. **Inside `LoginPageInner`, the `useEffect` block (current lines 11-15)** changes from `push("/app")` to `replace(safeFromPath(searchParams.get("from")) ?? "/app")`. Add `searchParams` to deps (RESEARCH L-4 — exhaustive-deps lint will fail without it):
   ```tsx
   const searchParams = useSearchParams();
   // ...
   useEffect(() => {
     if (authStatus === "authenticated") {
       const from = safeFromPath(searchParams.get("from")) ?? "/app";
       router.replace(from);
     }
   }, [authStatus, router, searchParams]);
   ```

4. **NEW outer `LoginPage` default export** wraps `<LoginPageInner />` in `<Suspense fallback={...}>` (RESEARCH K-3 / L-1 — required for `bun run build` to succeed; dev silently passes without it). Fallback uses the same centered-Loading copy as the existing inline `configuring` render for visual continuity:
   ```tsx
   export default function LoginPage() {
     return (
       <Suspense
         fallback={
           <main className="flex min-h-screen items-center justify-center p-8">
             <p className="text-sm opacity-70">Loading…</p>
           </main>
         }
       >
         <LoginPageInner />
       </Suspense>
     );
   }
   ```

**Lines unchanged in inner fn:** the JSX return block (current lines 17-24) stays identical — same `<main>` with `min-h-screen items-center justify-center p-8`, same `configuring` p-tag, same `<Authenticator />` conditional.

---

### `app/app/page.tsx` (REPLACE — protected page with email + name)

**Analog (sibling):** `app/app/SignOutButton.tsx` (consumed as-is) and the current placeholder structure shows the layout idiom.

**BEFORE excerpt** (current `app/app/page.tsx:1-14` — placeholder, server component):
```tsx
import { SignOutButton } from "./SignOutButton";

export default function AppPlaceholder() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <p className="text-sm opacity-70">
        This is the placeholder app shell. Phase 4 will add the auth guard
        so that /app is only reachable when signed in.
      </p>
      <SignOutButton />
    </main>
  );
}
```

**SHAPE OF CHANGE (full replacement, but the visual frame is reused):**

1. **Add `"use client"`** at the top (was server, now client because of `useAuthenticator` + `useEffect` + `useState`).

2. **Reuse the `<main>` frame**: `flex min-h-screen flex-col items-center justify-center gap-4 p-8` — already established here AND on `app/error.tsx:23` (`flex min-h-screen flex-col items-center justify-center gap-4 p-8`) AND on `app/not-found.tsx:5`. This is the project's "centered vertical content" idiom; do NOT change.

3. **Reuse the `<h1 className="text-2xl font-semibold">`** typography — same as `app/error.tsx:24`, `app/not-found.tsx:6`. Establishes consistency.

4. **Reuse the `<p className="text-sm opacity-70">...</p>`** for secondary text — same as `app/login/page.tsx:20`, `app/not-found.tsx:7`. This is THE pattern for muted-secondary text in the repo.

5. **Reuse `<SignOutButton />` import + render** verbatim — `import { SignOutButton } from "./SignOutButton";` stays, `<SignOutButton />` placement stays last child (after secondary content). Sibling-relative import (NOT `@/app/...`) — matches the existing line.

6. **New logic** (full body from RESEARCH §4): `useAuthenticator(({ user }) => [user])` for sync `email` from `user?.signInDetails?.loginId`; one-shot `useEffect` with cancellation flag for async `fetchUserAttributes()` → `setName(attrs.name)`; try/catch with `process.env.NODE_ENV !== "production"` console.warn (RESEARCH L-6).

7. **Function rename:** `AppPlaceholder` → `AppPage` (or any sensible name). Default export retained.

**Final imports** (RESEARCH §4):
```tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchUserAttributes } from "aws-amplify/auth";
import { SignOutButton } from "./SignOutButton";
```

**Render shape** (from RESEARCH §4, copy structure):
```tsx
return (
  <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
    <h1 className="text-2xl font-semibold">
      {name ? `Welcome, ${name}` : "Welcome"}
    </h1>
    {email && (
      <p className="text-sm opacity-70">Signed in as {email}</p>
    )}
    <SignOutButton />
  </main>
);
```

---

## Shared Patterns

### `"use client"` directive style
**Source:** `app/AmplifyProvider.tsx:1`, `app/login/page.tsx:1`, `app/app/SignOutButton.tsx:1`, `app/error.tsx:1`
**Apply to:** all three NEW client files (`AuthGuard.tsx`, `app/app/layout.tsx`, replaced `app/app/page.tsx`) AND the modified `app/login/page.tsx` (already has it).

Two acceptable forms in this repo:
- Bare: `"use client";` (most files)
- With trailing-comment rationale: `"use client"; // <reason>` (`AmplifyProvider.tsx`, `error.tsx`)

Planner picks per file. Recommendation: bare for `AuthGuard.tsx` and replaced `app/app/page.tsx`; commented for `app/app/layout.tsx` (because the constraint "client → no metadata export" is non-obvious — see RESEARCH L-9 / K-4).

### Quote style
**Source:** every existing file in `app/`
**Apply to:** all files in Phase 3
- Double quotes for ALL strings: `"use client"`, `"@/app/_components/AuthGuard"`, `"/login"`, `"/app"`, etc.
- ESLint flat-config will error on single quotes (Phase 1 + RESEARCH G-3).

### Path alias `@/*`
**Source:** `app/AmplifyProvider.tsx:5` (`import outputs from "@/amplify_outputs.json"`), `tsconfig.json` config
**Apply to:** cross-directory imports
- Sibling imports use relative: `import { SignOutButton } from "./SignOutButton";` (existing precedent in `app/app/page.tsx:1`)
- Cross-directory imports use alias: `import { AuthGuard } from "@/app/_components/AuthGuard";`
- Planner is free to use sibling-relative (`../_components/AuthGuard`) but should stay consistent within a file.

### Centered-content layout idiom
**Source:** `app/error.tsx:23`, `app/not-found.tsx:5`, `app/login/page.tsx:18`, `app/app/page.tsx:5` (current placeholder), `app/loading.tsx:6-7`

Three documented variants (DO NOT invent a fourth):
1. **Vertical centered, single-axis (login + AuthGuard spinner outer):** `flex min-h-screen items-center justify-center p-8`
2. **Vertical+horizontal centered, gap-spaced column (page content):** `flex min-h-screen flex-col items-center justify-center gap-4 p-8`
3. **Pure spinner shell (no padding, no flex-col):** `flex min-h-screen items-center justify-center` — used in `app/loading.tsx`

**Apply to:**
- AuthGuard configuring spinner outer → variant 3
- `app/app/layout.tsx` → no layout div needed (just renders `<AuthGuard>`); the page below picks the variant
- Replaced `app/app/page.tsx` → variant 2 (matches existing placeholder)
- `LoginPageInner` (after split) → variant 1 (unchanged)
- `LoginPage` Suspense fallback → variant 1 (matches what it temporarily replaces)

### Typography idioms
**Source:** `app/error.tsx:24`, `app/not-found.tsx:6`, current `app/app/page.tsx:6`, `app/login/page.tsx:20`

| Class | Used for |
|-------|----------|
| `text-2xl font-semibold` | h1 / primary heading |
| `text-sm opacity-70` | secondary / muted text (the "configuring" loader, the "Signed in as …" note) |

**Apply to:** AuthGuard "Loading…" text, replaced page "Welcome" h1 + "Signed in as" p, login Suspense fallback. Do not add new sizes.

### Button styles
**Source:** `app/app/SignOutButton.tsx:18`, `app/error.tsx:26-27`, `app/not-found.tsx:9-10`

Two existing button styles in repo:
- **Outline:** `rounded-md border border-foreground/20 px-4 py-2 text-sm hover:bg-foreground/5` (sign-out, return-home, header sign-in)
- **Filled:** `rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90` (try-again)

**Apply to:** Phase 3 adds NO new buttons (SignOutButton reused). If a planner adds one, use outline for low-emphasis, filled for primary.

### `useAuthenticator` selector argument style
**Source:** `app/login/page.tsx:9`

Existing form: `useAuthenticator((context) => [context.authStatus])` — full word `context`.

RESEARCH §2/§4/§5 use `(ctx) =>` and `({ user }) =>`. Both compile. Either:
- **Stay consistent with Phase 2:** use `(context) => [context.authStatus]` everywhere
- **Adopt RESEARCH style:** use `(ctx) =>` for short, destructured `({ user }) =>` for the user picker

Planner picks one and applies uniformly. No lint impact either way.

---

## Anti-Patterns (Do NOT Replicate)

| Pattern | Source | Why NOT to copy |
|---------|--------|-----------------|
| `Amplify.configure(outputs)` at module-load | `app/AmplifyProvider.tsx:15` | Phase 3 must NOT call `Amplify.configure` again. The root provider already runs it (D-41 / RESEARCH L-10). Phase 3 only CONSUMES the existing provider. |
| `<Authenticator.Provider>` wrap | `app/AmplifyProvider.tsx:21` | Mounted exactly ONCE at root. Phase 3 must NOT add a second one in `app/app/layout.tsx` (RESEARCH L-10 — would create a second state machine; `useAuthenticator` calls would non-deterministically read from the closer provider). Plan-checker grep: exactly one `Authenticator.Provider` in repo. |
| `router.push("/app")` after authenticated | `app/login/page.tsx:13` | Phase 3 D-35/D-37 supersedes this with `router.replace(...)`. The push is what gets walked back. |
| `from = useSearchParams().get("from")` directly fed to `router.replace` | RESEARCH L-7 hypothetical | Always go through `safeFromPath(...)` first. Plan-checker grep on `app/login/page.tsx`: every `router.replace(` argument must be a literal OR routed through `safeFromPath`. |
| Server `app/page.tsx` pattern (no `"use client"`) | `app/page.tsx`, current `app/app/page.tsx` | Phase 3 page is client-side. Do NOT use server-component pattern as analog for the replaced page. |
| `metadata` export on a `"use client"` file | (none in repo, but tempting) | Forbidden by Next 16 (RESEARCH L-9). Especially relevant for `app/app/layout.tsx`. |
| `next/router` import | (none in repo — Phase 2 L-7 confirmed) | Pages-Router-only. App Router uses `next/navigation`. Plan-checker grep: zero `from "next/router"` occurrences. |

---

## No Analog Found

| File | Reason | Use instead |
|------|--------|-------------|
| `app/_components/safeFromPath.ts` | First pure-utility module in the project; no `_lib/`, no `utils/`, no `helpers/` precedent | RESEARCH §1 (verbatim) |
| `app/_components/` directory | First underscore-prefixed co-located client-component directory; convention being established this phase | Phase 3 sets the precedent — future Phase 4+ shared client components follow it |

---

## Metadata

**Analog search scope:** `app/**/*.{ts,tsx}` (whole app dir)
**Files scanned:** 9 (all existing files in `app/`)
**Pattern extraction date:** 2026-04-25
**Files NOT modified by Phase 3 (do NOT touch):** `app/AmplifyProvider.tsx`, `app/layout.tsx`, `app/app/SignOutButton.tsx`, `app/error.tsx`, `app/loading.tsx`, `app/not-found.tsx`, `app/page.tsx`, `app/globals.css`

## PATTERN MAPPING COMPLETE

**Phase:** 3 — Protected Route & Auth Guard
**Files classified:** 5
**Analogs found:** 4 / 5 (one no-analog: `safeFromPath.ts` — first utility in project)

### Coverage
- Files with exact analog: 2 (`AuthGuard.tsx` ← `app/login/page.tsx`; `app/login/page.tsx` ← itself)
- Files with role-match analog: 2 (`app/app/layout.tsx` ← `AmplifyProvider.tsx`; replaced `app/app/page.tsx` ← current placeholder + sibling SignOutButton)
- Files with no analog: 1 (`safeFromPath.ts` — uses RESEARCH §1)

### Key Patterns Identified
- **Three centered-content variants** locked: spinner-shell (loading.tsx), single-axis (login), gap-spaced column (page content). All Phase 3 components map to one of the three.
- **Two typography classes** are the entire vocabulary: `text-2xl font-semibold` (h1), `text-sm opacity-70` (muted/secondary). Do not add a third.
- **`useAuthenticator` selector + `useEffect` watching `authStatus`** is the canonical guard primitive — `app/login/page.tsx` is the in-repo template; `<AuthGuard>` is its inversion.
- **Single source of truth for Amplify config:** `app/AmplifyProvider.tsx`. New Phase 3 files NEVER call `Amplify.configure` and NEVER mount a second `<Authenticator.Provider>`.
- **Suspense around `useSearchParams`** is mandatory and not negotiable in `app/login/page.tsx` (build-time gate).

### File Created
`/home/fernando/Documents/datathon-2026/.planning/phases/03-protected-route-auth-guard/03-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can reference the four in-repo analogs (`app/login/page.tsx`, `app/AmplifyProvider.tsx`, `app/app/SignOutButton.tsx`, `app/loading.tsx`) plus RESEARCH §1 for the no-analog file when producing PLAN.md.
