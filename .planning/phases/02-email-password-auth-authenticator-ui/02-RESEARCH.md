# Phase 2: Email/Password Auth + Authenticator UI — Research

**Researched:** 2026-04-25
**Domain:** AWS Amplify Gen 2 `defineAuth` (Cognito) + `<Authenticator>` (`@aws-amplify/ui-react`) wired into Next.js 16 App Router, deployed via the existing per-developer sandbox.
**Confidence:** HIGH for the canonical wiring (verified against installed `@aws-amplify/backend@1.22.0` source, official Amplify docs via Context7, AWS Cognito limits docs, and locally-installed Next.js 16 docs). MEDIUM only on questions tied to Cognito email deliverability in real inboxes (test-driven verification at sandbox time).

## RESEARCH COMPLETE

> Note: the canonical orchestrator handoff is the **`## RESEARCH COMPLETE (orchestrator handoff)`** block at the very bottom of this document.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Auth UI Placement (D-15..D-17)**
- **D-15:** `<Authenticator>` lives in dedicated route `app/login/page.tsx`. Do NOT wrap the entire app — home stays public.
- **D-16:** Home `/` (`app/page.tsx`) stays as-is (default scaffold; product TBD). Phase 2 does not modify home beyond optionally adding a "Sign in" → `/login` link (Claude's discretion).
- **D-17:** Phase 2 creates a minimal placeholder `app/app/page.tsx` (the route is `/app`, inside `app/`) showing "Welcome, {name}" and a Sign-out button. Accessible without guard in Phase 2 (anyone can visit `/app` directly). Phase 4 will add the redirect-if-no-session guard and make the pattern reusable.

**Cognito User Pool (D-18..D-21)**
- **D-18:** `amplify/auth/resource.ts` declares roughly:
  ```typescript
  defineAuth({
    loginWith: { email: true },
    userAttributes: {
      email: { required: true, mutable: false },
      fullname: { required: true, mutable: true },
    },
  });
  ```
  *(researcher must verify exact attribute names + shape — see §1)*
- **D-19:** Email verification **mandatory** at sign-up (Cognito default when email is required). User receives a code by email and must enter it before logging in. `accountRecovery: "EMAIL_ONLY"` for password reset.
- **D-20:** Password policy = Cognito default (≥ 8 chars, upper + lower + digit + symbol). No custom policy.
- **D-21:** Backend wiring in `amplify/backend.ts`:
  ```typescript
  import { defineBackend } from "@aws-amplify/backend";
  import { auth } from "./auth/resource";
  defineBackend({ auth });
  ```
  Replaces the current empty `defineBackend({})`.

**`<Authenticator>` Integration (D-22..D-25)**
- **D-22:** Frontend deps: `aws-amplify` + `@aws-amplify/ui-react`. Researcher decides whether `@aws-amplify/adapter-nextjs` is also required.
- **D-23:** Canonical pattern Amplify Gen 2 + Next.js App Router:
  - Create `app/login/AmplifyProvider.tsx` (client component, `"use client";`) that calls `Amplify.configure(amplify_outputs)` at module-load.
  - `app/login/page.tsx` imports `AmplifyProvider` and renders `<Authenticator>` inside.
  - Import the official CSS `@aws-amplify/ui-react/styles.css` in `app/layout.tsx` or in the provider (researcher verifies).
- **D-24:** AWS default theme (no custom theming v1).
- **D-25:** `<Authenticator>` defaults already cover sign-up + email verification + sign-in + sign-out + reset password. No custom slots in v1.

**Post-Auth Flow (D-26..D-28)**
- **D-26:** After successful sign-in → `router.push("/app")`. Implementation: `useEffect` in `app/login/page.tsx` listening to `useAuthenticator(({ authStatus }) => [authStatus])` and firing redirect when `authStatus === "authenticated"`.
- **D-27:** Sign-out: button in `app/app/page.tsx` calling `signOut()` from `aws-amplify/auth` then `router.push("/")` (back to public home). Visual placement is Claude's discretion.
- **D-28:** Session persistence: Amplify default is localStorage (auto-rehydrates on refresh). No custom storage adapter v1; XSS tradeoff acknowledged. **NOTE — researcher verified this is partially incorrect: when `Amplify.configure(outputs, { ssr: true })` is set (which is required for Next.js per official docs), token storage switches to cookies. See §4 + Gotcha L-3.**

**Validation in Sandbox (D-29)**
- **D-29:** End-to-end validation against `npx ampx sandbox`:
  1. Sign-up with a real email (or `+test1` aliases) → receive code → enter → see "logged in"
  2. Sign-out → re-sign-in with same credentials → succeed
  3. Refresh browser post-sign-in → still logged in
  4. Reset password flow → "Forgot password?" → email code → new password → sign in with new

### Claude's Discretion
- Whether to add a "Sign in" link visible in `app/page.tsx` (sensible: small top-right link).
- Exact layout of `app/login/page.tsx` (centering, max-width).
- Layout/copy of `app/app/page.tsx` placeholder (Phase 4 will refactor anyway).
- Whether to use a route-scoped `app/login/layout.tsx` to mount the provider, or inline the provider in `page.tsx` (researcher recommends below).
- Exact JSON-import syntax for `amplify_outputs.json` (root tsconfig has `resolveJsonModule: true` already).
- When/how to run `npx ampx sandbox` during dev (watch mode vs `--once`).

### Deferred Ideas (OUT OF SCOPE)
- Custom `<Authenticator>` theming
- Rate-limiting / brute-force protection
- "Forgot username" flow
- Custom error UI for auth flows
- Server-side session validation in route handlers (would require `@aws-amplify/adapter-nextjs` — open in Phase 4 or post-MVP)
- Sign-out to a "Goodbye" page
- Custom email verification template / branding
- Custom (stricter) password policy
- Pre-commit hook verifying `amplify_outputs.json` is not committed
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | Cognito User Pool with email + password configured declaratively in `amplify/auth/resource.ts` via `defineAuth({ loginWith: { email: true } })` | §1 (Backend: `amplify/auth/resource.ts`) + §2 (`amplify/backend.ts` wiring) + Code Examples §1/§2 + Validation REQ-AUTH-01 |
| AUTH-03 | `<Authenticator>` from `@aws-amplify/ui-react` integrated in Next.js — sign-up (with email verification), sign-in, sign-out, reset password operational | §3 (deps) + §4 (`Amplify.configure`) + §5 (Authenticator) + §6 (post-auth redirect) + §7 (sign-out) + §8 (CSS) + Code Examples §3..§7 |
| AUTH-05 | Session persists across browser refresh (token storage handled by Amplify) | §4 (`ssr: true` → cookie storage) + Gotcha L-3 + Validation REQ-AUTH-05 |
</phase_requirements>

## Phase Goal Restated

Take the empty `defineBackend({})` from Phase 1, add the first real resource — a Cognito User Pool declared via `defineAuth({ loginWith: { email: true }, userAttributes: { email, fullname }, accountRecovery: "EMAIL_ONLY" })` — and wire the React `<Authenticator>` component into a dedicated `/login` route in the existing Next.js 16 App Router scaffold. Deploy to the same per-developer sandbox stack from Phase 1, prove the four flows (sign-up + email verify, sign-in, sign-out, reset-password) work against live Cognito, prove session survives a browser refresh, and add a placeholder `/app` route that sign-in redirects into. Do **not** introduce server-side auth APIs, route guards, OAuth federation, or any production concerns — those are Phase 3-5.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Cognito User Pool (resource definition) | API / Backend (CDK synthesis) | — | `amplify/auth/resource.ts` is backend-as-code synthesized to CloudFormation by `ampx sandbox`. |
| Cognito User Pool (live) | Database / Storage (managed AWS service) | — | Stack-deployed CloudFormation resource holding user records. |
| Backend wiring (`defineBackend({ auth })`) | API / Backend (CDK synthesis) | — | Pure backend composition; no runtime presence. |
| `Amplify.configure(outputs, { ssr: true })` | Browser / Client | — | Configures the singleton Amplify SDK in the browser; switches token storage to cookies. |
| `AmplifyProvider` (client component) | Browser / Client | — | Single-purpose client module that runs `Amplify.configure` at module-load and mounts `Authenticator.Provider`. |
| `<Authenticator>` UI component | Browser / Client | — | Renders the sign-up / sign-in / forgot-password forms; reads the singleton config. |
| `useAuthenticator` hook + `useEffect` redirect | Browser / Client | — | Subscribes to `authStatus`; triggers `router.push("/app")` from a Client Component. |
| `app/login/page.tsx` route shell | Frontend Server (SSR) | Browser / Client | The page module is an entry point; the actual interactive parts live in client subcomponents. |
| `app/app/page.tsx` placeholder | Frontend Server (SSR) | Browser / Client | Server-rendered shell; sign-out button + welcome text live in a small client subcomponent. |
| `signOut()` (post-click) | Browser / Client | API / Backend (Cognito IDP) | Client SDK call invalidates Cognito session over HTTPS, then `router.push("/")`. |
| Token storage (cookies, with `ssr: true`) | Browser / Client | — | Amplify SDK writes/reads HTTPS cookies; survives refresh. |
| Email verification delivery | API / Backend (Cognito → SES) | External service (recipient inbox) | Cognito's default email sender (or SES) actually transmits. |
| `amplify_outputs.json` (generated) | Repo metadata (gitignored) | — | Build-time static import binding the frontend to backend resource IDs. |

**Sanity check vs CONTEXT.md decisions:** All D-* decisions land on the correct tier above. The redirect (D-26) is correctly Browser/Client (it uses `router.push` which is a Next.js client-side navigation). The User Pool (D-18) is correctly API/Backend (CDK-synthesized) — not Browser/Client.

## Stack & Versions

All Amplify package versions verified via `npm view <pkg> version` against the public registry on 2026-04-25.

### Carry-over from Phase 1 (no change)

| Package | Version | Notes |
|---------|---------|-------|
| next | 16.2.4 | App Router; no upgrade needed [VERIFIED: package.json] |
| react | 19.2.4 | Pinned exact [VERIFIED: package.json] |
| react-dom | 19.2.4 | Pinned exact [VERIFIED: package.json] |
| typescript | ^5 | TS 5.x strict mode [VERIFIED: tsconfig.json] |
| @aws-amplify/backend | ^1.22.0 | `defineAuth`, `defineBackend` [VERIFIED: installed locally] |
| @aws-amplify/backend-cli | ^1.8.2 | `ampx sandbox` [VERIFIED: installed locally] |
| aws-cdk-lib | 2.244.0 | CDK constructs (Cognito, IAM) [VERIFIED: installed locally] |
| Bun | 1.3.5 | Project package manager [VERIFIED: locally available] |

### To install in Phase 2

| Package | Version pin | Where | Why | Source |
|---------|------------|-------|-----|--------|
| `aws-amplify` | `^6.16.4` | `dependencies` | Frontend SDK (`Amplify.configure`, `signIn`, `signOut`, etc.) | [VERIFIED: `npm view aws-amplify version` → 6.16.4, published 2026-04-21] |
| `@aws-amplify/ui-react` | `^6.15.3` | `dependencies` | `<Authenticator>` component + `useAuthenticator` hook | [VERIFIED: `npm view @aws-amplify/ui-react version` → 6.15.3, published 2026-04-21] |

**Peer dependency cross-checks** (verified via `npm view <pkg> peerDependencies`):
- `@aws-amplify/ui-react@6.15.3` peers: `react: ^16.14 || ^17 || ^18 || ^19`, `react-dom: ^16.14 || ^17 || ^18 || ^19`, `aws-amplify: ^6.14.3`, `@aws-amplify/core: *` — **satisfied** by React 19.2.4 + `aws-amplify@^6.16.4`. `@aws-amplify/core` is a transitive of `aws-amplify`; no separate install needed.
- `aws-amplify@6.16.4` itself does **not** peer-depend on React (it's framework-agnostic) — OK.

### Explicitly NOT installed in Phase 2 (deferred)

| Package | Why deferred |
|---------|--------------|
| `@aws-amplify/adapter-nextjs` | Required only when calling Amplify auth APIs **server-side** (Server Components, Route Handlers, middleware). Phase 2 is purely client-side: `<Authenticator>` is a Client Component, `signOut` runs in a Client Component. The route guard (Phase 4) is the natural moment to evaluate whether to use middleware (which requires this adapter) vs a client-side guard (which doesn't). **Defer until Phase 4 makes the call.** [VERIFIED: official docs, [docs.amplify.aws/.../server-side-rendering/](https://docs.amplify.aws/nextjs/build-a-backend/server-side-rendering/) — "To use Amplify APIs server-side, you need to install the Amplify Next.js adapter." Quoted in the WebFetch verification on 2026-04-25.] |

**Bun + `aws-amplify` v6 compatibility:** No known incompatibilities. v6 publishes proper ESM + CJS conditional exports, and Bun handles both. Phase 1 already installed Amplify backend devDeps under Bun without issue. Confidence: HIGH.

**Install command:**
```bash
bun add aws-amplify@^6.16.4 @aws-amplify/ui-react@^6.15.3
```

## Implementation Approach

Step-by-step, file-level + command-level, ordered to allow incremental verification.

### §1 — Backend: `amplify/auth/resource.ts` shape (AUTH-01)

This is the single new backend source file Phase 2 introduces.

**Critical attribute-name finding (verified against installed source code):**

`defineAuth({ userAttributes: { fullname: ... } })` is **correct**. CDK property `fullname` maps to the OpenID Connect / Cognito standard claim name `"name"`. Verified by reading `node_modules/aws-cdk-lib/aws-cognito/lib/private/attr-names.js` (line 1):
```javascript
exports.StandardAttributeNames = { ..., fullname: "name", ... }
```
So:
- In `amplify/auth/resource.ts` → use the property name `fullname` (CDK shape).
- In `amplify_outputs.json` (regenerated by `ampx`) → it appears as `"name"` in the `standard_required_attributes` array.
- In Cognito → the attribute is registered as `"name"`.
- In the `<Authenticator>` UI → since attributes are inferred via "Zero Configuration" from `amplify_outputs.json`, the field auto-renders as a text input labeled "Name". No `signUpAttributes={["name"]}` prop needed.

**Attribute requiredness — what the Amplify defaults already do:**

Verified against `node_modules/@aws-amplify/auth-construct/lib/defaults.js`:
```javascript
IS_REQUIRED_ATTRIBUTE: {
  email: (emailEnabled) => emailEnabled ? { required: true, mutable: true } : undefined,
  ...
}
```
So when `loginWith.email = true`, **email is auto-required and auto-mutable**. The CONTEXT D-18 override `email: { required: true, mutable: false }` is therefore **partially redundant** (`required: true` is already implicit) but **`mutable: false` is meaningful** — it locks the email forever (a sensible decision for a hackathon).

**Default password policy** (`PASSWORD_POLICY` in same file):
```javascript
{ minLength: 8, requireLowercase: true, requireUppercase: true, requireDigits: true, requireSymbols: true }
```
This matches CONTEXT D-20 — no override needed. Just don't set `passwordPolicy` and the defaults apply.

**`accountRecovery` enum values** (verified against `node_modules/aws-cdk-lib/aws-cognito/lib/user-pool.js`):
- `'EMAIL_AND_PHONE_WITHOUT_MFA'`
- `'PHONE_WITHOUT_MFA_AND_EMAIL'`
- `'EMAIL_ONLY'` ← what we want per D-19
- `'PHONE_ONLY_WITHOUT_MFA'`
- `'PHONE_AND_EMAIL'`
- `'NONE'`

**Default verification style is `CODE`** (verified against `node_modules/aws-cdk-lib/aws-cognito/lib/user-pool.js` `verificationMessageConfiguration`: `emailStyle = props.userVerification?.emailStyle ?? VerificationEmailStyle.CODE`). This matches D-19's "code by email" expectation. No `userVerification` prop needed.

**Type imports:** the only import needed is `defineAuth` from `@aws-amplify/backend`. No additional CDK imports — Amplify handles the CDK plumbing.

**Final shape (see Code Examples §1):**
```typescript
import { defineAuth } from "@aws-amplify/backend";

export const auth = defineAuth({
  loginWith: { email: true },
  userAttributes: {
    email: { required: true, mutable: false },
    fullname: { required: true, mutable: true },
  },
  accountRecovery: "EMAIL_ONLY",
});
```

The `name?: string` prop on `AuthProps` (which would generate a friendly resource name) is intentionally omitted — Amplify will pick a stable hash-based name, which is fine for sandbox.

### §2 — Backend: `amplify/backend.ts` wiring (AUTH-01)

Replace the current 8-line file with:
```typescript
import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";

defineBackend({ auth });
```

Order of import doesn't matter (no side effects in `auth/resource.ts` — it just exports the factory). Adding `auth` is the only required change in `backend.ts` for Phase 2; no additional config keys.

When `ampx sandbox` re-runs, this triggers a CloudFormation update on stack `amplify-datathon2026-fernando-sandbox-0d21400c4f` that **adds**:
- A `AWS::Cognito::UserPool` resource
- A `AWS::Cognito::UserPoolClient` resource (the App Client, used by the SDK)
- A `AWS::Cognito::IdentityPool` resource (because `ALLOW_UNAUTHENTICATED_IDENTITIES: true` is the Amplify default — see `defaults.js`)
- IAM roles for authenticated and unauthenticated identities
- (No User Pool Domain — that's only needed for OAuth/Hosted UI, which is Phase 3)

Estimated incremental deploy time: ~2–3 minutes (much smaller than initial CDK Bootstrap; Cognito resources are quick).

### §3 — Frontend deps to install

**One command, two packages:**
```bash
bun add aws-amplify@^6.16.4 @aws-amplify/ui-react@^6.15.3
```

**NOT installed** (per §3 above): `@aws-amplify/adapter-nextjs`. Defer to Phase 4 evaluation.

**Verification:**
```bash
bun pm ls | grep -E "(aws-amplify|@aws-amplify/ui-react)" | head -5
bun run typecheck   # MUST stay green — types fully shipped, no extra @types/* needed
bun run audit       # add to ignore-list if Amplify ecosystem CVEs surface; do NOT remove the existing 24 ignores from Phase 1 plan 03
```

### §4 — Frontend: `Amplify.configure` pattern in Next.js 16 App Router (AUTH-05)

**Critical finding — `ssr: true` is REQUIRED for Next.js, even in client-only setups.**

[CITED: [docs.amplify.aws — Configure Amplify in Next.js > Configure Amplify for client-side usage](https://docs.amplify.aws/nextjs/build-a-backend/server-side-rendering/)] Quoted from official docs (verified via WebFetch on 2026-04-25):
> "When using Amplify APIs on the client-side of a Next.js app, you must call Amplify.configure with the ssr option set to true. This configuration is essential for storing authentication tokens in browser cookies, which are then transmitted to the Next.js server for authentication purposes."

**This contradicts CONTEXT D-28.** D-28 assumes localStorage. With `ssr: true`, Amplify stores tokens in **cookies** (not HttpOnly by default — they need to be readable by client JS for the SDK to function). This is documented behavior; the security profile vs localStorage is roughly equivalent (both vulnerable to XSS), but the storage mechanism is cookies. **Recommendation: still use `ssr: true`** because (a) it is what the official docs prescribe for Next.js, (b) it is required if Phase 4 ever adds even a single server-side API call, (c) the XSS tradeoff acknowledged in D-28 still applies. **Update D-28 wording during phase wrap-up.**

**Canonical pattern for App Router** (verified via Context7 `/aws-amplify/docs`):
The Amplify config call must run **at module-load time on the client**, before any component that depends on the singleton renders. In App Router, this means a small client-component module:

```tsx
// app/login/AmplifyProvider.tsx
"use client";

import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs, { ssr: true });

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  return <Authenticator.Provider>{children}</Authenticator.Provider>;
}
```

Two things happen here:
1. `Amplify.configure(...)` runs once at module-load (top-level statement).
2. The exported `AmplifyProvider` component wraps children in `Authenticator.Provider`, which is the React Context that backs `useAuthenticator(...)`. Wrapping with `Authenticator.Provider` is **required** if you want to call `useAuthenticator(...)` from a sibling/descendant of `<Authenticator>` rather than from inside its render-prop. CONTEXT D-26 wants exactly that pattern (a `useEffect` in `page.tsx` that reads `authStatus` and triggers `router.push`), so the provider wrapper is necessary. [VERIFIED via Context7 `/aws-amplify/amplify-ui` docs: "wrap your application inside an Authenticator.Provider to make the useAuthenticator hook available. This is necessary if you need to use the hook outside the direct scope of the Authenticator UI component."]

**JSON import:** `import outputs from "@/amplify_outputs.json";` works directly because:
- Root `tsconfig.json` already has `resolveJsonModule: true` and the `@/*` alias mapping to `./*`.
- Next.js 16 docs use plain JSON imports without `with { type: "json" }` attributes — verified in `node_modules/next/dist/docs/01-app/02-guides/redirecting.md` lines 438, 489, 537, 565, 594, 621.
- `amplify_outputs.json` is at the **project root** (verified locally — file exists at `/home/fernando/Documents/datathon-2026/amplify_outputs.json`).

**Where to put the provider** — there are three viable shapes:

| Shape | Description | Recommendation |
|-------|-------------|----------------|
| A. Provider in `app/layout.tsx` (root) | Wraps **every** page in `Authenticator.Provider` and runs `Amplify.configure` for everyone | Overkill for Phase 2 — home and `/app` don't need the provider. Keeps the config global, which we'll need eventually but not yet. |
| B. Provider in `app/login/layout.tsx` (route-segment) | Wraps `/login` only | **Recommended for Phase 2.** Clean scoping, idiomatic App Router. Phase 4 can promote it to root layout when adding the guard. |
| C. Provider directly in `app/login/page.tsx` | Inline at the top of the page | Works, but mixes provider + page concerns. Slightly less clean. |

**Recommendation: shape B.** Create `app/login/layout.tsx` that imports `AmplifyProvider` and wraps `{children}`. This way the page itself stays focused on rendering the UI + the redirect logic.

### §5 — Frontend: `<Authenticator>` integration in `app/login/page.tsx` (AUTH-03)

```tsx
// app/login/layout.tsx (Server Component allowed — provider is the client subcomponent)
import { AmplifyProvider } from "./AmplifyProvider";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <AmplifyProvider>{children}</AmplifyProvider>;
}
```

```tsx
// app/login/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";

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
      {authStatus === "configuring" && <p>Loading…</p>}
      {authStatus !== "authenticated" && <Authenticator />}
    </main>
  );
}
```

**Why no props on `<Authenticator>`:** Per the Amplify UI docs (verified via Context7 `/aws-amplify/amplify-ui` — "Customize Sign Up Form Fields"), attributes are inferred via **Zero Configuration** from `amplify_outputs.json`. Our backend declares `email` (required) + `name` (the OIDC claim name CDK calls `fullname`, required), so the sign-up form auto-renders email + name + password + confirm-password. No `signUpAttributes`, no `formFields`, no `loginMechanisms` props needed. The "Forgot password?" link and the sign-up tab are present by default — verified by the docs example in §5 which shows a bare `<Authenticator />` covering all four flows.

**Why `Authenticator.Provider` is in the layout (not the page):** because `useAuthenticator` is called from `LoginPage` itself (to drive the redirect), and `useAuthenticator` requires either being inside `<Authenticator>`'s render-prop **or** being inside an `Authenticator.Provider`. We want the redirect logic to live alongside the page, not inside the Authenticator's children, so the provider wrap is mandatory.

### §6 — Frontend: post-auth redirect with `useAuthenticator` (AUTH-03)

The pattern in §5 is the canonical one. Three subtle points:

1. **Selector form `(context) => [context.authStatus]`** — this is the documented way to limit re-renders. Without it, `useAuthenticator()` triggers a re-render on **every** context change (every keystroke in the form, every step of the flow). [VERIFIED via Context7 `/aws-amplify/amplify-ui` docs: "Optimize performance by passing a selector function to useAuthenticator. This ensures re-renders only occur when specific context values, like 'user', change."]

2. **`authStatus` values:** `"configuring" | "authenticated" | "unauthenticated"`. The `"configuring"` state is **transient** — it only appears during the initial mount while Amplify is rehydrating tokens from cookies. Render a tiny loading state for it (per the snippet above). [VERIFIED via Context7 `/aws-amplify/amplify-ui` docs: "The configuring state is transient and only appears during initial loading."]

3. **`router.push` vs `router.replace`** — `push` adds `/login` to history; `replace` doesn't. Either is acceptable for Phase 2; `push` is what CONTEXT D-26 specifies. Phase 4 may revisit if "back" button reaching `/login` after sign-in becomes annoying.

**Race condition / hydration concerns:** the page is fully client-rendered (`"use client"`), so there's no server/client mismatch on `authStatus`. The `useEffect` ensures `router.push` is called only after mount + after `authStatus` settles. No `flushSync` or `startTransition` needed in v1.

### §7 — Frontend: `app/app/page.tsx` placeholder + sign-out button (D-17, D-27)

The route segment `/app` (a directory `app/app/`) — this is the **only** Phase 2 route besides `/login`. Phase 4 will add the auth guard.

Two viable shapes:

```tsx
// app/app/page.tsx (Server Component shell)
import { SignOutButton } from "./SignOutButton";

export default function AppPlaceholder() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <p className="text-sm opacity-70">
        This is the placeholder app shell. Phase 4 will add the auth guard.
      </p>
      <SignOutButton />
    </main>
  );
}
```

```tsx
// app/app/SignOutButton.tsx (Client Component)
"use client";

import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";

export function SignOutButton() {
  const router = useRouter();

  async function handleClick() {
    await signOut();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-md border border-foreground/20 px-4 py-2 text-sm hover:bg-foreground/5"
    >
      Sign out
    </button>
  );
}
```

**Important notes about this shape:**

a. **`signOut` import path** — `"aws-amplify/auth"` (the v6 subpath). [VERIFIED via Context7 `/aws-amplify/amplify-js` docs and via WebFetch on the official `amplify-js` repo.] The legacy `import { Auth } from "aws-amplify"` form is **gone** in v6.

b. **Why use `signOut()` from `aws-amplify/auth` instead of the `signOut` returned by `useAuthenticator()`?** Both work and are equivalent. Using the SDK directly **does not** require `Authenticator.Provider` to be in the tree, which means `app/app/` does not need its own `AmplifyProvider` wrapper for sign-out. **However**, `Amplify.configure(...)` MUST have run before `signOut` is called, and Phase 2's `AmplifyProvider` only runs in `/login`. **Therefore `app/app/page.tsx` must also have an `AmplifyProvider` (or equivalent `Amplify.configure` call) in its layout, or the user reaching `/app` via post-auth redirect will see `signOut()` throw a "no auth config" error.** Solution: hoist `AmplifyProvider` to a shared spot — easiest is a route-group or just putting an identical `app/app/layout.tsx` that imports the same `AmplifyProvider`. **Recommendation: put `AmplifyProvider` in `app/layout.tsx` (root) once Phase 2 ships, OR replicate the layout for `/app`.** See §11 Gotcha L-2 — this is an easy thing to forget.

   **Cleanest Phase 2 shape:** create `app/(amplify)/layout.tsx` route group OR move `AmplifyProvider` to root. Given Phase 4 will add a guard in root layout anyway, **promoting `AmplifyProvider` to `app/layout.tsx` from day one is the simplest path** and eliminates the duplication risk.

   **Revised recommendation:** mount `AmplifyProvider` in `app/layout.tsx` (root). Wraps every page in `Authenticator.Provider` and runs `Amplify.configure` once. Cost: minimal (the home page incurs a small client-bundle increase, but `aws-amplify` is already shared across `/login` and `/app`, so the bundle hit is one-time across the whole app). Benefit: one wiring point, no surprises.

c. **`useRouter` is from `next/navigation`** in App Router (NOT `next/router`, which is Pages Router). [VERIFIED: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md` line 13 — `import { useRouter } from "next/navigation"`.]

d. **`signOut()` returns a Promise** — must be awaited or `.then`-chained before `router.push` to ensure the cookie is cleared before navigation. The snippet above does this correctly.

### §8 — CSS: where to import `@aws-amplify/ui-react/styles.css`

Two options:

| Option | Where | Pros | Cons |
|--------|-------|------|------|
| A | `app/layout.tsx` (root) | Single global import; works everywhere | Loaded even on routes that don't use Amplify UI |
| B | `app/login/AmplifyProvider.tsx` (component-level) | Scoped to where it's needed | If we add another consumer, easy to forget |

**Recommendation: Option A (root layout).** Tailwind v4 + Amplify CSS coexist fine (Amplify uses scoped class names like `.amplify-button`); zero conflict risk. With `AmplifyProvider` already promoted to root (per §7 revised recommendation), the CSS import naturally lives there too. Cost: ~30KB gzip on every page. For a hackathon scaffold, acceptable.

```tsx
// app/layout.tsx — diff
import "./globals.css";
+import "@aws-amplify/ui-react/styles.css";
+import { AmplifyProvider } from "./AmplifyProvider";
// (move AmplifyProvider.tsx from app/login/ to app/ when promoting to root)
```

**Alternative if user prefers strict scoping:** keep both `AmplifyProvider` and the CSS import in `app/login/AmplifyProvider.tsx`, AND add a similar layout for `app/app/`. More duplication, slightly less efficient.

### §9 — Sandbox redeploy + verification commands

**Pre-flight check** — sandbox stack from Phase 1 should still exist (or be redeployable):
```bash
aws cloudformation describe-stacks \
  --stack-name amplify-datathon2026-fernando-sandbox-0d21400c4f \
  --profile aws-cli-amplify --region us-east-1 \
  --query 'Stacks[0].StackStatus' --output text
# Expected: CREATE_COMPLETE or UPDATE_COMPLETE
```
If the user tore the sandbox down (per Plan 01-05 "Next steps" optional teardown), `npx ampx sandbox --once` will re-create it.

**Redeploy with the new auth resource:**
```bash
AWS_PROFILE=aws-cli-amplify AWS_REGION=us-east-1 \
  npx ampx sandbox --once --profile aws-cli-amplify
```
Expected outcome:
- CloudFormation `UPDATE_IN_PROGRESS` → `UPDATE_COMPLETE` (~2-3 min for first auth resource).
- `amplify_outputs.json` is regenerated; size grows from ~22 bytes to ~1-2 KB and now contains an `auth` block (see "amplify_outputs.json shape" below).
- `git status` shows `amplify_outputs.json` as modified BUT it's gitignored (`.gitignore:46:amplify_outputs*`), so it should NOT show up. Verified locally: `git check-ignore -v amplify_outputs.json` → matches `.gitignore:46`.

**Post-deploy verification of the User Pool exists in AWS:**
```bash
aws cognito-idp list-user-pools --max-results 10 \
  --profile aws-cli-amplify --region us-east-1 \
  --query 'UserPools[?contains(Name, `amplify-datathon2026-fernando`)]'
```

**Local-only checks (every commit / wave):**
```bash
bun run lint      # eslint . --max-warnings=0
bun run typecheck # tsc --noEmit
bun run build     # next build (verifies the JSON import + client/server boundaries compile)
bun run audit     # bun audit with the existing ignore-list
```

**`amplify_outputs.json` shape after Phase 2 deploy** [CITED: docs.amplify.aws — "Retrieve Auth Domain from amplify_outputs.json" + "Amplify Outputs for Existing Cognito Resources"]:
```json
{
  "version": "1.4",
  "auth": {
    "aws_region": "us-east-1",
    "user_pool_id": "us-east-1_<hash>",
    "user_pool_client_id": "<hash>",
    "identity_pool_id": "us-east-1:<uuid>",
    "username_attributes": ["email"],
    "standard_required_attributes": ["email", "name"],
    "user_verification_types": ["email"],
    "unauthenticated_identities_enabled": true,
    "mfa_methods": [],
    "mfa_configuration": "OFF",
    "password_policy": {
      "min_length": 8,
      "require_lowercase": true,
      "require_uppercase": true,
      "require_numbers": true,
      "require_symbols": true
    }
  }
}
```
The `name` (= `fullname` in CDK) appearing in `standard_required_attributes` is what triggers the `<Authenticator>` Zero Configuration to render the Name field.

## Validation Architecture

**Validation framework:** same shell-driven smoke pattern as Phase 1 (no test framework introduced in Phase 2). All validation reduces to `bash` commands with deterministic exit codes plus four manual flow runs (per CONTEXT D-29) that require a real email inbox.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Shell smoke + manual browser session against live sandbox |
| Config file | none (uses `package.json` scripts) |
| Quick run command | `bun run lint && bun run typecheck` (~10s; no AWS/network) |
| Full suite command | Quick + `bun run build` + `bun run audit` + `npx ampx sandbox --once --profile aws-cli-amplify` (~3-4 min including deploy) |
| Phase gate | All quick + full commands exit 0; CloudFormation stack `UPDATE_COMPLETE`; D-29 manual flows all four pass |

### Phase Requirements → Validation Map

| Req ID | Behavior | Test Type | Automated Command | Existence |
|--------|----------|-----------|-------------------|-----------|
| AUTH-01 | `amplify/auth/resource.ts` exists with email + fullname + EMAIL_ONLY | smoke | `test -f amplify/auth/resource.ts && grep -q 'defineAuth' amplify/auth/resource.ts && grep -q '"EMAIL_ONLY"' amplify/auth/resource.ts && grep -q 'fullname' amplify/auth/resource.ts` | ✅ |
| AUTH-01 | `amplify/backend.ts` wires `auth` | smoke | `grep -q 'defineBackend({ auth })' amplify/backend.ts && grep -q "from \"./auth/resource\"" amplify/backend.ts` | ✅ |
| AUTH-01 | Backend TypeScript valid | smoke | `cd amplify && npx tsc --noEmit` | ✅ |
| AUTH-01 | Sandbox redeploys cleanly with auth resource | integration (requires AWS) | `AWS_PROFILE=aws-cli-amplify npx ampx sandbox --once --profile aws-cli-amplify` (exit 0) | ⚠ requires AWS account |
| AUTH-01 | Cognito User Pool exists in AWS | integration | `aws cognito-idp list-user-pools --max-results 10 --profile aws-cli-amplify --region us-east-1 --query 'UserPools[?contains(Name, \`amplify-datathon2026-fernando\`)] \| length(@)' --output text` (must be ≥ 1) | ⚠ requires AWS account |
| AUTH-01 | `amplify_outputs.json` populated with auth block | smoke | `node -e "const o=require('./amplify_outputs.json'); process.exit(o.auth?.user_pool_id ? 0 : 1)"` | ✅ (after deploy) |
| AUTH-03 | `app/login/page.tsx` exists and uses `<Authenticator>` | smoke | `test -f app/login/page.tsx && grep -q '<Authenticator' app/login/page.tsx` | ✅ |
| AUTH-03 | `AmplifyProvider` exists and configures Amplify with ssr:true | smoke | `grep -rq 'Amplify.configure' app/ && grep -rq 'ssr: true' app/ && grep -rq 'Authenticator.Provider' app/` | ✅ |
| AUTH-03 | `app/app/page.tsx` placeholder exists with sign-out | smoke | `test -f app/app/page.tsx && grep -rq 'signOut' app/app/` | ✅ |
| AUTH-03 | `@aws-amplify/ui-react/styles.css` imported | smoke | `grep -rq "@aws-amplify/ui-react/styles.css" app/` | ✅ |
| AUTH-03 | `aws-amplify` and `@aws-amplify/ui-react` installed in dependencies | smoke | `node -e "const p=require('./package.json'); process.exit(p.dependencies['aws-amplify'] && p.dependencies['@aws-amplify/ui-react'] ? 0 : 1)"` | ✅ |
| AUTH-03 (manual D-29 #1) | Sign-up + email verify + sign-in flow works end-to-end | manual | open `/login`, sign up with `<dev-email>+phase2-test1@…`, receive code, enter, see redirect to `/app` | manual run against live sandbox |
| AUTH-03 (manual D-29 #4) | Reset password flow works | manual | "Forgot password?" link → enter email → receive code → set new password → sign in with new | manual run against live sandbox |
| AUTH-05 (manual D-29 #2) | Sign-out then re-sign-in succeeds | manual | from `/app` click Sign out → land on `/`, navigate to `/login`, sign in → land on `/app` | manual run |
| AUTH-05 (manual D-29 #3) | Refresh post-sign-in stays logged in | manual | post-sign-in browser refresh on `/app` does NOT redirect to `/login`; user data still present | manual run (validates cookie storage) |
| Repo gates carried from Phase 1 | All four quick checks green | smoke | `bun run lint && bun run typecheck && bun run build && bun run audit` | ✅ |

### Sampling Rate

- **Per task commit:** `bun run lint && bun run typecheck` (~10s; no network).
- **Per wave merge:** Quick + `bun run build` (~30-60s).
- **Phase gate:** Full suite + sandbox deploy + four manual flows (~10-15 min total wall-clock including manual browser session).

### Wave 0 Gaps

- [ ] None — all automated checks rely on tools already present (Bun, Node, npx, AWS CLI from Phase 1). No fixtures or test framework to author.
- [ ] **Manual flow execution requires** a real email inbox accessible to the developer (their own email or `+test1`/`+test2` aliases). **Plan must list this as a precondition** for the manual-validation wave.
- [ ] **Cognito email deliverability** — the verification email comes from `no-reply@verificationemail.com` by default (see Gotcha L-5) and may land in spam. Plan should warn the developer to check spam folder.

## Runtime State Inventory

> Phase 2 is a green-field addition (first auth resource ever; no existing User Pool, no existing users). However, Phase 1 left **live AWS state** (the empty sandbox stack) that Phase 2 must update — this counts as a CloudFormation update with side-effects.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no existing Cognito User Pool, no existing user records, no existing tokens. The Phase 1 stack contains only Amplify management resources. | None — Phase 2 creates the User Pool fresh. |
| Live service config | The empty sandbox CloudFormation stack `amplify-datathon2026-fernando-sandbox-0d21400c4f` (us-east-1, account 992839645871) exists. Phase 2's `npx ampx sandbox` issues a CloudFormation `UpdateStack` that adds Cognito + Identity Pool + IAM roles. | Verify the stack is in a deployable state before Phase 2 first deploy: `aws cloudformation describe-stacks ... --query 'Stacks[0].StackStatus'` should return `*_COMPLETE` (not `*_IN_PROGRESS` or `*_FAILED`). If the user ran the optional teardown from Plan 01-05's "Next steps", the stack will not exist and `npx ampx sandbox --once` will re-create it (slightly slower but identical end state). |
| OS-registered state | None — no scheduled tasks, services, or daemons. | None. |
| Secrets / env vars | None new. `AWS_PROFILE=aws-cli-amplify` and `AWS_REGION=us-east-1` already in `.env.local` from Phase 1. **No Cognito-specific secrets in Phase 2** — the User Pool ID and App Client ID are public values (they appear in `amplify_outputs.json`). Real OAuth secrets (Google `client_secret`) come in Phase 3 via `npx ampx sandbox secret set`. | None — `.env.local` and `~/.aws/credentials` carry over from Phase 1 unchanged. |
| Build artifacts / installed packages | `node_modules/` will gain `aws-amplify` + `@aws-amplify/ui-react` + their transitives (notable: `@aws-amplify/core`, `@aws-amplify/auth`, `@aws-amplify/ui`, plus the React component runtime). **`bun install` MUST be run after `bun add`** — this is normally automatic but worth defensively re-running at wave end. | `bun install` after `bun add aws-amplify@^6.16.4 @aws-amplify/ui-react@^6.15.3` to materialize the new tree. `bun audit` may surface new transitive CVEs in the Amplify v6 dependency tree — if so, extend the existing ignore-list in `package.json` `audit` script (the precedent was set in Phase 1 plan 03 with 24 ignores). |

**Verified by:** `aws cloudformation list-stacks --status-filter CREATE_COMPLETE UPDATE_COMPLETE --profile aws-cli-amplify --region us-east-1` (run pre-research) shows the Phase 1 stack alive; `cat /home/fernando/Documents/datathon-2026/amplify_outputs.json` returns `{"version": "1.4"}` (the empty-backend baseline).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js (≥20.6) | `ampx`, Bun, Next | ✓ | 20.20.0 | — |
| Bun (≥1.3) | Project package mgmt | ✓ | 1.3.5 | — |
| `npx` | Run `ampx sandbox` | ✓ | 10.8.2 (npm bundled) | — |
| AWS CLI v2 | `aws cognito-idp list-user-pools` verification | ✓ | 2.34.37 (verified post-Phase-1) | — |
| AWS profile `aws-cli-amplify` | Sandbox deploy + verification | ✓ | Account 992839645871, us-east-1 | — |
| Existing CloudFormation stack `amplify-datathon2026-fernando-sandbox-0d21400c4f` | Incremental update path | ✓ (or recreatable) | UPDATE_COMPLETE state expected | If torn down: `npx ampx sandbox --once` recreates from scratch (~3-5 min for fresh deploy with auth resource) |
| CDK Bootstrap (`CDKToolkit` stack) | Required for any sandbox deploy | ✓ (one-time, done in Phase 1) | us-east-1 only | — |
| Real email inbox for D-29 manual flows | Sign-up email verification + reset password | ✓ (developer's email + plus-aliases) | — | Could use a temporary mailbox service (mailinator, etc.) but author's own email + `+phase2-test1` aliases is simplest |
| Browser (Chrome/Firefox/Safari) | Manual browser session for D-29 | ✓ (assumed) | — | — |

**Missing dependencies, no fallback:** none.

**Missing dependencies, with fallback:** none.

**Implication for the planner:** all automated checks are runnable in the standard executor environment. The four manual D-29 flows require a human at a browser with email access — these are explicit human-handoff steps, ideally batched at the end of the phase rather than interleaved.

## Code Examples

Verified, copy-pasteable, double-quote style (per Phase 1 PATTERNS).

### §1 Backend: `amplify/auth/resource.ts`
```typescript
import { defineAuth } from "@aws-amplify/backend";

/**
 * Phase 2 — first backend resource on top of the Phase 1 skeleton.
 * Cognito User Pool with email + password sign-in, mandatory email verification,
 * and email-based password reset. Default password policy (min 8, upper+lower+digit+symbol).
 *
 * Attribute name note: the CDK property `fullname` maps to the Cognito/OIDC standard
 * claim `"name"`. The <Authenticator> picks this up via Zero Configuration from
 * amplify_outputs.json and auto-renders a "Name" field in the sign-up form.
 *
 * @see https://docs.amplify.aws/react/build-a-backend/auth/
 */
export const auth = defineAuth({
  loginWith: { email: true },
  userAttributes: {
    email: { required: true, mutable: false },
    fullname: { required: true, mutable: true },
  },
  accountRecovery: "EMAIL_ONLY",
});
```
**Source:** [VERIFIED] shape conforms to `AmplifyAuthProps` in `node_modules/@aws-amplify/backend-auth/lib/factory.d.ts` and `AuthProps` / `StandardAttributes` in `node_modules/@aws-amplify/auth-construct/lib/types.d.ts`. `accountRecovery: "EMAIL_ONLY"` is a `keyof typeof cognito.AccountRecovery` per the type signature; enum members verified in `node_modules/aws-cdk-lib/aws-cognito/lib/user-pool.js`.

### §2 Backend: `amplify/backend.ts`
```typescript
import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";

defineBackend({ auth });
```
**Source:** [VERIFIED] shape from Amplify Gen 2 docs ([docs.amplify.aws/nextjs/build-a-backend/](https://docs.amplify.aws/nextjs/build-a-backend/)) and consistent with the Phase 1 trajectory note in 01-RESEARCH.md §"Code Examples › Adding a resource later".

### §3 Frontend: `app/AmplifyProvider.tsx` (root, recommended placement per §7/§8)
```tsx
"use client";

import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs, { ssr: true });

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  return <Authenticator.Provider>{children}</Authenticator.Provider>;
}
```
**Source:** [VERIFIED via Context7 `/aws-amplify/docs`] "Configure Amplify Client Component for App Router" + "Configure Amplify in Next.js > Configure Amplify for client-side usage" + Context7 `/aws-amplify/amplify-ui` "Authenticator Provider Setup".

### §4 Frontend: `app/layout.tsx` (modified to mount provider + CSS)
```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AmplifyProvider } from "./AmplifyProvider";
import "./globals.css";
import "@aws-amplify/ui-react/styles.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "datathon-2026",
  description: "Datathon 2026 base app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AmplifyProvider>{children}</AmplifyProvider>
      </body>
    </html>
  );
}
```
**Note on Geist fonts:** the existing root layout already imports Geist via `next/font/google`. Plan should preserve whatever the current layout looks like and just add the two new lines (the import + the wrap). The snippet above is illustrative.

### §5 Frontend: `app/login/page.tsx`
```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";

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
**Source:** [VERIFIED via Context7 `/aws-amplify/amplify-ui`] "Check Authentication Status" + "Prevent Re-renders with useAuthenticator Selector"; cross-verified via WebFetch on ui.docs.amplify.aws on 2026-04-25.

### §6 Frontend: `app/app/page.tsx` (Server Component shell)
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

### §7 Frontend: `app/app/SignOutButton.tsx` (Client Component)
```tsx
"use client";

import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";

export function SignOutButton() {
  const router = useRouter();

  async function handleClick() {
    await signOut();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-md border border-foreground/20 px-4 py-2 text-sm hover:bg-foreground/5"
    >
      Sign out
    </button>
  );
}
```
**Source:** [VERIFIED via Context7 `/aws-amplify/amplify-js`] "Sign Out User with signOut" — confirms the v6 subpath import `from "aws-amplify/auth"` and the `await signOut()` shape.

## Gotchas & Landmines

Specific to Amplify Gen 2 v1.22 + `aws-amplify` v6.16 + `@aws-amplify/ui-react` v6.15 + Next.js 16.2 + Bun.

### L-1. Cognito attribute naming: CDK `fullname` vs OIDC `name`
[VERIFIED — see §1.] `defineAuth({ userAttributes: { fullname: ... } })` is correct CDK syntax, but the wire-format Cognito attribute name is `"name"` (the OpenID Connect standard claim). This shows up in `amplify_outputs.json` `standard_required_attributes` as `"name"`. **If the planner writes `name` instead of `fullname` in the CDK call, the build will fail with a TypeScript error** ("Object literal may only specify known properties"). **If the planner adds `signUpAttributes={["fullname"]}` to `<Authenticator>`, Amplify UI won't recognize it** — the prop expects OIDC names. Don't pass `signUpAttributes` at all in v1; let Zero Configuration handle it.

### L-2. `Amplify.configure` MUST run before any auth call — including `signOut`
The `signOut()` call in `app/app/SignOutButton.tsx` will throw with a confusing error if `Amplify.configure(...)` has not been executed in the current bundle. **Symptoms:** runtime error along the lines of `"Auth UserPool not configured"` or `"AuthTokenConfigException"`. **Root cause:** `app/app/page.tsx` was reached without going through `app/login/AmplifyProvider.tsx` (e.g., user typed `/app` in the URL bar directly). **Mitigation:** mount `AmplifyProvider` in **`app/layout.tsx`** (root) so every route in the app inherits the configured singleton — see §7/§8 recommendation. Alternative: replicate the provider in `app/app/layout.tsx`.

### L-3. `ssr: true` switches token storage from localStorage to cookies — D-28 must be updated
[CITED: docs.amplify.aws — "Configure Amplify in Next.js > Configure Amplify for client-side usage"] Quoted: "Amplify.configure with the ssr option set to true. This configuration is essential for storing authentication tokens in browser cookies, which are then transmitted to the Next.js server for authentication purposes." **CONTEXT D-28 says "Amplify default is localStorage" — this is true ONLY when `ssr` is NOT set.** With Next.js the docs prescribe `ssr: true` for client-side use, so the actual storage is cookies. The XSS tradeoff acknowledged in D-28 still applies (cookies aren't HttpOnly here either). **Plan must update CONTEXT/STATE wording during phase wrap-up; meanwhile, the manual D-29 #3 refresh-keeps-session test still validates AUTH-05 the same way (cookies survive refresh just like localStorage would).**

### L-4. `useAuthenticator` requires `Authenticator.Provider` when called outside `<Authenticator>`'s render-prop
If the planner skips the `Authenticator.Provider` wrap and tries `useAuthenticator(...)` from `app/login/page.tsx` directly, React throws an "invalid hook" / "hook called outside provider" error at runtime. **Mitigation:** the `AmplifyProvider` snippet in §3 explicitly wraps children in `<Authenticator.Provider>`. Don't remove it.

### L-5. Cognito default email sender goes to spam, and only 50 emails/day
[CITED: [docs.aws.amazon.com — Cognito User Pool email](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-email.html) and [Cognito quotas](https://docs.aws.amazon.com/cognito/latest/developerguide/limits.html)] **Default FROM address:** `no-reply@verificationemail.com` — a Cognito-owned domain frequently classified as spam by Gmail / Outlook / iCloud. **Quota:** 50 emails per day per AWS account when using the default (non-SES) sender. **Implication for D-29 manual flows:**
   - The verification email may land in **spam** — plan must instruct the dev to check spam folder if the inbox is empty.
   - At 50 emails/day, the dev can run sign-up + reset-password ~25 times per day before Cognito starts rejecting send requests — plenty for hackathon dev, but worth knowing.
   - A **production move** to SES (configured via `senders.email.fromEmail` in `defineAuth`) is deferred (Phase 5 / post-MVP), explicitly out of Phase 2 scope per CONTEXT Deferred Ideas.

### L-6. `signUpAttributes` prop is unnecessary — Zero Configuration handles it
[VERIFIED via Context7 `/aws-amplify/amplify-ui`] "Adding the signUpAttributes prop is typically not needed since attributes are inferred via Zero Configuration." Since Phase 2's `defineAuth` declares `email` (required) and `fullname` (required → Cognito `name`), the Authenticator auto-renders email + name + password + confirm-password fields in the sign-up tab. **Don't pass `signUpAttributes` — it can override Zero Configuration and cause confusion.**

### L-7. `useRouter` from `next/navigation`, NOT `next/router`
[VERIFIED: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md`] In App Router, `import { useRouter } from "next/navigation"`. The legacy `next/router` is Pages-Router only and will silently misbehave or throw if used. **Easy mistake when Claude pulls patterns from training data.**

### L-8. `amplify_outputs.json` import path — root, not `amplify/`
[VERIFIED — see Phase 1 RESEARCH G-8.] The file is at the **project root**, not under `amplify/`. The `@/*` path alias maps to project root, so `import outputs from "@/amplify_outputs.json"` works. Relative paths like `import outputs from "../../amplify_outputs.json"` also work but are fragile. **Use `@/amplify_outputs.json`.**

### L-9. `amplify_outputs.json` is gitignored (and SHOULD stay that way)
[VERIFIED — `.gitignore:46`] After Phase 2 deploy, the file grows from `{"version":"1.4"}` to ~1KB with a real `auth` block. **It is still gitignored; don't be tempted to commit it** because (a) it leaks the User Pool ID + Client ID + Identity Pool ID (these are technically not secrets but commit-pollution), (b) every dev's sandbox produces different IDs, (c) production uses different IDs again. The CI build (Phase 5) regenerates the file via `npx ampx pipeline-deploy`.

### L-10. CSS `@aws-amplify/ui-react/styles.css` — without it, the Authenticator renders un-styled
[CITED: Amplify UI docs] The component's design depends on the bundled CSS. Without it, the form is functional but visually broken (no card, no padding, default browser inputs). Plan-checker should grep for the CSS import.

### L-11. Tailwind v4 + Amplify CSS — coexistence is fine
The Amplify CSS uses scoped class names prefixed `.amplify-*` and `[data-amplify-*]` selectors. Tailwind v4's utility classes don't collide. **No special configuration needed in `globals.css` or `postcss.config.mjs`.** Confirmed by inspecting Amplify UI's stylesheet selectors (it's scoped CSS, not a Tailwind plugin).

### L-12. Sandbox redeploy — the existing stack from Phase 1 receives an UPDATE, not a CREATE
The Phase 1 sandbox stack `amplify-datathon2026-fernando-sandbox-0d21400c4f` is alive. Phase 2's `npx ampx sandbox --once` runs CloudFormation `UpdateStack`, adding the Cognito User Pool + App Client + Identity Pool + IAM roles. **Watch for `UPDATE_ROLLBACK_COMPLETE`** if anything fails during update — this means CloudFormation reverted to the pre-Phase-2 state, leaving the empty stack from Phase 1. The error message in the `ampx sandbox` output is usually clear; the AWS Console "Stack events" tab is the source of truth.

### L-13. Bun + Amplify v6 — known-good pairing
No documented incompatibilities. Phase 1 already installed Amplify backend + CDK packages under Bun without issue. `aws-amplify` and `@aws-amplify/ui-react` are pure ESM/CJS dual packages with no native binaries → no `trustedDependencies` adjustments needed in `package.json`. Confidence HIGH.

### L-14. `signOut()` is async — must await before navigating
If the planner writes `signOut(); router.push("/")` (no `await`), the cookie may not be cleared by the time the new page loads, and `Amplify.configure` may still resolve a valid session on the next mount. **The snippet in §7 awaits correctly — preserve that.**

### L-15. Don't add `--max-warnings=0` clean-bypass for new lint rules
[CARRIED FROM PHASE 1] The `lint` script is `eslint . --max-warnings=0`. Amplify-related code (the Provider, the page) must produce zero warnings under the existing flat config. If a new rule fires (e.g., `react-hooks/exhaustive-deps` complaints about the `useEffect` dependency array), **fix it; don't bypass.** The dependency array `[authStatus, router]` in §5 is correct and should not raise warnings.

### L-16. `audit` script ignore-list may need extension
[CARRIED FROM PHASE 1] The `audit` script in `package.json` already carries 24 `--ignore=` flags for Amplify CLI build-tool transitive CVEs. Installing `aws-amplify` + `@aws-amplify/ui-react` may surface additional CVEs in the Amplify v6 frontend tree (or may not). **Don't preemptively add ignores — run `bun run audit` first, then add only the new ones with a justification comment.**

## State of the Art

| Old Approach | Current Approach (2026-04) | When Changed | Impact |
|--------------|---------------------------|--------------|--------|
| `import { Auth } from "aws-amplify"` | `import { signOut } from "aws-amplify/auth"` | aws-amplify v6 (2024 GA) | Subpath imports; mixing v5 and v6 patterns is the most common training-data trap. |
| `Amplify.configure(outputs)` (no options) | `Amplify.configure(outputs, { ssr: true })` for Next.js | Required for Next.js per current docs | Switches token storage to cookies; mandatory disclosure in plan/CONTEXT update. |
| `withAuthenticator` HOC wrapping `_app.tsx` (Pages Router pattern) | `<Authenticator>` rendered in a route + `Authenticator.Provider` for hook access | App Router shift | The HOC still works in v6, but the modern pattern co-locates auth UI with the route, not the layout. |
| Hosted UI redirect for sign-in | In-app `<Authenticator>` component | Always optional; CONTEXT explicitly chose in-app | Faster UX, no domain-prefix Cognito setup needed (until Phase 3 when Google OAuth requires a Cognito domain). |
| `npm create amplify@latest` ships `auth/resource.ts` | Manual install (Phase 1 deferred this) — Phase 2 hand-writes the file | Bun incompatibility (Phase 1 G-3) | We're in a clean position to write exactly what we need without scaffold cruft. |

**Deprecated / outdated to ignore:**
- `Auth.signOut()` (v5 namespace API) — gone in v6; use `signOut` from `aws-amplify/auth`.
- `Amplify.configure({ Auth: { ... } })` with hand-written config — replaced by `Amplify.configure(outputs)` reading from `amplify_outputs.json`.
- `<Authenticator components={...}>` with custom subcomponent overrides — works but unnecessary for default v1 UI per D-24.
- `signUpConfig.signUpFields` (v5 prop) — gone; `signUpAttributes` (v6) is the v6 equivalent, but not needed thanks to Zero Configuration (L-6).

## Project Constraints (from CLAUDE.md / AGENTS.md)

- **HARD:** Next.js 16 has breaking changes vs training data. Read `node_modules/next/dist/docs/` before recommending APIs. **Honored:** all Next.js patterns in this research (`useRouter` from `next/navigation`, root layout shape, "use client" semantics, Server vs Client Components for the placeholder pages) verified against local Next 16.2.4 docs.
- **HARD:** Heed deprecation notices. **Honored:** flagged v5→v6 migrations in State of the Art and L-7 above.
- **CARRIED FROM PHASE 1:** Strict `eslint . --max-warnings=0`, double-quote string style (PATTERNS.md), `bun run typecheck` must stay green, `bun run audit` ignore-list pattern.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `aws-amplify@6.16.4` and `@aws-amplify/ui-react@6.15.3` (latest as of 2026-04-21) install cleanly under Bun 1.3.5 with React 19.2.4 + Next 16.2.4 | §3 | Install fails or runtime error. **Mitigation:** peer deps verified above; if a runtime issue surfaces, fall back to the latest `6.x` versions matching the same peer constraints. The plan should run `bun add` early in the wave so this surfaces fast. |
| A2 | `Amplify.configure(outputs, { ssr: true })` does not break the client-only `<Authenticator>` flow even though we have no server-side auth APIs in Phase 2 | §4 | Sign-up/sign-in fails. **Mitigation:** WebFetch on the official docs (2026-04-25) confirmed `ssr: true` is recommended for ALL Next.js use, regardless of server-side API presence. Confidence HIGH. |
| A3 | `<Authenticator>` Zero Configuration correctly infers the `name` field from `amplify_outputs.json` `standard_required_attributes: ["email", "name"]` and renders it in sign-up | §1, L-6 | Sign-up form is missing the Name field, user can't sign up. **Mitigation:** if A3 is wrong, fallback is `<Authenticator signUpAttributes={["name"]} />` — explicit override. Plan should include this fallback as a comment to try if Zero Configuration silently omits the field. Confidence HIGH (Zero Configuration is the documented v6 default). |
| A4 | The default Cognito email sender (`no-reply@verificationemail.com`) actually delivers to the developer's email inbox during D-29 manual flows (i.e., it's not blocked entirely, just spam-prone) | L-5 | Manual flow #1 cannot complete because no email arrives. **Mitigation:** plan instructs dev to check spam folder; if total non-delivery, fallback is to switch the user pool to SES configuration (out of Phase 2 scope per CONTEXT Deferred Ideas). Confidence MEDIUM — Cognito docs don't guarantee delivery, but real-world experience is "delivered to spam, occasionally to inbox". |
| A5 | `amplify_outputs.json` regeneration on `npx ampx sandbox --once` is idempotent — re-running with no source changes produces a byte-identical file | §9 | False positives in `git status` after redeploy. **Mitigation:** the file is gitignored anyway, so this is cosmetic only. Confidence HIGH. |
| A6 | Hoisting `AmplifyProvider` to root `app/layout.tsx` does not break the existing home page (`app/page.tsx`) which is currently a server component with no Amplify usage | §7/§8 | Home renders broken or with hydration error. **Mitigation:** `Authenticator.Provider` is a no-op when no `useAuthenticator` consumers exist below it. Confidence HIGH; verified by reading `@aws-amplify/ui` source pattern (provider just supplies a Context, doesn't force any rendering). |

## Open Questions

1. **Should the home page (`app/page.tsx`) get a "Sign in" link to `/login`?**
   - What we know: CONTEXT D-16 marks this as Claude's discretion; D-26 says home should remain mostly the default scaffold.
   - What's unclear: visual placement (top-right link, bottom hero CTA, both?).
   - **Recommendation:** small, plain link top-right of home — minimal blast radius, keeps the scaffold visually intact, gives the user a discoverable entry point without redesigning the page. Plan should include this as a small task.

2. **`AmplifyProvider` placement: root vs `/login` route layout?**
   - What we know: §7 reasoning argues for root (one wiring point, eliminates L-2 risk for `/app` sign-out).
   - What's unclear: whether the user has an aesthetic preference for keeping home "Amplify-free".
   - **Recommendation:** ROOT — confirmed via Assumption A6. Plan should propose this; if user objects in plan review, fall back to a `app/(auth)/layout.tsx` route group covering `/login` and `/app`.

3. **Will `bun run audit` surface new CVEs in the Amplify v6 frontend tree?**
   - What we know: Phase 1 plan 03 added 24 `--ignore` flags for Amplify CLI build-tool CVEs.
   - What's unclear: whether the v6 frontend (`aws-amplify`, `@aws-amplify/ui-react`) has additional advisories that will fail Phase 2's audit gate.
   - **Recommendation:** plan includes a Wave-end task: run `bun audit` raw (no ignores), document any new advisories, extend the ignore-list with one-line justifications. Don't preemptively add ignores.

4. **Does the existing sandbox stack still exist, or did the user run the optional teardown from Plan 01-05?**
   - What we know: Plan 01-05 SUMMARY listed teardown as optional ("Optional teardown of the sandbox stack to avoid AWS charges").
   - What's unclear: whether the developer ran it.
   - **Recommendation:** plan's first wave should include a precondition check (`aws cloudformation describe-stacks ... StackStatus`); if `Stacks not found`, that's fine — `npx ampx sandbox --once` will recreate. Either path leads to the same end state.

5. **Cognito email deliverability — what if the email never arrives at all (not even spam)?**
   - What we know: A4 is MEDIUM confidence; default sender domain has poor reputation.
   - What's unclear: whether the developer's email provider blacklists `verificationemail.com` outright.
   - **Recommendation:** if D-29 #1 fails due to total non-delivery, the planner has two escape hatches: (a) try a different email provider (Gmail, ProtonMail, iCloud) since deliverability varies, (b) configure SES (out of Phase 2 scope, would need a follow-up phase). Document both in the plan's "what to do if D-29 #1 fails" troubleshooting section.

## Sources

### Primary (HIGH confidence)
- **Local installed packages** — read directly from `node_modules/`:
  - `@aws-amplify/backend@1.22.0` source: `lib/backend.d.ts`, `lib/types/index.d.ts`
  - `@aws-amplify/backend-auth/lib/factory.d.ts` and `index.d.ts` — `defineAuth` signature + `AmplifyAuthProps` type
  - `@aws-amplify/auth-construct/lib/types.d.ts` — `AuthProps`, `EmailLogin`, `MFA`, `WebAuthnLogin`, `ExternalProviderOptions`, `AccountRecovery` keyof
  - `@aws-amplify/auth-construct/lib/defaults.js` — `DEFAULTS.PASSWORD_POLICY` + `IS_REQUIRED_ATTRIBUTE.email` confirming email auto-required behavior
  - `aws-cdk-lib/aws-cognito/lib/user-pool.d.ts` and `user-pool.js` — `AccountRecovery` enum members + `accountRecovery()` method behavior
  - `aws-cdk-lib/aws-cognito/lib/private/attr-names.js` — exact `StandardAttributeNames` mapping (`fullname → "name"`)
  - `aws-cdk-lib/aws-cognito/lib/user-pool-attr.d.ts` — `StandardAttributes` interface confirming `fullname?: StandardAttribute`
  - `next@16.2.4/dist/docs/01-app/03-api-reference/04-functions/use-router.md` — `useRouter` from `next/navigation`
  - `next@16.2.4/dist/docs/01-app/03-api-reference/01-directives/use-client.md` — `"use client"` directive semantics
  - `next@16.2.4/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md` — App Router layout conventions
  - `next@16.2.4/dist/docs/01-app/02-guides/redirecting.md` and `internationalization.md` — JSON import idioms (`import x from "./foo.json"`, no import attributes)
- **npm registry** — `npm view <pkg> version|peerDependencies|time` queried on 2026-04-25 for `aws-amplify`, `@aws-amplify/ui-react`, `@aws-amplify/adapter-nextjs`. All three currently `latest` versions documented above.
- **Live machine state** — `cat amplify_outputs.json` confirms current empty-backend baseline; `git check-ignore -v amplify_outputs.json` confirms gitignore coverage; CloudFormation stack list (Phase 1 SUMMARY); AWS CLI 2.34.37 verified installed.
- **GitHub Advisory Database** — carries forward from Phase 1 (no Phase-2-specific new advisories researched yet; planner may discover during `bun run audit`).

### Secondary (MEDIUM confidence)
- Context7 `/aws-amplify/docs` — Next.js App Router integration (`Amplify.configure(outputs, { ssr: true })`, `ConfigureAmplifyClientSide` provider pattern, root layout import).
- Context7 `/aws-amplify/amplify-ui` — `<Authenticator>` props (`initialState`, `hideSignUp`, `socialProviders`, `signUpAttributes`, `formFields`); `useAuthenticator` selector pattern; `Authenticator.Provider` requirement.
- Context7 `/aws-amplify/amplify-js` — v6 subpath imports (`import { signOut } from "aws-amplify/auth"`); `signOut` semantics including `{ global: true }` option.
- WebFetch [docs.amplify.aws/nextjs/build-a-backend/server-side-rendering/](https://docs.amplify.aws/nextjs/build-a-backend/server-side-rendering/) on 2026-04-25 — `ssr: true` requirement + `@aws-amplify/adapter-nextjs` necessity scoping (server-side only).
- WebFetch [docs.amplify.aws/react/build-a-backend/auth/moving-to-production/](https://docs.amplify.aws/react/build-a-backend/auth/moving-to-production/) on 2026-04-25 — Cognito default email functionality + SES move path.
- WebFetch [docs.aws.amazon.com/cognito/latest/developerguide/user-pool-email.html](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-email.html) on 2026-04-25 — default sender `no-reply@verificationemail.com`.
- WebFetch [docs.aws.amazon.com/cognito/latest/developerguide/limits.html](https://docs.aws.amazon.com/cognito/latest/developerguide/limits.html) on 2026-04-25 — 50 emails/day quota for default sender.
- WebFetch [ui.docs.amplify.aws/react/connected-components/authenticator/advanced](https://ui.docs.amplify.aws/react/connected-components/authenticator/advanced) on 2026-04-25 — full TypeScript snippet for Next.js App Router login page with `useEffect` + `router.push` pattern.

### Tertiary (LOW confidence — flagged in Assumptions Log if load-bearing)
- Real-world Cognito email deliverability anecdotes (A4) — based on common community experience; not verified in this session.

## Metadata

**Confidence breakdown:**
- `defineAuth` shape and CDK property names: HIGH — read directly from installed source `.d.ts` and `.js`.
- Frontend stack versions: HIGH — verified via `npm view` on 2026-04-25 with publish dates checked.
- `Amplify.configure({ ssr: true })` requirement and cookie storage behavior: HIGH — quoted directly from official docs (Context7 + WebFetch cross-verification).
- `<Authenticator>` Zero Configuration auto-rendering of the `name` field: HIGH — documented in Amplify UI docs as the expected v6 behavior.
- Post-auth redirect with `useAuthenticator` + `useEffect`: HIGH — exact snippet derived from official docs.
- `signOut` import path: HIGH — official docs + Context7.
- Cognito email deliverability in real inboxes: MEDIUM — official docs say default sender is "for typical production environments below required volume" + spam-prone. Real-world behavior depends on recipient mail provider.
- AmplifyProvider hoisting to root not breaking the home page (A6): HIGH — based on `Authenticator.Provider` being a Context provider only.

**Research date:** 2026-04-25
**Valid until:** ~2026-05-25 (Amplify v6 frontend cadence is roughly bi-weekly minor releases; verify versions before Phase 5; Cognito API + email defaults are stable on multi-month horizons).

---

## RESEARCH COMPLETE (orchestrator handoff)

**Phase:** 2 — Email/Password Auth + Authenticator UI
**Confidence:** HIGH

### Key Findings

1. **CDK `fullname` ↔ Cognito `"name"` ↔ Authenticator's auto-rendered "Name" field** — verified by reading the CDK source (`StandardAttributeNames.fullname = "name"`). The CONTEXT D-18 syntax with `fullname: { required: true, mutable: true }` is correct; `<Authenticator>` Zero Configuration auto-renders the field; no `signUpAttributes` prop needed. (L-1, L-6, A3)
2. **`Amplify.configure(outputs, { ssr: true })` is REQUIRED for Next.js per official docs** — and switches token storage from localStorage to cookies. **CONTEXT D-28 must be updated** to reflect cookie storage. AUTH-05 is satisfied by cookies just as it would be by localStorage (cookies survive refresh too). (L-3, §4)
3. **`@aws-amplify/adapter-nextjs` is NOT needed in Phase 2** — only required for server-side Amplify API calls (Server Components, Route Handlers, middleware). Phase 2 is purely client-side. Defer the install decision to Phase 4 when the auth guard might use middleware. (§3)
4. **`AmplifyProvider` should be hoisted to root `app/layout.tsx`** rather than scoped to `/login` — eliminates the risk that `signOut()` in `app/app/SignOutButton.tsx` runs before `Amplify.configure()`. CSS import lives in the same root layout. (§7, §8, L-2, A6)
5. **`useAuthenticator` requires `Authenticator.Provider`** in the tree when called outside `<Authenticator>` (i.e., from `app/login/page.tsx` for the redirect `useEffect`). Snippet in §3 includes the wrap. (L-4)
6. **Cognito default email sender is `no-reply@verificationemail.com`, often hits spam, capped at 50 emails/day across the AWS account**. Manual D-29 flows must include "check spam folder". Switching to SES is out of Phase 2 scope. (L-5, A4)
7. **Sandbox stack is alive** (per Phase 1 plan 05 SUMMARY) — Phase 2 deploy is a CloudFormation `UpdateStack` adding Cognito + Identity Pool + IAM roles, ~2-3 min. Even if the user tore it down, `npx ampx sandbox --once` will recreate. (§9, L-12, Open Question 4)
8. **All four CONTEXT D-29 manual flows are achievable with a bare `<Authenticator />`** (no props); plan should batch them at end-of-phase rather than interleave. (§5, Validation Architecture)

### File Created
`/home/fernando/Documents/datathon-2026/.planning/phases/02-email-password-auth-authenticator-ui/02-RESEARCH.md`

### Confidence Assessment
| Area | Level | Reason |
|------|-------|--------|
| Backend `defineAuth` shape | HIGH | Read directly from installed `@aws-amplify/auth-construct` and `aws-cdk-lib/aws-cognito` source |
| Frontend dep versions + peer compat | HIGH | `npm view` queries cross-verified peer deps against React 19 + Next 16 |
| `Amplify.configure({ ssr: true })` requirement | HIGH | Quoted verbatim from official Amplify Next.js docs; cross-verified Context7 + WebFetch |
| `<Authenticator>` props (none needed) | HIGH | Zero Configuration documented in Amplify UI docs; verified |
| `useAuthenticator` + `useEffect` redirect pattern | HIGH | Official docs example + Context7 selector docs + Next 16 `useRouter` docs |
| `signOut` import + async semantics | HIGH | Context7 `/aws-amplify/amplify-js` "Sign Out User with signOut" |
| Sandbox redeploy behavior | MEDIUM-HIGH | Based on Phase 1 plan 05 SUMMARY + Amplify docs; not test-deployed in this session |
| Cognito email deliverability | MEDIUM | Official docs confirm sender domain + 50/day quota; real-world delivery is provider-dependent |
| AmplifyProvider hoisting safety (A6) | HIGH | Based on Provider being a no-op Context when no consumers exist |

### Open Questions (for planner / discuss-phase)
1. Sign-in link on home page — Claude's discretion → research recommends "yes, small top-right link"
2. AmplifyProvider placement — root vs route layout → research strongly recommends root
3. New CVEs from `aws-amplify` v6 deps — only knowable after `bun add` + `bun audit` → plan includes audit-then-extend-ignores task
4. Does the sandbox stack still exist? → plan includes describe-stacks precondition; either path leads to same end state
5. Email deliverability fallback if total non-delivery → plan documents Gmail/ProtonMail try + SES escape hatch (out of scope)

### Ready for Planning
Research complete. Recommended task ordering for the planner:
1. **Wave A (no AWS deploy):** Backend — write `amplify/auth/resource.ts`, edit `amplify/backend.ts`. Verify `cd amplify && npx tsc --noEmit` green.
2. **Wave B (no AWS deploy):** Frontend deps — `bun add aws-amplify@^6.16.4 @aws-amplify/ui-react@^6.15.3`. Run `bun run typecheck` + `bun run audit`; extend audit ignores if needed.
3. **Wave C (no AWS deploy):** Frontend wiring — create `app/AmplifyProvider.tsx`, modify `app/layout.tsx` to mount provider + import CSS, create `app/login/{page.tsx}`, create `app/app/{page.tsx, SignOutButton.tsx}`. Optionally add Sign-in link to `app/page.tsx`. Verify `bun run lint && bun run typecheck && bun run build` green.
4. **Wave D (REQUIRES AWS):** Sandbox redeploy — verify Phase 1 stack state, run `npx ampx sandbox --once --profile aws-cli-amplify`, verify `amplify_outputs.json` populated with auth block, verify Cognito User Pool exists in AWS Console.
5. **Wave E (manual gate):** Execute D-29 flows 1-4 in browser; document results in plan SUMMARY. Update CONTEXT.md D-28 wording to reflect cookie storage (one-line edit).
