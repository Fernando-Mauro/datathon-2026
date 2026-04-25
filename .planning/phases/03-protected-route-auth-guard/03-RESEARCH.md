# Phase 3: Protected Route & Auth Guard — Research

**Researched:** 2026-04-25
**Domain:** Client-side auth gating for Next.js 16 App Router on top of Amplify Gen 2 + Cognito + `<Authenticator>`
**Confidence:** HIGH (all load-bearing claims verified against installed `node_modules` source / official local docs)

## Summary

Phase 3 turns `/app` from an unguarded placeholder into a protected route by mounting a single client component `<AuthGuard>` inside a new client `app/app/layout.tsx`. The guard subscribes to `useAuthenticator((ctx) => [ctx.authStatus])` from `@aws-amplify/ui-react` (already wired in Phase 2 via `<Authenticator.Provider>` at root in `app/AmplifyProvider.tsx`) and renders a centered spinner during `"configuring"`, redirects to `/login?from=<path>` (validated allowlist) during `"unauthenticated"`, and renders children during `"authenticated"`. `app/login/page.tsx` is extended to read `?from=` (Suspense-wrapped, mandatory in Next 16 production builds) and `router.replace(safeFromPath(from) ?? "/app")` after sign-in. The protected page itself reads email synchronously from `useAuthenticator(({user}) => [user]).user.signInDetails?.loginId` and fetches `name` async via `fetchUserAttributes()` from `aws-amplify/auth`. No new packages are needed.

**Primary recommendation:** Implement exactly the four files listed in CONTEXT (D-30..D-40) — `app/_components/AuthGuard.tsx`, `app/_components/safeFromPath.ts`, `app/app/layout.tsx`, modified `app/login/page.tsx`, replaced `app/app/page.tsx`. Wrap `useSearchParams` in a `<Suspense>` boundary at the `app/login/page.tsx` level (split into `LoginPageInner` consumer + page-level `<Suspense>` parent) — required for `next build` to succeed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-30:** `<AuthGuard>` is a reusable client component, mounted inside a client `app/app/layout.tsx` that wraps all children of `/app/*`. Routes nested under `/app/...` inherit the guard automatically; routes outside `/app/` import `<AuthGuard>` explicitly. Combines App Router idiom (layouts) with reusability (component). Satisfies ROADMAP success criterion 3 ("HOC, layout, or middleware documented") with the "layout" option.
- **D-31:** Gating uses `useAuthenticator((ctx) => [ctx.authStatus])` from `@aws-amplify/ui-react` — same hook + selector that Phase 2 D-26 / `app/login/page.tsx` already use. Three states: `configuring` → render loading; `authenticated` → render children; non-authenticated (`unauthenticated`, `signIn`, `signUp`, `confirmSignUp`, etc.) → redirect to `/login?from=...`. Works because `Authenticator.Provider` is mounted at root in `app/AmplifyProvider.tsx` (Phase 2 plan 02-03 hoist).
- **D-32:** Component lives at `app/_components/AuthGuard.tsx`. Underscore prefix excludes the directory from App Router routing.
- **D-33:** `<AuthGuard>` only does gating (renders `children` or redirects). No user info passed via props/context. Protected pages call `useAuthenticator` / `fetchUserAttributes()` directly.
- **D-34:** During `authStatus === "configuring"`, `<AuthGuard>` renders a centered (vertical/horizontal) spinner + "Loading…" text. Tailwind utility classes.
- **D-35:** Redirect uses `router.replace(...)` (NOT `router.push`). `useRouter` from `next/navigation`.
- **D-36:** Bounce-back via `?from=` query param. `<AuthGuard>` builds `/login?from=${encodeURIComponent(pathname)}`. Allowlist anti open-redirect: `from` must `startsWith("/")`, NOT `startsWith("//")`, NOT `startsWith("/login")`. Helper shared between `<AuthGuard>` and `/login`.
- **D-37:** `app/login/page.tsx` extended to support `?from=`. After sign-in, reads `searchParams.get("from")`, runs through `safeFromPath`, and `router.replace(from ?? "/app")`. Changes `push` → `replace`.
- **D-38:** `/app` content with active session shows email + name + `<SignOutButton>`. Two attributes visible.
- **D-39:** Email from `useAuthenticator(({user}) => [user]).user.signInDetails?.loginId` (sync). Name from async `fetchUserAttributes()` of `aws-amplify/auth`. Cognito attribute key on the wire is `name` (OIDC standard claim) — Phase 2 D-18 declared `fullname` in CDK, which maps to `name`. Fallback to email-only if name fetch fails.
- **D-40:** REPLACE `app/app/page.tsx`. `<SignOutButton>` reused as-is.
- **D-41:** `@aws-amplify/adapter-nextjs` deferred — Phase 3 stays 100% client-side.

### Claude's Discretion

- Spinner visual (Tailwind classes, size, color)
- `/app` typography and layout
- Whether `safeFromPath` lives in `app/_components/safeFromPath.ts`, `app/_lib/url.ts`, or inlined — recommendation in this research: `app/_components/safeFromPath.ts` (co-locates with `<AuthGuard>`, single new directory)
- Showing `user.username` (Cognito sub) — recommendation: skip, debug-info only
- `<Suspense>` placement around `useSearchParams` — recommendation: page-level boundary in `/login` (see K-3)
- Async name fetch via `useEffect` vs `<Suspense>` + `use()` — recommendation: `useEffect` + local state (simpler, matches phase voice "shippeable hoy")
- Custom `User` type — recommendation: skip (use `AuthUser` from `aws-amplify/auth`)
- Copy of "Signed in as …" text

### Deferred Ideas (OUT OF SCOPE)

- `@aws-amplify/adapter-nextjs` + cookie storage + server-side auth (route handlers / server actions)
- Production / Amplify Hosting validation (Phase 4)
- Roles, permissions, multi-tenant
- Real layout shell (header, sidebar, nav) — datathon feature decides
- Magic link, MFA, GitHub OAuth, Google OAuth federation
- Skeleton during `configuring` (overkill)
- HOC `withAuthGuard(Component)` (non-idiomatic in App Router 16)
- Custom `AuthContext` (`Authenticator.Provider` already covers it)
- Route group `(protected)` (overkill with one route)
- Bounce-back state preservation (scroll position, form drafts)
- Unit tests for `safeFromPath`, E2E tests of full flow

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-04 | Ruta protegida (ej. `/app` o `/dashboard`) que redirige a `/login` (o muestra `<Authenticator>`) cuando no hay sesión activa, y muestra contenido cuando sí | K-1 (`useAuthenticator` selector pattern); K-2 (`AuthStatus` union); K-4 (client layout); K-5 (`router.replace`); K-6 (`safeFromPath` allowlist); K-7 (`fetchUserAttributes` shape); G-1 (file structure); Code Examples §1–§4 |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Auth state subscription (`authStatus`) | Browser / Client | — | xstate machine + React context provided by `Authenticator.Provider`; SSR-safe but values are client-only by design (configuring state on first render) |
| Route protection / redirect | Browser / Client | — | `useRouter` + `useEffect` + `router.replace` is App Router 16's idiomatic client-side guard. Server middleware path (`middleware.ts`) intentionally deferred (D-41). |
| User attribute fetch | Browser / Client | — | `fetchUserAttributes()` calls Cognito GetUser via stored access token in localStorage; client-only flow |
| Loading state UI | Browser / Client | — | Spinner during `authStatus === "configuring"` is a hydration-aware client-side render |
| Open-redirect allowlist (`safeFromPath`) | Browser / Client | — | Pure string validation; no server involvement |
| Sign-out | Browser / Client | — | Existing `<SignOutButton>` reused as-is, calls `signOut()` from `aws-amplify/auth` then `router.push("/")` |

**No tier misassignment risk** — Phase 3 is intentionally single-tier (client). Phase 4+ may add server tier when API routes need session reading; that's explicitly D-41 territory.

## Key Findings

### K-1. `useAuthenticator` selector signature in `@aws-amplify/ui-react@6.15.3` is exactly what Phase 2 already uses

[VERIFIED: `node_modules/@aws-amplify/ui-react-core/dist/types/Authenticator/hooks/useAuthenticator/types.d.ts` and `useAuthenticator.d.ts`]

```typescript
export type UseAuthenticatorSelector = (
  context: AuthenticatorMachineContext
) => AuthenticatorMachineContext[AuthenticatorMachineContextKey][];

export default function useAuthenticator(
  selector?: UseAuthenticatorSelector
): UseAuthenticator;
```

The selector takes the full machine context (`AuthenticatorServiceFacade`) and returns an **array** of values — the array drives memoization (re-render only when any element changes by reference). `UseAuthenticator extends AuthenticatorServiceFacade` so the **return value contains the entire facade**, regardless of which keys you put in the selector array. The selector array gates re-renders; it does NOT gate destructure access.

Phase 2's `app/login/page.tsx` already uses the canonical pattern:

```typescript
const { authStatus } = useAuthenticator((context) => [context.authStatus]);
```

You can also destructure multiple keys at once:

```typescript
// Re-renders when authStatus OR user reference changes; both readable
const { authStatus, user } = useAuthenticator(({ authStatus, user }) => [authStatus, user]);
```

Verified by Amplify's own internal usage — `node_modules/@aws-amplify/ui-react/dist/esm/components/Authenticator/Authenticator.mjs:32` does exactly:

```typescript
const { route, signOut, user } = useAuthenticator(({ route, signOut, user }) => [route, signOut, user]);
```

**For Phase 3, two valid call sites:**

```typescript
// In <AuthGuard>: only authStatus needed
const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

// In <AppPage> (the protected page): user object for sync email
const { user } = useAuthenticator(({ user }) => [user]);
const email = user?.signInDetails?.loginId;
```

### K-2. `AuthStatus` union has exactly three values

[VERIFIED: `node_modules/@aws-amplify/ui/dist/types/helpers/authenticator/facade.d.ts:12`]

```typescript
export type AuthStatus = 'configuring' | 'authenticated' | 'unauthenticated';
```

That is the **complete union** — no `signIn`, `signUp`, `confirmSignUp` values for `authStatus`. Those exist on a different field, `route` (type `AuthenticatorRoute`), used internally by `<Authenticator>` to drive which sub-form renders.

**CONTEXT D-31 mentions "`unauthenticated` (también `signIn`, `signUp`, `confirmSignUp`, etc.)" — this is conceptually correct but the values land on `route`, not `authStatus`.** For gating purposes, `<AuthGuard>` only cares about `authStatus`, so the three-way switch (`configuring` / `authenticated` / `unauthenticated`) is exhaustive. No risk of silent fall-through.

```typescript
// In <AuthGuard>:
if (authStatus === "configuring") return <Spinner />;
if (authStatus === "authenticated") return <>{children}</>;
// authStatus === "unauthenticated" — fall through to redirect
```

### K-3. `useSearchParams` REQUIRES a `<Suspense>` boundary in Next.js 16 production builds

[VERIFIED: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md` lines 78–179]

Quoted directly:

> If a route is prerendered, calling `useSearchParams` will cause the Client Component tree up to the closest `Suspense` boundary to be client-side rendered.
>
> We recommend wrapping the Client Component that uses `useSearchParams` in a `<Suspense/>` boundary.
>
> **In development, routes are rendered on-demand, so `useSearchParams` doesn't suspend and things may appear to work without `Suspense`.**
>
> **During production builds, a static page that calls `useSearchParams` from a Client Component must be wrapped in a `Suspense` boundary, otherwise the build fails with the "Missing Suspense boundary with useSearchParams" error.**

**Implication for Phase 3:** Modifying `app/login/page.tsx` to call `useSearchParams()` directly will pass `bun run dev` but break `bun run build` (Phase 4 territory but Phase 3's verification gauntlet runs `bun run build`).

**Canonical fix:** split the page into two components:

```typescript
// app/login/page.tsx
"use client";
import { Suspense } from "react";
import { LoginPageInner } from "./LoginPageInner"; // or co-locate as a top-level fn

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-sm opacity-70">Loading…</p>}>
      <LoginPageInner />
    </Suspense>
  );
}
```

The inner component contains the actual `useSearchParams() / useRouter() / useAuthenticator() / useEffect / <Authenticator>` logic.

**Why split rather than wrap inline:** the suspense boundary must be **above** the consumer of `useSearchParams`. You cannot Suspense-wrap content that lives in the same component that calls `useSearchParams`. The page-level wrap is the simplest correct placement.

### K-4. Layouts CAN be client components in App Router 16; but a `"use client"` layout cannot export `metadata`

[VERIFIED: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md` and `01-getting-started/05-server-and-client-components.md`]

The Next docs make no prohibition on client layouts — they explicitly show client-marked components mixed into layouts. The only hard rule:

> Error boundaries must be Client Components, which means that `metadata` and `generateMetadata` exports are not supported in `global-error.jsx`. *(`error.md:165` — same constraint applies to any client-marked file.)*

**For `app/app/layout.tsx`:** `"use client"` at top is fine. We do **not** need `export const metadata` here — the root `app/layout.tsx` already declares `<html>`, `<body>`, and the page metadata. Sub-layouts that need metadata stay server components; ours doesn't need it.

`"use client"` in `app/app/layout.tsx` does NOT cascade to children (each `page.tsx` and `layout.tsx` is its own boundary entry point). However, **all imports of the client layout become part of the client bundle** — fine here because the layout's only import is `<AuthGuard>` (already a client component).

### K-5. `router.replace` from `next/navigation` is the correct API in Next 16; no deprecation

[VERIFIED: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md:45`]

```typescript
router.replace(href: string, { scroll: boolean, transitionTypes: string[] }):
  "Perform a client-side navigation to the provided route without adding a new entry into the browser's history stack."
```

No deprecation. Stable since v13. `router.push` adds history; `router.replace` does not. Phase 3 picks `replace` (D-35, D-37) so the back button doesn't trap the user in a redirect loop.

**XSS warning surfaced in same doc (line 53):** "You must not send untrusted or unsanitized URLs to `router.push` or `router.replace`, as this can open your site to cross-site scripting (XSS) vulnerabilities. For example, `javascript:` URLs sent to `router.push` or `router.replace` will be executed in the context of your page."

This directly motivates K-6 (the `safeFromPath` allowlist) — without validation, `?from=javascript:alert(1)` would XSS via `router.replace`.

### K-6. `safeFromPath` allowlist — exact validation rules

[VERIFIED via Next 16 router XSS warning + general open-redirect guidance]

```typescript
// app/_components/safeFromPath.ts
export function safeFromPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.length > 512) return null;          // arbitrary cap, prevent abuse
  if (raw.startsWith("//")) return null;      // protocol-relative URL → external host
  if (raw.startsWith("/\\")) return null;     // browser quirk: //evil.com vs /\evil.com
  if (!raw.startsWith("/")) return null;      // must be absolute path
  if (raw.startsWith("/login")) return null;  // prevent /login → /login redirect loop
  if (raw.includes("\0")) return null;        // null-byte tampering
  if (raw.includes("\\")) return null;        // backslash variants of // tricks
  return raw;
}
```

**Why string-prefix and not `URL.parse`:**
- `URL.parse(raw)` doesn't help: `new URL("//evil.com", "https://app.com")` resolves to `https://evil.com` (not what we want; obscures the danger). `new URL("/login", "https://app.com")` works fine but adds work to reach the same conclusion.
- The `from` value comes back as an unmodified query string from `useSearchParams`. We feed it directly to `router.replace`, which navigates same-origin if the string starts with `/` (NOT `//`). So same-origin enforcement = "starts with `/`, not `//`."
- `URL.parse` is `null`-returning in modern browsers, but Node-side / older targets may throw. Simple string prefix has zero failure modes.
- 8 lines of pure-JS. No tradeoff.

**Tests are deferred** (CONTEXT Backlog) — but if added, the table is:
| Input | Expected |
|-------|----------|
| `null` / `undefined` / `""` | `null` |
| `"/app"` | `"/app"` |
| `"/app/foo"` | `"/app/foo"` |
| `"//evil.com"` | `null` |
| `"/login"` | `null` (loop) |
| `"/login/sub"` | `null` (loop — `startsWith` matches) |
| `"https://evil.com"` | `null` (no leading `/`) |
| `"javascript:alert(1)"` | `null` (no leading `/`) |
| `"/\\evil.com"` | `null` |
| `"/app "` (null byte) | `null` |
| `"/" + "x".repeat(600)` | `null` (length cap) |

### K-7. `fetchUserAttributes()` from `aws-amplify/auth` — exact shape, error modes

[VERIFIED: `node_modules/@aws-amplify/auth/dist/esm/providers/cognito/apis/fetchUserAttributes.d.ts` + `types/outputs.d.ts:11` + `types/models.d.ts:23` + `@aws-amplify/core/.../types.d.ts:70`]

**Import:** `import { fetchUserAttributes } from "aws-amplify/auth";` (subpath import, v6 only).

**Signature:**
```typescript
declare const fetchUserAttributes: () => Promise<FetchUserAttributesOutput>;
// Resolved type after walking aliases:
// type FetchUserAttributesOutput = Partial<Record<UserAttributeKey, string>>;
// type UserAttributeKey = AuthStandardAttributeKey | string;
// type AuthStandardAttributeKey = 'address' | 'birthdate' | 'email_verified' | 'family_name'
//   | 'gender' | 'given_name' | 'locale' | 'middle_name' | 'name' | 'nickname'
//   | 'phone_number_verified' | 'picture' | 'preferred_username' | 'profile' | 'sub'
//   | 'updated_at' | 'website' | 'zoneinfo' | 'email' | 'phone_number';
```

**So the resolved object is `Partial<Record<string, string>>`** — every field optional. Concretely for our user pool (which has `email` and `name` declared per `amplify_outputs.json#standard_required_attributes`):

```typescript
{
  email: "user@example.com",
  email_verified: "true",
  name: "Jane Doe",
  sub: "abc-uuid-1234"
}
```

**Note:** values are always **strings**. `email_verified` comes back as the string `"true"`, not the boolean.

**Error modes (from JSDoc):**
- Throws `AuthTokenConfigException` if `Amplify.configure(outputs)` has not run (irrelevant — root provider has it).
- Throws `GetUserException` (Cognito service errors) — common cases: token expired between page load and call, network failure, user pool reachability.

**Phase 3 implication:** wrap in `try/catch` inside a `useEffect`; on failure, render email-only (D-39 "If `fetchUserAttributes` fails or the name doesn't exist, show only email").

```typescript
const [name, setName] = useState<string | undefined>();
useEffect(() => {
  let cancelled = false;
  (async () => {
    try {
      const attrs = await fetchUserAttributes();
      if (!cancelled) setName(attrs.name);
    } catch {
      // Token may have expired; render email-only fallback
    }
  })();
  return () => { cancelled = true; };
}, []);
```

**When to refetch:** only on mount. The `name` attribute is stable (mutable via `updateUserAttributes`, but not changing on its own). No dependency on `authStatus` needed if `<AuthGuard>` only renders the page when `authStatus === "authenticated"` — meaning a session exists.

### K-8. `signInDetails.loginId` is the canonical email field for email-based sign-in

[VERIFIED: `node_modules/@aws-amplify/auth/dist/esm/providers/cognito/types/models.d.ts:59-68`]

```typescript
export interface CognitoAuthSignInDetails {
  loginId?: string;
  authFlowType?: AuthFlowType;
}
export interface AuthUser extends AWSAuthUser {
  signInDetails?: CognitoAuthSignInDetails;
}
// Where AWSAuthUser = { username: string; userId: string; }
```

**For our user pool (`loginWith: { email: true }`):** `loginId` is the email the user typed at sign-in. `username` is the Cognito `sub` UUID (because email-as-alias uses the username field for sub). `userId` is also the `sub`.

**So:**
- `user.signInDetails?.loginId` → `"user@example.com"` ✓ what D-39 wants
- `user.username` → `"abc-uuid-1234"` ✗ NOT a friendly identifier
- `user.userId` → `"abc-uuid-1234"` ✗ same

**`signInDetails` is optional** — it's `undefined` if the session was rehydrated from storage in some edge cases (older Amplify clients or anonymous identity). **Defensive code:** `user?.signInDetails?.loginId ?? attrs?.email ?? ""` (the `email` from `fetchUserAttributes` is the second source of truth).

### K-9. `Authenticator.Provider` is at root — no caveats for `useAuthenticator` from any client component subtree

[VERIFIED: Phase 2 plan 02-03 SUMMARY + `app/AmplifyProvider.tsx` source + `node_modules/@aws-amplify/ui-react/dist/esm/components/Authenticator/Authenticator.mjs:70`]

```typescript
// Authenticator.mjs
Authenticator.Provider = AuthenticatorProvider;
```

`AuthenticatorProvider` from `@aws-amplify/ui-react-core` provides `AuthenticatorContext` to all descendants. `useAuthenticator` reads `React.useContext(AuthenticatorContext)` and throws `USE_AUTHENTICATOR_ERROR` if the context is missing. Since Phase 2 mounted `<AuthenticatorProvider>` (via `<Authenticator.Provider>`) inside `app/AmplifyProvider.tsx` which wraps `{children}` in `app/layout.tsx`, **every client component anywhere under the root tree can call `useAuthenticator()`** — including `app/_components/AuthGuard.tsx`, `app/app/layout.tsx`, `app/app/page.tsx`, `app/login/page.tsx`.

**React 19 + Next 16 caveat — none.** The provider is a plain React Context; it propagates from `<body>` down through both server- and client-component boundaries (server components don't consume it; client components below the boundary do). No SSR hydration issue because `AmplifyProvider` is a `"use client"` file — the entire subtree under it hydrates as a client island. Phase 2's manual flows already verified `useAuthenticator` works in `app/login/page.tsx` (sibling of `<Authenticator>`, NOT a descendant of its render-prop) — same model applies to `<AuthGuard>` in any subtree.

### K-10. No new packages needed for Phase 3

[VERIFIED: `package.json` + listed APIs above]

All Phase 3 APIs are already installed:
- `aws-amplify@6.16.4` provides `fetchUserAttributes`, `signOut` (already used)
- `@aws-amplify/ui-react@6.15.3` provides `useAuthenticator`, `Authenticator.Provider` (already wired)
- `next@16.2.4` provides `useRouter`, `useSearchParams`, `usePathname`, `Suspense` (via `react`)
- `react@19.2.4` provides `useState`, `useEffect`, `useCallback`, `Suspense`

Confirms D-41 (no `@aws-amplify/adapter-nextjs`). Phase 3 adds zero `dependencies`/`devDependencies` lines to `package.json`, zero new audit ignores, zero CDK changes, zero backend changes, zero `amplify_outputs.json` regeneration.

## Landmines / Gotchas

### L-1. `useSearchParams` without `<Suspense>` — `bun run build` fails

[VERIFIED: K-3]

If `app/login/page.tsx` calls `useSearchParams()` directly (no Suspense ancestor), `bun run dev` works but `bun run build` errors with "Missing Suspense boundary with useSearchParams." Phase 1 verification gauntlet (`bun run lint && typecheck && audit && build`) is part of every plan's acceptance — **the plan must split the page into outer (`<Suspense>` wrapper) + inner (consumer) components**, not retrofit Suspense after the build breaks.

**Detection:** the dev-mode silence is the trap. Plan-checker should grep for `useSearchParams` and verify the file (or its ancestor) contains a `<Suspense>` import + JSX usage.

### L-2. `AuthGuard` redirect loop if mounted on `/login`

If a future developer imports `<AuthGuard>` into `/login` (or its layout) thinking "all routes should be guarded," they create a loop: unauthenticated → redirect to `/login` → unauthenticated → redirect to `/login` → ... The `safeFromPath` allowlist catches `from=/login` (rejects it) but does NOT prevent **the guard itself** from being mounted on `/login`.

**Mitigation:** in JSDoc on `<AuthGuard>`, document "MUST NOT be used on `/login` or any route that is itself the unauthenticated landing." Optional defensive code (cheap):

```typescript
const pathname = usePathname();
useEffect(() => {
  if (authStatus === "unauthenticated" && !pathname.startsWith("/login")) {
    router.replace(`/login?from=${encodeURIComponent(pathname)}`);
  }
}, [authStatus, pathname, router]);
```

The `!pathname.startsWith("/login")` check is belt-and-suspenders: even if a developer misuses the guard, no infinite redirect.

### L-3. Calling `router.replace` inside the render body causes "cannot update during render" warning

`router.replace(...)` MUST be called from inside `useEffect` or an event handler — never directly during render. Pattern:

```typescript
// CORRECT
useEffect(() => {
  if (authStatus === "unauthenticated") {
    router.replace(`/login?from=${encodeURIComponent(pathname)}`);
  }
}, [authStatus, pathname, router]);

// WRONG — fires during render
if (authStatus === "unauthenticated") {
  router.replace(`/login?from=${encodeURIComponent(pathname)}`);
  return null;
}
```

The render-phase form passes type-check but produces a React warning at runtime: "Cannot update a component (`Router`) while rendering a different component (`AuthGuard`)." It also triggers double-redirects in StrictMode dev. Always use `useEffect`.

### L-4. The `useEffect` dep array omitting `searchParams` — stale on param change

When Phase 3 extends `app/login/page.tsx` to read `searchParams.get("from")`, the existing dep array `[authStatus, router]` MUST become `[authStatus, router, searchParams]`. The `useSearchParams` hook returns a new `ReadonlyURLSearchParams` reference on each navigation, so the effect re-runs only if `searchParams` is in the deps.

**Without `searchParams` in deps:** if the user lands on `/login?from=/app`, signs in (`authStatus → "authenticated"`), the effect fires once with the captured `from` (correct). If somehow the user navigates to `/login?from=/elsewhere` while authenticated and the effect doesn't re-fire... actually for our flow this is benign because once authenticated the user is redirected away and `/login` unmounts. But ESLint's `react-hooks/exhaustive-deps` will warn. Phase 1 enforces `eslint . --max-warnings=0` (strict). **Plan must include `searchParams` in deps.**

### L-5. `pathname` from `usePathname()` does NOT include search params or hash

[VERIFIED: `use-pathname.md:60-68`]

| URL | `usePathname()` |
|-----|-----------------|
| `/app` | `/app` |
| `/app?foo=bar` | `/app` |
| `/app#section` | `/app` |

For Phase 3 that's exactly what we want for the `?from=` value (we don't preserve query/hash on protected routes). But if future `/app/something?tab=2` should preserve the tab param after sign-in, `pathname` alone won't carry it — would need to combine `usePathname()` + `useSearchParams()`. Out of scope for v1 (CONTEXT Deferred — bounce-back state preservation).

### L-6. `fetchUserAttributes` swallowed errors hide real bugs

The "fallback to email-only on error" pattern (K-7) is correct UX-wise but can hide real config issues during development. **In dev mode, log the error**:

```typescript
} catch (e) {
  if (process.env.NODE_ENV !== "production") {
    console.warn("[AppPage] fetchUserAttributes failed:", e);
  }
}
```

Without this, a misconfigured Amplify client will silently render only email and the dev will think Phase 3 "works" while shipping a broken integration. Cheap; do it.

### L-7. `router.replace(href)` does NOT verify same-origin — `safeFromPath` is the only defense

Re-emphasizing K-5's docs warning: `router.replace("javascript:alert(1)")` will execute. `router.replace("https://evil.com/")` will navigate (full-page nav). **The allowlist in `safeFromPath` is load-bearing for security**, not a nice-to-have. Plan-checker should grep `app/login/page.tsx` for `router.replace(` and confirm the argument is either a literal string OR a value that has been routed through `safeFromPath`.

### L-8. `<AuthGuard>` rendered while `authStatus === "configuring"` must NOT render children

Without a `configuring`-state branch, `<AuthGuard>` would render children during the brief window before Amplify resolves the session. This causes:
- Flash of protected content (FOUC for security) — worst case shows email/name from cached `localStorage` to a logged-out viewer if cache stale
- Race condition: child's `useAuthenticator(({user}) => [user]).user` may be `undefined`, throwing on `.signInDetails?.loginId` (the `?.` saves us, but the page renders blank)

**The three-way switch in K-2 is mandatory.** Spinner during `configuring` is non-negotiable (D-34).

### L-9. `app/app/layout.tsx` must NOT export `metadata` (K-4)

If a developer adds `export const metadata: Metadata = { title: "App" }` to a `"use client"` file, `next build` errors:

> You are attempting to export "metadata" from a component marked with "use client", which is disallowed.

The page `app/app/page.tsx` itself can stay a server-or-client component and export metadata if desired (Claude's discretion — overkill for v1). The **layout** cannot.

### L-10. `Authenticator.Provider` is also `<Authenticator>` itself — don't double-mount

Phase 2's `app/login/page.tsx` renders `<Authenticator />` (the full UI component). Phase 3 must NOT add a second `<Authenticator.Provider>` inside `app/app/layout.tsx` — there's already one at root. Adding another would create a separate state machine and `useAuthenticator` hooks would read from whichever provider is closest. Confusing, broken.

**Plan-checker:** grep for `Authenticator.Provider` should find exactly one occurrence (in `app/AmplifyProvider.tsx`).

### L-11. `signInDetails.loginId` may be `undefined` after page reload in v6

[VERIFIED: `node_modules/@aws-amplify/auth/dist/esm/providers/cognito/tokenProvider/TokenStore.mjs:42`] — TokenStore reads `signInDetails` from key-value storage on rehydrate, so it should persist. But if storage was cleared partially or the user signed in on a different version of Amplify, `signInDetails` may be missing. **The `?.` chain in D-39's spec already handles this**, but planner should ensure the rendered text gracefully degrades (`Signed in as {email ?? "your account"}`).

## Guidelines

### G-1. File structure for Phase 3

| File | Status | Type | Notes |
|------|--------|------|-------|
| `app/_components/AuthGuard.tsx` | NEW | client component | Default export `AuthGuard`. Accepts `{ children: React.ReactNode }`. Implements three-state switch (K-2). |
| `app/_components/safeFromPath.ts` | NEW | pure TS module | Named export `safeFromPath(raw: string \| null \| undefined): string \| null`. Implements K-6. |
| `app/app/layout.tsx` | NEW | client component | `"use client"` at top. Default export wraps `children` in `<AuthGuard>`. No `metadata` export. |
| `app/app/page.tsx` | REPLACE | client component | `"use client"` (needs `useAuthenticator` hook + `useEffect` for `fetchUserAttributes`). Renders `Signed in as {name} ({email})` + `<SignOutButton>`. |
| `app/login/page.tsx` | MODIFY | client component | Split into outer `LoginPage` (Suspense) + inner `LoginPageInner`. Inner reads `useSearchParams`, runs `safeFromPath`, `router.replace(from ?? "/app")`. |
| `app/AmplifyProvider.tsx` | UNCHANGED | client component | Phase 2's hoisted root provider. Phase 3 reads from it via context. |
| `app/layout.tsx` | UNCHANGED | server component | Root layout. |
| `app/app/SignOutButton.tsx` | UNCHANGED | client component | Reuse as-is. |

### G-2. Import style — match Phase 2 conventions

```typescript
// Path alias for amplify_outputs.json (verified in tsconfig.json + Phase 2)
import outputs from "@/amplify_outputs.json";

// New components — relative or aliased; planner picks one consistently per file:
import { AuthGuard } from "@/app/_components/AuthGuard";
import { safeFromPath } from "@/app/_components/safeFromPath";

// Or sibling-relative:
import { AuthGuard } from "../_components/AuthGuard";

// Hooks and APIs — exactly as Phase 2:
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchUserAttributes } from "aws-amplify/auth";
```

### G-3. Quote style and lint compliance

Phase 1 patterns: double quotes (`"use client"` not `'use client'`). All new code in Phase 3 must follow. ESLint flat-config in repo will fail on single quotes.

`useEffect` dep arrays exhaustive (`react-hooks/exhaustive-deps` rule active). `[authStatus, router, searchParams]` for the login page; `[authStatus, pathname, router]` for `<AuthGuard>`; `[]` for the one-shot `fetchUserAttributes` mount effect (cancellation flag pattern).

### G-4. Spinner — minimal Tailwind (Claude's discretion, but here's the shape)

```tsx
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
```

Uses Tailwind v4 + project tokens (`border-foreground`, etc.) per CONVENTIONS. `aria-label="Loading"` for screen readers. `min-h-screen` matches `app/login/page.tsx` Phase 2 pattern.

### G-5. Deferred to Phase 4 — verify in production build

Phase 3's verification gauntlet (`bun run lint && typecheck && audit && build`) catches the L-1 Suspense issue and confirms components compile. **Phase 4 / post-deploy will catch:**
- Production hydration mismatches (if any) around `usePathname` (cf. `use-pathname.md:39` rewrites caveat — we have no rewrites, low risk)
- The `<Suspense>` boundary's actual fallback rendering during initial HTML stream

For Phase 3 verification: dev mode + production build. No need to run a deployed environment.

## API Signatures Reference

Verified against `node_modules/` types (`@aws-amplify/ui-react@6.15.3`, `aws-amplify@6.16.4`, `next@16.2.4`).

```typescript
// =============================================================
// @aws-amplify/ui-react — useAuthenticator
// =============================================================
type AuthStatus = "configuring" | "authenticated" | "unauthenticated";

type AuthenticatorMachineContext = {
  authStatus: AuthStatus;
  user: AuthUser;            // imported from "aws-amplify/auth"
  username: string;
  route: AuthenticatorRoute; // 'signIn' | 'signUp' | 'authenticated' | etc.
  signOut: (data?: AuthEventData) => void;
  // ... plus 17 more fields (allowedMfaTypes, error, isPending, ...)
};

type UseAuthenticatorSelector =
  (ctx: AuthenticatorMachineContext) => AuthenticatorMachineContext[keyof AuthenticatorMachineContext][];

declare function useAuthenticator(
  selector?: UseAuthenticatorSelector
): AuthenticatorMachineContext & {
  fields: unknown;    // @deprecated — internal only, ignore
  QRFields: unknown;  // @deprecated — internal only, ignore
};

// Idiomatic call sites for Phase 3:
const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);
const { user } = useAuthenticator(({ user }) => [user]);

// =============================================================
// aws-amplify/auth — AuthUser, signInDetails
// =============================================================
interface AWSAuthUser {
  username: string;  // Cognito sub UUID for email-as-alias pools
  userId: string;    // Same value (sub UUID)
}

interface CognitoAuthSignInDetails {
  loginId?: string;       // The email the user typed at sign-in
  authFlowType?: AuthFlowType;
}

interface AuthUser extends AWSAuthUser {
  signInDetails?: CognitoAuthSignInDetails;
}

// Access pattern:
const email: string | undefined = user?.signInDetails?.loginId;

// =============================================================
// aws-amplify/auth — fetchUserAttributes
// =============================================================
type AuthStandardAttributeKey =
  | "address" | "birthdate" | "email" | "email_verified" | "family_name"
  | "gender" | "given_name" | "locale" | "middle_name" | "name" | "nickname"
  | "phone_number" | "phone_number_verified" | "picture" | "preferred_username"
  | "profile" | "sub" | "updated_at" | "website" | "zoneinfo";

type UserAttributeKey = AuthStandardAttributeKey | string;

type FetchUserAttributesOutput = Partial<Record<UserAttributeKey, string>>;
// Concretely for our pool:
//   { email?: string; email_verified?: "true"|"false"; name?: string; sub?: string }

declare const fetchUserAttributes: () => Promise<FetchUserAttributesOutput>;
// Throws GetUserException, AuthTokenConfigException

// =============================================================
// next/navigation — useRouter, usePathname, useSearchParams
// =============================================================
declare function useRouter(): {
  push(href: string, options?: { scroll?: boolean; transitionTypes?: string[] }): void;
  replace(href: string, options?: { scroll?: boolean; transitionTypes?: string[] }): void;
  refresh(): void;
  prefetch(href: string, options?: { onInvalidate?: () => void }): void;
  back(): void;
  forward(): void;
};

declare function usePathname(): string;
// Returns pathname only (no query, no hash). Returns "/" for root.

declare function useSearchParams(): ReadonlyURLSearchParams;
// MUST be wrapped in <Suspense> ancestor in production builds (K-3)
```

## Code Examples

### §1 `app/_components/safeFromPath.ts`

```typescript
/**
 * Validate a `?from=` query value before passing to `router.replace`.
 *
 * Allowlist:
 *   - Must be a string
 *   - Length ≤ 512 chars
 *   - Must start with "/"
 *   - Must NOT start with "//" (protocol-relative URL → external host)
 *   - Must NOT start with "/login" (loop)
 *   - Must NOT contain backslash or null byte
 *
 * Returns the path unchanged if safe, else `null`.
 *
 * Why not URL.parse: `router.replace` treats any string-prefix `/` (and not `//`)
 * as same-origin path nav. URL.parse adds work without changing the conclusion.
 */
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

### §2 `app/_components/AuthGuard.tsx`

```tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";

/**
 * Protect a client subtree. Mounts `Authenticator.Provider` is assumed to
 * be present at root (`app/AmplifyProvider.tsx`).
 *
 * Three states:
 *   - `configuring`    → spinner + "Loading…" (no flash of protected content)
 *   - `unauthenticated`→ router.replace to /login?from=<current path>
 *   - `authenticated`  → renders children
 *
 * MUST NOT be mounted on /login itself (would loop). The pathname guard below
 * is a defensive backstop; the convention is "only wrap routes that should be
 * authenticated."
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  useEffect(() => {
    if (authStatus === "unauthenticated" && !pathname.startsWith("/login")) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [authStatus, pathname, router]);

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

  if (authStatus === "authenticated") {
    return <>{children}</>;
  }

  // unauthenticated — redirect effect has fired; render nothing in the meantime
  return null;
}
```

### §3 `app/app/layout.tsx`

```tsx
"use client";

import { AuthGuard } from "@/app/_components/AuthGuard";

// NOTE: client layouts cannot export `metadata` (K-4). The root layout's
// metadata is sufficient.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
```

### §4 `app/app/page.tsx` (REPLACES the placeholder)

```tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchUserAttributes } from "aws-amplify/auth";
import { SignOutButton } from "./SignOutButton";

export default function AppPage() {
  const { user } = useAuthenticator(({ user }) => [user]);
  const email = user?.signInDetails?.loginId;
  const [name, setName] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const attrs = await fetchUserAttributes();
        if (!cancelled) setName(attrs.name);
      } catch (e) {
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn("[AppPage] fetchUserAttributes failed:", e);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
}
```

### §5 `app/login/page.tsx` (MODIFIED — split for Suspense)

```tsx
"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { safeFromPath } from "@/app/_components/safeFromPath";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      const from = safeFromPath(searchParams.get("from")) ?? "/app";
      router.replace(from);
    }
  }, [authStatus, router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      {authStatus === "configuring" && (
        <p className="text-sm opacity-70">Loading…</p>
      )}
      {authStatus !== "authenticated" && <Authenticator />}
    </main>
  );
}

export default function LoginPage() {
  // <Suspense> is mandatory because LoginPageInner uses useSearchParams (K-3 / L-1).
  // Without this boundary, `bun run build` fails with
  // "Missing Suspense boundary with useSearchParams".
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

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | **None installed.** Project has zero test runner — verified by `package.json` (no `vitest`, `jest`, `playwright`, `cypress`, or related devDeps). |
| Config file | none — no `vitest.config.*`, `jest.config.*`, `playwright.config.*` in repo |
| Quick run command | `bun run lint && bun run typecheck` (the only fast machine-checked layer available) |
| Full suite command | `bun run lint && bun run typecheck && bun run audit && bun run build` (Phase 1's verification gauntlet, established convention) |
| Phase gate | Full suite green + manual D-29-style flow walkthrough (see Layer 4) before `/gsd-verify-work` |

### Phase Requirements → Test Map

| Req ID | Behavior | Layer 1 Static | Layer 2 Unit | Layer 3 Integration | Layer 4 E2E (manual) |
|--------|----------|---------------|---------------|---------------------|----------------------|
| AUTH-04 | Visiting `/app` without session redirects to `/login` | TS strict + ESLint (`bun run typecheck`, `bun run lint`) | — (no runner) | — | Manual: open incognito → visit `http://localhost:3000/app` → expect redirect to `/login?from=%2Fapp` |
| AUTH-04 | Visiting `/app` with session shows email + name | TS strict (signInDetails type) | — | — | Manual: sign in via `<Authenticator>` → land on `/app` → see "Welcome, {name}" + "Signed in as {email}" |
| AUTH-04 | Guard pattern reusable | TS strict (`<AuthGuard>` exported, typed) | — | — | Visual code review of `app/_components/AuthGuard.tsx` JSDoc + import resolvability from another route (sanity test in dev tools) |
| AUTH-04 (security) | `?from=` allowlist rejects open redirect | TS strict | — (no runner) | — | Manual: visit `/login?from=//evil.com` → sign in → expect redirect to `/app` (NOT to evil.com) |
| AUTH-04 (UX) | `<Suspense>` boundary works in prod build | `bun run build` succeeds | — | — | `bun run build` exits 0 (catches L-1 / K-3) |

### Sampling Rate

- **Per task commit:** `bun run lint && bun run typecheck` (< 10s)
- **Per wave merge:** `bun run lint && bun run typecheck && bun run audit && bun run build` (~30-60s, includes prod build → catches Suspense bug)
- **Phase gate:** Full suite green + 4 manual walkthroughs (table above) before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] **No test runner installed.** Decision (per CONTEXT user preference "lo más rápido que funcione"): do NOT install one in Phase 3. Layers 2-3 are intentionally empty. The `safeFromPath` pure function would be the natural unit-test target; CONTEXT Backlog notes this as a deferred item. If the planner later wants light coverage, vitest is the fastest install (`bun add -D vitest @testing-library/react @testing-library/jest-dom jsdom` + 4-line `vitest.config.ts`) — but per "shippeable hoy", skip.
- [ ] **No E2E framework.** `Playwright` would cover Layer 4. Also deferred per CONTEXT.

**If no Wave 0 changes:** explicit acknowledgment — "Phase 3 ships with manual + static validation only. The 4 manual flow walkthroughs in the table above are the sole runtime evidence of correctness, mirroring Phase 2 D-29's manual-flow approach which the user already accepted."

## Runtime State Inventory

> Phase 3 is a feature addition (new files + small extensions to existing files). No renames, no rebrand, no migration. **This section omitted by exception clause** ("Omit entirely for greenfield phases").

For completeness — confirming nothing in any of the five categories applies:

| Category | Items | Action |
|----------|-------|--------|
| Stored data | None — Cognito User Pool unchanged from Phase 2; no new data shapes | None |
| Live service config | None — no Cognito changes, no IAM, no env vars | None |
| OS-registered state | None | None |
| Secrets/env vars | None — no new secrets, no env var renames; `amplify_outputs.json` unchanged | None |
| Build artifacts | None — no package renames, no installed-CLI artifacts | None |

## Environment Availability

> Phase 3 has zero external dependencies — pure code/config addition. **This section omitted by exception clause** ("Skip this section if the phase has no external dependencies (code/config-only changes)").

For sanity:

| Dependency | Required | Available | Source |
|------------|----------|-----------|--------|
| Bun | yes | ✓ | `package.json` engine + `bun.lock` already in repo (Phase 1) |
| Node 20+ | yes (next dev) | ✓ | `@types/node@^20` declares the floor |
| `aws-amplify@6.16.4` | yes | ✓ | already installed (Phase 2 plan 02-02) |
| `@aws-amplify/ui-react@6.15.3` | yes | ✓ | already installed (Phase 2 plan 02-02) |
| `next@16.2.4` | yes | ✓ | already installed (Phase 1) |
| AWS Cognito User Pool | yes (runtime auth) | ✓ | Live in `us-east-1` from Phase 2 plan 02-04 (`us-east-1_6l4dSfRCz`) |

**Nothing missing. Nothing to install.**

## Project Constraints (from CLAUDE.md / AGENTS.md)

- **HARD:** Next.js 16 has breaking changes vs training data. `node_modules/next/dist/docs/` is the source of truth. **Honored:** `useSearchParams` Suspense rule (K-3), `useRouter`/`router.replace` API (K-5), `usePathname` semantics (L-5), client-layout rules (K-4), `useEffect` for navigation side effects (L-3) all verified against the local docs in `node_modules/next/dist/docs/01-app/03-api-reference/`.
- **HARD:** Heed deprecation notices. **Honored:** confirmed `router.replace` is current (no deprecation), `useAuthenticator` hook is current (no deprecation in v6.15), `next/navigation` (NOT `next/router` — Pages Router only) is the App Router import path.
- **CARRIED FROM PHASE 1:** Strict `eslint . --max-warnings=0`, double-quote string style, `bun run typecheck` must stay green, `bun run audit` ignore-list pattern (no extension expected — Phase 3 adds zero deps).
- **CARRIED FROM PHASE 2:** `<Authenticator.Provider>` mounted exactly once at root (`app/AmplifyProvider.tsx`); do not double-mount (L-10). `Amplify.configure(outputs)` (no `ssr: true`) — do not regress this walk-back (Phase 2 plan 02-05).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| (none) | All claims in this research were verified against installed `node_modules/` source code (Amplify types, ui-react source, Next.js docs) or against Phase 2's already-validated live integration. | — | — |

**Empty by design** — every load-bearing claim was checked against `node_modules/` types or local Next docs. No `[ASSUMED]` claims escaped to this report.

## Open Questions

1. **Should `<AuthGuard>` defensively check `!pathname.startsWith("/login")` to prevent loops if misused?**
   - What we know: CONTEXT D-30 says "any route under /app inherits, any route outside imports explicitly." The defensive check is belt-and-suspenders.
   - What's unclear: whether the user wants the small extra logic in the component or trusts the convention.
   - **Recommendation:** include the check. Five extra characters in the conditional (`!pathname.startsWith("/login") && `) trade for unbounded protection against future misuse. Code Examples §2 includes it.

2. **`safeFromPath` location — `app/_components/` or `app/_lib/url.ts`?**
   - What we know: CONTEXT D-36 says "researcher / planner deciden."
   - What's unclear: project's preferred convention for pure-utility modules (we have no precedent yet).
   - **Recommendation:** `app/_components/safeFromPath.ts`. Reason: only consumer is `<AuthGuard>` and `LoginPageInner`, both already import from `app/_components/`. Adding a second underscore directory (`_lib/`) for one 13-line file is over-architected for v1. If the codebase grows enough utilities, refactor later.

3. **Show `user.username` (Cognito sub UUID) on `/app`?**
   - What we know: D-39 lists it as a Claude's-discretion enrichment; the value is a UUID, not user-friendly.
   - What's unclear: whether the user wants to see it for debugging.
   - **Recommendation:** SKIP. UUIDs in user-facing UI are noise. If debug visibility is needed, browser devtools localStorage inspector shows it. Keep the page clean.

4. **Spinner CSS — match the size of the existing "Loading…" text or larger for emphasis?**
   - What we know: D-34 says "spinner + Loading… centered."
   - What's unclear: visual weight.
   - **Recommendation:** `h-8 w-8` (32px) spinner, `text-sm` Loading text. Matches the `<p className="text-sm opacity-70">Loading…</p>` Phase 2 pattern in `app/login/page.tsx` (consistency across the two loading states), small enough not to feel heavy. See Code Examples §2.

5. **Should the planner introduce a custom TS `User` type for `{ name, email }`?**
   - What we know: D-39 leaves it as Claude's discretion.
   - What's unclear: whether future code reuses this shape.
   - **Recommendation:** SKIP. Two `useState<string | undefined>()` declarations are simpler than a custom type. If multiple components later need the same shape, refactor at that point.

## Sources

### Primary (HIGH confidence)

- **Local installed packages** (`node_modules/`):
  - `@aws-amplify/ui-react@6.15.3` — `dist/types/index.d.ts`, `dist/esm/index.mjs`, `dist/esm/components/Authenticator/Authenticator.mjs`
  - `@aws-amplify/ui-react-core` — `dist/types/Authenticator/hooks/useAuthenticator/types.d.ts`, `useAuthenticator.d.ts`, `dist/esm/Authenticator/hooks/useAuthenticator/useAuthenticator.mjs`
  - `@aws-amplify/ui` — `dist/types/helpers/authenticator/facade.d.ts` (definitive `AuthStatus` union)
  - `aws-amplify@6.16.4` — `auth/` subpath; `node_modules/@aws-amplify/auth/dist/esm/providers/cognito/apis/fetchUserAttributes.d.ts`, `types/outputs.d.ts`, `types/models.d.ts`, token storage in `tokenProvider/`
  - `@aws-amplify/core` — `dist/esm/singleton/Auth/types.d.ts` (definitive `AuthStandardAttributeKey` union)
  - `next@16.2.4` — `dist/docs/01-app/03-api-reference/04-functions/{use-search-params,use-pathname,use-router}.md`, `dist/docs/01-app/03-api-reference/03-file-conventions/{layout,page}.md`, `dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- **Repository state:**
  - `package.json` — confirms installed versions
  - `tsconfig.json` — confirms `@/*` path alias to project root + `resolveJsonModule: true`
  - `amplify_outputs.json` — confirms `standard_required_attributes: ["email", "name"]` (the wire-format claim names)
  - `app/AmplifyProvider.tsx`, `app/layout.tsx`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/SignOutButton.tsx` — current source code
- **Upstream phase artifacts:**
  - `.planning/phases/02-email-password-auth-authenticator-ui/02-CONTEXT.md` — D-22..D-28 (Authenticator wiring, redirect-on-authenticated, localStorage walk-back)
  - `.planning/phases/02-email-password-auth-authenticator-ui/02-RESEARCH.md` lines 750–820 — L-3 walk-back (`ssr: true` + adapter-nextjs incompatibility), L-4 (`Authenticator.Provider` requirement), L-7 (`useRouter` from `next/navigation`)
  - `.planning/phases/02-email-password-auth-authenticator-ui/02-05-SUMMARY.md` — final walk-back commit, all D-29 manual flows passed

### Secondary (MEDIUM confidence)

- (none — every fact is sourced from primary)

### Tertiary (LOW confidence)

- (none)

## Metadata

**Confidence breakdown:**
- API signatures (K-1, K-2, K-7, K-8): HIGH — read directly from installed `.d.ts` files
- Next.js 16 patterns (K-3, K-4, K-5, L-5): HIGH — read directly from `node_modules/next/dist/docs/`
- Allowlist design (K-6): HIGH — derived from documented router XSS warning + standard same-origin path semantics
- Phase 2 integration (K-9, K-10): HIGH — Phase 2 already deployed and validated against live Cognito
- Spinner Tailwind classes (G-4): MEDIUM — Tailwind v4 idiomatic but project doesn't have a strict design system yet; Claude's discretion
- File-path locations (G-1, Open Q-2): MEDIUM — convention-by-precedent rather than locked decision

**Research date:** 2026-04-25
**Valid until:** 2026-07-25 (90 days for stable APIs; less if Amplify v6.17+ or Next 17 ship — re-verify).

## RESEARCH COMPLETE

**Phase:** 3 — Protected Route & Auth Guard
**Confidence:** HIGH

### Key Findings (top 5)

1. **Suspense around `useSearchParams` is mandatory in Next 16 production builds** (K-3 / L-1) — the modified `app/login/page.tsx` MUST split into outer `<Suspense>` + inner consumer or `bun run build` fails. Dev mode silently lets you skip this. Code Examples §5 shows the split.
2. **`useAuthenticator` selector pattern verified end-to-end** (K-1 / K-2) — `(ctx) => [ctx.authStatus]` for `<AuthGuard>`, `({ user }) => [user]` for `<AppPage>`, both work because `Authenticator.Provider` is at root from Phase 2. `AuthStatus` union has exactly three values; the three-way switch in `<AuthGuard>` is exhaustive.
3. **`fetchUserAttributes()` returns `Partial<Record<string, string>>` and may throw** (K-7 / L-6) — wrap in `try/catch` inside a one-shot `useEffect` with cancellation flag; render email-only fallback on error; log warning in dev.
4. **`signInDetails.loginId` is the email field** (K-8) — `user?.signInDetails?.loginId` is canonical for email-as-alias pools. `user.username` is the Cognito sub UUID, NOT the email.
5. **`safeFromPath` allowlist is load-bearing for security** (K-6 / L-7) — `router.replace("javascript:…")` will execute. The 13-line helper rejects every dangerous variant (`//`, `javascript:`, `/login` loop, null bytes, backslash variants, length overflow). Verified against the explicit XSS warning in Next 16 router docs.

### File Created

`.planning/phases/03-protected-route-auth-guard/03-RESEARCH.md`

### Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| `useAuthenticator` API | HIGH | Read from `node_modules/@aws-amplify/ui-react-core` types + verified Amplify's own internal usage in `Authenticator.mjs` |
| `AuthStatus` union | HIGH | `node_modules/@aws-amplify/ui/dist/types/helpers/authenticator/facade.d.ts:12` — three values exactly |
| `fetchUserAttributes` | HIGH | `.d.ts` + types resolution chain walked to ground truth |
| Next 16 Suspense rule | HIGH | Local docs explicit; build-time error wording quoted verbatim |
| Layout client-component rules | HIGH | Local docs + cross-reference to error.md metadata constraint |
| `router.replace` semantics | HIGH | Local docs explicit + XSS warning |
| `safeFromPath` design | HIGH | Standard same-origin allowlist; no edge case unaccounted |
| Phase 2 integration assumptions | HIGH | Phase 2 already in production-equivalent (sandbox) and all D-29 flows pass; `<Authenticator.Provider>` is exactly where K-9 says it is |
| Spinner Tailwind CSS | MEDIUM | Tailwind v4 idiomatic but no project design system to ratify |

### Open Questions (for planner)

1. Confirm `<AuthGuard>` defensive `!pathname.startsWith("/login")` check (recommended: yes)
2. Confirm `safeFromPath` location — `app/_components/safeFromPath.ts` (recommended: yes)
3. Skip `user.username` rendering on `/app` (recommended: yes)
4. Spinner sizing `h-8 w-8` + `text-sm` Loading text (recommended)
5. No custom `User` TS type (recommended: skip)

All five are Claude's discretion per CONTEXT — the planner can ratify the recommendations or override them, no re-discussion needed.

### Ready for Planning

Research complete. The planner can now produce PLAN.md files for Phase 3 with:
- Exactly 4 file additions/modifications (`app/_components/safeFromPath.ts`, `app/_components/AuthGuard.tsx`, `app/app/layout.tsx`, modified `app/login/page.tsx`, replaced `app/app/page.tsx`)
- Zero `package.json` changes
- Zero backend changes
- Zero `amplify_outputs.json` regeneration
- Verification = Phase 1 gauntlet + 4 manual walkthroughs (manual-only by user choice — matches Phase 2 D-29 precedent)
