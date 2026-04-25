# Phase 1: Foundation & Amplify Backend Skeleton - Pattern Map

**Mapped:** 2026-04-25
**Files analyzed:** 11 (7 create + 4 modify)
**Analogs found:** 11 / 11 (each file has at least a scaffold-precedent analog; some are minimal because Phase 1 is greenfield-with-scaffolding)

## File Classification

| New/Modified File | Action | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|--------|------|-----------|----------------|---------------|
| `amplify/backend.ts` | CREATE | backend-config (CDK entry) | request-response (build-time synthesis) | RESEARCH §Code Examples + scaffold has no precedent | scaffolder-template |
| `amplify/package.json` | CREATE | config (manifest) | n/a | `/package.json` (root) | role-match (ESM declaration only) |
| `amplify/tsconfig.json` | CREATE | config (TS compiler) | n/a | `/tsconfig.json` (root) | role-match (different target, ESM module) |
| `app/error.tsx` | CREATE | component (route boundary, client) | event-driven (React error boundary) | `app/page.tsx` + `app/layout.tsx` | scaffold-precedent |
| `app/loading.tsx` | CREATE | component (route boundary, server) | request-response (Suspense fallback) | `app/page.tsx` | scaffold-precedent |
| `app/not-found.tsx` | CREATE | component (route boundary, server) | request-response (404) | `app/page.tsx` | scaffold-precedent |
| `.env.example` | CREATE | config (env template) | n/a | none in repo — RESEARCH §5 verbatim | research-only |
| `package.json` | MODIFY | config (manifest) | n/a | self (existing scripts block, deps block) | self-extend |
| `tsconfig.json` | MODIFY | config (TS compiler) | n/a | self (existing `exclude` array) | self-extend |
| `.gitignore` | MODIFY | config (VCS rules) | n/a | self (existing `.env*` line) | self-extend |
| `README.md` | MODIFY | docs | n/a | self (existing heading hierarchy) | self-extend |

## Pattern Assignments

### `amplify/backend.ts` (backend-config, build-time CDK synthesis)

**Analog:** No existing repo file (greenfield). Use the verbatim canonical pattern from RESEARCH §Code Examples → "Minimal `defineBackend({})`" (cross-checked against Amplify docs and `create-amplify` source).

**Existing-style cue to mirror:** the project uses `import type` for type-only imports (see `app/layout.tsx:2`) and JSDoc-style `@see` links are absent in scaffold. The RESEARCH excerpt below already follows project quote/semicolon conventions (single quotes are NOT the scaffold style — see fix below).

**Style note for planner:** The scaffold uses **double quotes** (see `app/layout.tsx:1-3`, `next.config.ts:1`). RESEARCH §3.b shows the example with single quotes. **Mirror the scaffold (double quotes)** to satisfy ESLint defaults and pass `--max-warnings=0`.

**Core pattern** (RESEARCH §3.b, normalized to scaffold quote style):
```typescript
import { defineBackend } from "@aws-amplify/backend";

/**
 * Phase 1: Bare backend skeleton — no resources yet.
 * Phase 2 will add auth (Cognito + email/password).
 * @see https://docs.amplify.aws/nextjs/build-a-backend/
 */
defineBackend({});
```

**Gotchas applying to this file:**
- G-4: Do NOT add `auth/` or `data/` imports — empty object is the contract (D-05/D-06).
- G-5: This file MUST be loaded as ESM — guaranteed by sibling `amplify/package.json`.
- G-13: An empty `defineBackend({})` deploys an empty stack — that IS success.

---

### `amplify/package.json` (config manifest, ESM declaration)

**Analog:** `/package.json` (root) — establishes JSON-with-2-space-indent convention.

**Root `package.json` lines 1-15 (existing pattern to mirror — formatting only):**
```json
{
  "name": "datathon-2026",
  "version": "0.1.0",
  "private": true,
  ...
}
```

**Core pattern** (RESEARCH §3.b — minimal contents required by Amplify):
```json
{
  "type": "module"
}
```

**Why minimal:** RESEARCH G-5 + Amplify source (`create-amplify` writes literally `{ "type": "module" }`) — no `name`, `version`, or `dependencies` needed. Backend deps live in the root `package.json`.

**Gotchas applying:**
- G-5: Without this file (or with a different `type` value), `tsx` fails to load `backend.ts` as ESM and `npx ampx sandbox` errors out at module resolution.

---

### `amplify/tsconfig.json` (config, TS compiler for backend)

**Analog:** `/tsconfig.json` (root) — shows project conventions (2-space indent, `compilerOptions` first, `paths` alias pattern, JSON with no trailing commas).

**Root `tsconfig.json:1-24` (existing pattern to mirror — formatting + structure):**
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    ...
    "paths": {
      "@/*": ["./*"]
    }
  },
  ...
}
```

**Core pattern** (RESEARCH §3.b verbatim — required by Amplify, MUST NOT be customized):
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "paths": {
      "$amplify/*": ["../.amplify/generated/*"]
    }
  }
}
```

**Differences from root `tsconfig.json` (intentional, per Amplify):**
- `target: "es2022"` (root: `ES2017`) — backend runs on Node 20+
- `module: "es2022"` (root: `esnext`) — explicit ES2022 modules
- `paths`: `$amplify/*` not `@/*` — backend path alias for generated typedefs

**Gotchas applying:**
- G-6: Root `tsconfig.json` MUST exclude `amplify/**/*` (separate file modification) so Next does not try to compile this directory with the root config.

---

### `app/error.tsx` (component, client error boundary, event-driven)

**Analog:** `app/page.tsx` (closest existing component) + `app/layout.tsx` (TS prop typing patterns).

**Imports pattern from `app/layout.tsx:1-3` (mirror this style — double quotes, named imports):**
```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
```

**Component declaration pattern from `app/layout.tsx:20-24` (mirror — default export, named function, Readonly props):**
```typescript
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
```

**Tailwind class style from `app/page.tsx:5` (mirror — utility-first, dark: variants, double quotes):**
```tsx
<div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
```

**Core pattern** (RESEARCH §4.a — Next 16.2+ canonical, normalized to scaffold double-quotes):
```tsx
"use client"; // Error boundaries MUST be Client Components

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service in future phases (Sentry, etc.)
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <button
        onClick={() => unstable_retry()}
        className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
```

**Gotchas applying:**
- G-2: **CRITICAL** — use `unstable_retry`, NOT `reset` (Next 16.2 breaking change vs training data).
- AGENTS.md: this is a Next 16 breaking change — verified against `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`.
- Style: `"use client"` directive uses **double quotes** (matches existing scaffold convention) and trailing semicolon.
- The `unstable_` prefix signals API-stability reservation, not flakiness — add a 1-line comment explaining so reviewers/planners don't second-guess it.

---

### `app/loading.tsx` (component, server, Suspense fallback)

**Analog:** `app/page.tsx` (closest server component in repo).

**Server-component-by-default pattern from `app/page.tsx:3` (mirror — no `"use client"` directive, default export):**
```tsx
export default function Home() {
  return (
    <div className="...">
```

**Core pattern** (RESEARCH §4.b verbatim, normalized to scaffold double-quotes):
```tsx
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-screen items-center justify-center"
    >
      <div className="h-10 w-10 animate-pulse rounded-full bg-foreground/10" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
```

**Gotchas applying:**
- Loading components take **no props** — verified against `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md`.
- Uses `bg-foreground/10` — matches the CSS custom-property pattern in `app/globals.css:8-13` (`--color-foreground: var(--foreground)`), so the class resolves correctly.

---

### `app/not-found.tsx` (component, server, 404)

**Analog:** `app/page.tsx` (server component) + `app/page.tsx:21-25` for the `<a>` styling vocabulary.

**Existing `<a>` styling from `app/page.tsx:53-58` (mirror tailwind pattern; planner should use `next/link` instead of `<a>`):**
```tsx
<a
  className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors ..."
  href="..."
>
```

**Core pattern** (RESEARCH §4.c verbatim, normalized to scaffold double-quotes):
```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-2xl font-semibold">404 — Not Found</h2>
      <p className="text-sm opacity-70">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="rounded-md border border-foreground/20 px-4 py-2 text-sm hover:bg-foreground/5"
      >
        Return home
      </Link>
    </div>
  );
}
```

**Gotchas applying:**
- Uses `next/link` (NOT `<a>`) — required by `eslint-config-next/core-web-vitals` (`@next/next/no-html-link-for-pages`). Without `Link`, `--max-warnings=0` would fail.
- Server component — no `"use client"`. Verified against `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md`.
- Takes no props.

---

### `.env.example` (config, env template, didactic)

**Analog:** None in repo (no `.env*` files exist). Use RESEARCH §5 verbatim.

**Core pattern** (RESEARCH §5 verbatim — bash-style comments, didactic per CONTEXT specifics):
```bash
# AWS profile to use for `npx ampx sandbox` and any AWS CLI calls.
# This is the name you used when running `aws configure --profile <name>` (or `aws configure sso`).
# Copy this file to .env.local and set AWS_PROFILE to your local profile name.
AWS_PROFILE=datathon-2026

# AWS region to deploy the Amplify sandbox into.
# us-east-1 recommended: most services available, low latency from US/LATAM.
# Region resolution precedence (highest wins):
#   1. AWS_REGION env var (this value)
#   2. Region recorded in ~/.aws/config for the AWS_PROFILE above
#   3. AWS CLI default
AWS_REGION=us-east-1

# ----------------------------------------------------------------------
# IMPORTANT: AWS access keys (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
# DO NOT belong in this file or in .env.local. The standard AWS pattern
# is to keep them in ~/.aws/credentials, managed by `aws configure`.
# Putting them in .env files leaks them into shells, process listings,
# and accidental git commits. Don't.
#
# Phase 2/3 will introduce OAuth secrets (e.g., Google client ID/secret).
# Those go through `npx ampx sandbox secret set <NAME>` (sandbox) or the
# Amplify Console secrets store (production), NEVER into .env.
# ----------------------------------------------------------------------
```

**Gotchas applying:**
- G-7: `.env*` glob in `.gitignore` swallows `.env.example`. **Companion change to `.gitignore` (`!.env.example`) is mandatory** or this file never reaches git.
- D-12/D-13/D-14: comments must be explicit about credentials NOT going here — RESEARCH excerpt already covers this.

---

### `package.json` (MODIFY — config manifest, scripts + devDeps)

**Analog:** self. Existing structure to extend in place.

**Existing `scripts` block (lines 5-10) — pattern to extend:**
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

**Existing `devDependencies` block (lines 16-25) — pattern to extend (alphabetical, exact-or-caret per existing entries):**
```json
"devDependencies": {
  "@tailwindcss/postcss": "^4",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "eslint": "^9",
  "eslint-config-next": "16.2.4",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```

**Core pattern — final `scripts` block** (RESEARCH §6, including discretionary `clean` per CONTEXT):
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint . --max-warnings=0",
  "typecheck": "tsc --noEmit",
  "audit": "bun audit",
  "clean": "rm -rf .next .amplify amplify_outputs.json"
}
```

**Core pattern — devDependencies additions** (RESEARCH §3.a, alphabetical insertion to match existing order):
```json
"@aws-amplify/backend": "^1.22.0",
"@aws-amplify/backend-cli": "^1.8.2",
"aws-cdk-lib": "2.244.0",
"constructs": "^10.0.0",
"esbuild": "latest",
"tsx": "latest"
```

**Note on `postcss`:** RESEARCH §1 prefers `bun update postcss` (lockfile-only fix, NO direct devDep added). Only fall back to `bun add -D postcss@latest` if the update doesn't lift the version (G-14). Default plan: do NOT add `postcss` to `devDependencies`.

**Gotchas applying:**
- G-1: `lint` script MUST be `eslint . --max-warnings=0` (NOT `next lint`, which was removed in Next.js 16).
- G-11: `bun update postcss` (patch-level fix, no major bumps).
- G-14: Run `bun install` after `bun update` defensively.
- Existing `ignoreScripts` and `trustedDependencies` blocks (lines 26-33) — preserve as-is.

---

### `tsconfig.json` (MODIFY — config, TS compiler)

**Analog:** self. Existing `exclude` array on line 33.

**Existing pattern (line 33):**
```json
"exclude": ["node_modules"]
```

**Core pattern** (RESEARCH §3.b — append `amplify/**/*` to existing array):
```json
"exclude": ["node_modules", "amplify/**/*"]
```

**Gotchas applying:**
- G-6: Without this exclude, Next's TS compilation tries to include backend code → fails on `aws-cdk-lib` and `$amplify/*` imports.
- Preserve the existing 2-space indent and exact key ordering — only the `exclude` array changes.

---

### `.gitignore` (MODIFY — config, VCS rules)

**Analog:** self. Existing `.env*` line on line 34.

**Existing pattern to extend (lines 33-34, env section):**
```
# env files (can opt-in for committing if needed)
.env*
```

**Core pattern — additions** (RESEARCH §7, append to file):
```gitignore
# amplify (per https://docs.amplify.aws — also matches the patterns
# `npm create amplify@latest` would have written automatically)
.amplify
amplify_outputs*
amplifyconfiguration*
amplify/node_modules

# env (allow .env.example as the documented template)
!.env.example
```

**Gotchas applying:**
- G-7: `!.env.example` MUST be present or `.env*` swallows the example file.
- G-8: `amplify_outputs*` (no path prefix) — covers the file at the project root, where it actually lands.
- D-07/D-08: matches AWS Amplify's official `gitignore_initializer.ts` patterns.

---

### `README.md` (MODIFY — docs)

**Analog:** self. Existing heading hierarchy uses `##` for top-level sections (lines 3, 23, 32).

**Existing heading style (lines 3, 23, 32 — mirror this `##` level):**
```
## Getting Started
...
## Learn More
...
## Deploy on Vercel
```

**Core pattern** — Insert a new `## Setup` section **before** `## Getting Started` (line 3). Use RESEARCH §8 verbatim for the content (Prerequisites + 6 numbered steps + region rationale paragraph).

**Structural placement (final order):**
1. `# Title / intro paragraph` (lines 1-2 — preserve)
2. **NEW** `## Setup` (with `### Prerequisites`, `### 1. Create / pick an AWS IAM user`, etc., through `### 6. Deploy the sandbox`)
3. `## Getting Started` (preserve, lines 3-21)
4. `## Learn More` (preserve, lines 23-30)
5. `## Deploy on Vercel` (preserve, lines 32-36)

**Gotchas applying:**
- G-9: README MUST set the "first run takes 5-8 min" expectation (CDK bootstrap) — RESEARCH §8 step 6 already includes this.
- G-12: README MUST explain region precedence — covered in §8 trailing paragraph.
- G-10: Use `npx ampx`, NOT `bunx ampx`, in all command examples — RESEARCH §8 already follows this.
- A5: Document both access-key and SSO flows; do NOT enforce one — RESEARCH §8 step 2 includes the SSO branch.

---

## Shared Patterns

### Quote Style (project-wide)

**Source:** `app/layout.tsx:1-3`, `app/page.tsx`, `next.config.ts:1`, `postcss.config.mjs:3`
**Apply to:** All `.ts`, `.tsx`, `.mjs` files in this phase
**Pattern:**
```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
```
**Rule:** Always use **double quotes** for strings and import specifiers. Single quotes in RESEARCH excerpts must be normalized to double quotes before writing files (otherwise `--max-warnings=0` may flag them depending on `eslint-config-next` defaults).

### Indentation (project-wide)

**Source:** All existing files (verified `tsconfig.json`, `package.json`, `app/layout.tsx`, `eslint.config.mjs`)
**Apply to:** All new files
**Pattern:** **2-space indent** (no tabs). JSON, TS, TSX, MJS — all consistent.

### Path Alias

**Source:** `tsconfig.json:21-23` (root) and `amplify/tsconfig.json` (new, this phase)
**Apply to:** Future imports — not exercised in Phase 1 since no internal imports are introduced
**Pattern:**
- Root: `@/*` → `./*` (existing)
- Backend: `$amplify/*` → `../.amplify/generated/*` (new, in `amplify/tsconfig.json`)

**Phase 1 use:** none. The new `app/*.tsx` boundaries import only from `next/*` and `react`. The new `amplify/backend.ts` imports only from `@aws-amplify/backend`. No `@/*` or `$amplify/*` usage in this phase.

### TypeScript Strict Mode

**Source:** `tsconfig.json:7` (`"strict": true`) — already enabled project-wide
**Apply to:** All new `.ts`/`.tsx` files (boundaries + `amplify/backend.ts`)
**Pattern:** All function parameters and return types either explicitly annotated or unambiguously inferable. The new `amplify/tsconfig.json` ALSO has `"strict": true` so backend code follows the same rule.

### File Header / Comment Convention

**Source:** Existing scaffold files have **no file headers, no JSDoc** (verified across all `app/*.tsx`, config files).
**Apply to:** All new files
**Pattern:** **Do not add file headers or banner comments.** Inline comments only where the code is non-obvious (e.g., the `"use client"` rationale in `error.tsx`, or the `unstable_` prefix explanation). RESEARCH §3.b's JSDoc on `defineBackend({})` is the **only** sanctioned multiline-comment block in this phase, because it documents intentional emptiness for future phases — keep it.

### React Component Patterns

**Source:** `app/layout.tsx:20-33`, `app/page.tsx:3-65`
**Apply to:** `app/error.tsx`, `app/loading.tsx`, `app/not-found.tsx`
**Patterns:**
- `export default function ComponentName(...)` (default export, named function, PascalCase name)
- Props typed inline using `Readonly<{ ... }>` for immutability (when present); `error.tsx` uses an explicit object type without `Readonly` because the React error-boundary signature is mandated by Next
- Server-component-by-default; opt into client with `"use client";` directive on **line 1** (no comment above it)
- JSX uses **double-quoted** className strings; multi-class strings are space-separated (no `clsx` library — none in deps)

### Tailwind v4 Class Vocabulary

**Source:** `app/page.tsx`, `app/layout.tsx`, `app/globals.css`
**Apply to:** All new `.tsx` boundaries
**Vocabulary observed in scaffold:**
- Layout: `flex`, `flex-col`, `items-center`, `justify-center`, `min-h-screen`, `min-h-full`, `flex-1`, `gap-4`, `p-8`
- Color tokens: `bg-foreground`, `text-background`, `bg-foreground/10`, `border-foreground/20` (custom properties from `globals.css:8-13`)
- Dark mode: `dark:` prefix (e.g., `dark:bg-black`)
- Borders + radii: `rounded-md`, `rounded-full`, `border`, `border-solid`
- Typography: `text-2xl`, `text-sm`, `font-semibold`, `font-medium`

**Do NOT introduce new design tokens** — boundaries should look provisional (per CONTEXT D-04 "UI básica, no se invierte en pulido visual").

### JSON Formatting

**Source:** `tsconfig.json`, `package.json`
**Apply to:** `amplify/package.json`, `amplify/tsconfig.json`, modifications to root `tsconfig.json` and `package.json`
**Patterns:**
- 2-space indent
- Trailing newline at EOF
- No trailing commas
- Keys grouped logically (e.g., `compilerOptions` block, then `include`, then `exclude`)
- Arrays of strings on a single line when short (e.g., `["dom", "dom.iterable", "esnext"]`); multi-line when individual entries warrant clarity

---

## No Analog Found

Files where the repo has no existing source-code precedent (planner relies on RESEARCH excerpts; cited canonical sources documented):

| File | Role | Reason | Source of truth |
|------|------|--------|-----------------|
| `amplify/backend.ts` | backend-config | First Amplify file in repo | RESEARCH §Code Examples + Amplify docs/source |
| `amplify/package.json` | config | First subdirectory `package.json` | RESEARCH §3.b verbatim (Amplify scaffolder source) |
| `amplify/tsconfig.json` | config | First sub-tsconfig | RESEARCH §3.b verbatim (Amplify scaffolder source) |
| `.env.example` | config | No env files exist | RESEARCH §5 verbatim |

For all four, **RESEARCH.md is the canonical excerpt source** (each was cross-checked against external authorities — Amplify docs/source, Next.js local docs, and live `npm view` queries — see RESEARCH §Sources).

---

## Risk Watch — Known Pitfalls in This Phase's File Set

| ID | Risk | Affected file(s) | Mitigation |
|----|------|------------------|------------|
| G-1 | Using `next lint` instead of `eslint .` | `package.json` `scripts.lint` | Use `eslint . --max-warnings=0` exactly per RESEARCH §6 |
| G-2 | Using `reset` instead of `unstable_retry` | `app/error.tsx` | Use `unstable_retry` per RESEARCH §4.a (Next 16.2 breaking change) |
| G-5 | Missing `{"type":"module"}` in `amplify/package.json` | `amplify/package.json` | Mandatory file with exactly this content |
| G-6 | Forgetting to add `amplify/**/*` to root `tsconfig.json` exclude | `tsconfig.json` | Companion modification — both must ship together |
| G-7 | `.env.example` ignored by `.env*` glob | `.gitignore` | Companion `!.env.example` line — both must ship together |
| G-8 | Looking for `amplify_outputs.json` under `amplify/` (it's at project root) | `.gitignore` | Pattern `amplify_outputs*` (no path prefix) covers the actual location |
| Quote-style | Using single quotes (RESEARCH style) instead of double quotes (project style) | All new `.ts`/`.tsx` | Normalize all RESEARCH excerpts to double quotes before writing |
| Lint smoke | Existing `app/page.tsx` still has Vercel template content | `package.json` `lint` change | Run `bun run lint` once before locking `--max-warnings=0` to catch any pre-existing warnings (RESEARCH §2 known-risk paragraph) |

---

## Metadata

**Analog search scope:**
- `/home/fernando/Documents/datathon-2026/app/` (3 files: `layout.tsx`, `page.tsx`, `globals.css`)
- `/home/fernando/Documents/datathon-2026/` (root configs: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, `README.md`)
- `.planning/codebase/STRUCTURE.md` (codebase map — confirmed no `components/`, `lib/`, `api/`, `middleware.ts`, `amplify/`, or `.env*` exist)

**Files scanned:** 10 source/config files + 4 planning docs (CONTEXT, RESEARCH, STRUCTURE, CONVENTIONS).

**Project-skill cost:** zero (`.claude/` and `.agents/` directories contain no `skills/` subdirectory in this repo).

**Pattern extraction date:** 2026-04-25
