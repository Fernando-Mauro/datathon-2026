# Phase 3: Protected Route & Auth Guard - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Convertir `/app` (placeholder accesible montado en Phase 2 plan 02-03) en una ruta protegida real: si no hay sesión activa, redirigir a `/login` (preservando la URL original vía `?from=` para bounce-back tras sign-in); si la hay, mostrar contenido específico que incluya al menos email + name del usuario autenticado. Encapsular la lógica en un componente cliente reusable `<AuthGuard>` montado vía `app/app/layout.tsx`, de modo que cualquier ruta futura bajo `/app/*` herede el guard, y cualquier ruta fuera de `/app/*` pueda importar `<AuthGuard>` para protegerse con una sola línea.

**No incluido en esta phase (límites firmes):**
- Server-side auth (route handlers / server actions / middleware.ts) — requeriría `@aws-amplify/adapter-nextjs` que Phase 2 dejó out tras walk-back de `ssr: true` (D-41 lo confirma); abrir como mini-phase post-feature si llega API real
- Producción / Amplify Hosting — Phase 4
- Roles, permisos, multi-tenant — TBD post-datatón
- Layout/shell real (header, sidebar, nav) — la feature del datatón decidirá; Phase 3 sólo cumple criterio "muestra email del usuario"
- Magic link, MFA, GitHub OAuth — Out of Scope (proyecto)
- Google OAuth federation — Out of Scope (dropeado 2026-04-25; AUTH-02 movido a Out of Scope)

</domain>

<decisions>
## Implementation Decisions

### Guard Pattern Shape (D-30..D-33)

- **D-30:** El guard es un componente cliente **`<AuthGuard>`** reusable, montado dentro de un **`app/app/layout.tsx`** client component que envuelve todos los children de la ruta `/app/*`. Toda ruta nested bajo `/app/...` hereda el guard automáticamente; rutas fuera de `/app/` (futuro `/settings`, `/profile`, etc.) lo importan explícitamente. Combina idiom App Router (layouts) con reusabilidad de componente. Cumple ROADMAP success criterion 3 ("HOC, layout, o middleware documentado") con la opción "layout".

- **D-31:** El gating usa **`useAuthenticator((ctx) => [ctx.authStatus])`** del `@aws-amplify/ui-react` — mismo hook y mismo selector que Phase 2 D-26 / `app/login/page.tsx` ya usa. Tres estados manejados:
  - `configuring` → render loading (D-34)
  - `authenticated` → render children
  - `unauthenticated` (también `signIn`, `signUp`, `confirmSignUp`, etc. — todos los no-authenticated states) → redirect a `/login?from=...` (D-35, D-36)

  Funciona porque `Authenticator.Provider` está montado en root vía `app/AmplifyProvider.tsx` (Phase 2 plan 02-03 hoist), así que `useAuthenticator` es callable desde cualquier client component del tree.

- **D-32:** Componente vive en **`app/_components/AuthGuard.tsx`**. El prefijo `_` excluye el directorio del routing de App Router (convención Next.js para co-located non-route components). Mantiene todo dentro de `app/`, no introduce nueva top-level convention (`components/`, `lib/`).

- **D-33:** `<AuthGuard>` solo hace gating (renderiza `children` o redirige). NO pasa user info por props ni context. La página protegida llama por sí misma `useAuthenticator(({user}) => [user])` o `fetchUserAttributes()` para obtener email/name. Razón: simplicidad — `Authenticator.Provider` ya provee context global; cualquier client component del subtree lo puede consumir directamente, sin agregar capa custom.

### Loading + Redirect UX (D-34..D-37)

- **D-34:** Mientras `authStatus === "configuring"`, `<AuthGuard>` renderiza **spinner + texto "Loading…" centrado** vertical/horizontal en la pantalla. Implementación: Tailwind utility classes (probablemente un `<div>` con `animate-spin` border + flex centering). Consistente con el `<p className="text-sm opacity-70">Loading…</p>` que `app/login/page.tsx` ya muestra durante `configuring` (Phase 2 plan 02-03). Evita flash de contenido protegido y flash de redirect cuando la sesión sí existe pero Amplify aún no ha resuelto el estado inicial.

- **D-35:** Redirect a `/login` usa **`router.replace(...)`** (no `router.push`). Razón: replace no añade entry al history, así que si el user pulsa back desde `/login`, el browser no intenta volver a `/app` (que volvería a redirigir → loop visual feo). `useRouter` de `next/navigation` (App Router; Phase 2 L-7 ya lo refuerza — `next/router` es Pages Router only y está prohibido por anti-pattern grep).

- **D-36:** **Bounce-back vía `?from=` query param.** Cuando `<AuthGuard>` redirige a `/login` por falta de sesión:
  ```typescript
  const pathname = usePathname(); // current URL como string
  router.replace(`/login?from=${encodeURIComponent(pathname)}`);
  ```
  Tras sign-in exitoso en `/login`, leer `searchParams.get("from")` y redirigir ahí (en vez de hardcoded `/app`). UX correcto cuando aparezcan más rutas protegidas (post-feature). Para v1 con solo `/app`, casi siempre `from === "/app"`, pero el patrón ya queda hecho.

  **Allowlist anti open-redirect:** validar que `from` empieza con `/` y NO con `//` (que abriría `//evil.com` como URL absoluta) ni con `/login` (que sería loop). Funcion helper compartida entre `<AuthGuard>` y `/login`. *(Researcher decide si vive en `app/_components/safeFromPath.ts` o inlined; planner lo resuelve.)*

- **D-37:** **`app/login/page.tsx` se extiende** para soportar `?from=`. El `useEffect` actual:
  ```typescript
  useEffect(() => {
    if (authStatus === "authenticated") router.push("/app");
  }, [authStatus, router]);
  ```
  pasa a:
  ```typescript
  const searchParams = useSearchParams();
  useEffect(() => {
    if (authStatus === "authenticated") {
      const from = safeFromPath(searchParams.get("from")) ?? "/app";
      router.replace(from);
    }
  }, [authStatus, router, searchParams]);
  ```
  Cambio de `push` → `replace` también acá: tras sign-in, no queremos que back vuelva a `/login` (Phase 2 D-26 originalmente especificaba `push` — esto lo supersede, evolución compatible).

### Protected Page Content (D-38..D-40)

- **D-38:** `/app` con sesión activa muestra **`Signed in as {fullname} ({email})`** + el `<SignOutButton>` existente. Copy exacto = Claude's discretion, pero los dos atributos son visibles. Cumple ROADMAP success criterion 2 ("muestra contenido protegido que incluye al menos el email del usuario") + da al user contexto sobre qué cuenta usa. Sin shell completo (header/sidebar) — la feature del datatón decidirá el layout real.

- **D-39:** Para obtener el user info:
  - **Email:** desde `useAuthenticator(({user}) => [user]).user.signInDetails?.loginId`. Sincrónico, ya estaba en context. *(Researcher confirma que `signInDetails.loginId` es el campo correcto para email-based sign-in en Amplify v6.16.x — alternativa `user.username` puede ser un sub UUID en algunas configs.)*
  - **Name (fullname):** desde `fetchUserAttributes()` de `aws-amplify/auth`. Async, returns `{email, name, sub, ...}`. Llamar dentro de `useEffect` con loading state local mientras resuelve. El attribute key es `name` en Cognito (OIDC standard claim) — Phase 2 D-18 declaró `fullname` en CDK, que mapea a `name` on-the-wire (Phase 2 02-01 SUMMARY L-1).
  - Si `fetchUserAttributes` falla o el name no existe (edge case), mostrar solo email — el name es enriquecimiento, no requisito.

- **D-40:** **Reemplazar `app/app/page.tsx`** existente. El placeholder actual de Phase 2 (`<h1>Welcome</h1> + nota + <SignOutButton>`) se transforma en la página protegida real con el copy de D-38. SignOutButton ya está co-located y se reusa sin cambios.

### Server-Side Auth Adapter (D-41)

- **D-41:** **`@aws-amplify/adapter-nextjs` queda diferido.** Phase 3 sigue 100% client-side. Razones acumuladas:
  - Phase 2 walk-back (RESEARCH L-3 corregido en plan 02-05): `ssr: true` + adapter cuelga `useAuthenticator` en `configuring` indefinidamente.
  - Phase 3 no necesita SSR auth: `<AuthGuard>` es client; `/login` es client; `/app/page.tsx` es client.
  - Phase 4 (Hosting) tampoco necesita SSR auth — el deploy estático/SSG de Next.js + client-side hydration cubre el flow.
  - Bundle size + complejidad sin valor inmediato.

  **Cuándo se reabre:** post-feature, si la solución del datatón añade API routes (`app/api/.../route.ts`) o server actions que necesiten leer la sesión del user. Entonces abrir un mini-phase: instalar adapter, switch a cookie storage, validar que `useAuthenticator` no se cuelga (puede que el bug del walk-back ya esté fixed en versiones más nuevas).

### Claude's Discretion

- Implementación visual exacta del spinner + Loading… (clases Tailwind, tamaño, color)
- Layout y typography del `/app` content (h1 vs p, spacing, container max-width)
- Si la función `safeFromPath` vive en `app/_components/safeFromPath.ts`, en `app/_lib/url.ts`, o inlined dentro de `<AuthGuard>` y `/login` (researcher / planner deciden)
- Si la página protegida muestra también `user.username` (Cognito sub) o solo email — éste es debug-info que probablemente no aporta v1
- Si añadir un `Suspense` boundary alrededor del fetch async de `fetchUserAttributes()` o usar useState/useEffect simple
- Si introducir un tipo TS `User` exportado para el shape (email + name) o usar el tipo nativo de aws-amplify
- Copy exacto de "Signed in as …" (puede ser "Welcome, {name}" + email pequeño debajo, o cualquier variante)
- Si el AuthGuard exporta también una version `<AuthGuardSkeleton>` para SSR-streaming (probablemente no — overkill)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — visión, constraints (Amplify Gen2, Cognito email+password único en v1, Bun); Google OAuth dropeado 2026-04-25
- `.planning/REQUIREMENTS.md` — Phase 3 owns AUTH-04 (única requirement); AUTH-02 dropped to Out of Scope
- `.planning/ROADMAP.md` §"Phase 3: Protected Route & Auth Guard" — goal + 3 success criteria oficiales (redirect, show content, reusable pattern)

### Phase 2 context (heavy load — Phase 3 extiende lo que Phase 2 dejó hecho)
- `.planning/phases/02-email-password-auth-authenticator-ui/02-CONTEXT.md` — D-17 (placeholder `/app`), D-22..D-26 (Authenticator wiring + redirect-on-authenticated), D-28 (localStorage walk-back)
- `.planning/phases/02-email-password-auth-authenticator-ui/02-RESEARCH.md` — L-3 walk-back (`ssr: true` + adapter-nextjs hangs `useAuthenticator`); L-4 (`Authenticator.Provider` requerido para useAuthenticator outside `<Authenticator>`); L-7 (`useRouter` desde `next/navigation`, no `next/router`)
- `.planning/phases/02-email-password-auth-authenticator-ui/02-05-SUMMARY.md` — walk-back final commit + razón
- `.planning/phases/02-email-password-auth-authenticator-ui/02-03-SUMMARY.md` — AmplifyProvider hoist a root, `Authenticator.Provider` montado en layout

### Phase 1 context
- `.planning/phases/01-foundation-amplify-backend-skeleton/01-CONTEXT.md` — D-04 (boundaries `error.tsx`, `loading.tsx`, `not-found.tsx` ya existen — no se duplican en `/app/`)

### Codebase state (post-Phase 2)
- `.planning/codebase/STACK.md` — Next 16.2.4, React 19.2.4, aws-amplify@6.16.x, @aws-amplify/ui-react@6.15.x, Tailwind 4, Bun
- `.planning/codebase/STRUCTURE.md` — `app/` layout actual; Phase 3 introduce `app/_components/` (nuevo subdir, prefijo underscore) y `app/app/layout.tsx` (nuevo)
- `.planning/codebase/CONVENTIONS.md` — quote style (double), naming
- `app/AmplifyProvider.tsx` — NO modificar; Phase 3 depende de que `Authenticator.Provider` esté en root
- `app/layout.tsx` — NO modificar (root, server)
- `app/login/page.tsx` — Phase 3 lo extiende: añadir `useSearchParams` + `safeFromPath` + cambiar `push` → `replace` (D-37)
- `app/app/page.tsx` — Phase 3 lo reemplaza con la página protegida real (D-40)
- `app/app/SignOutButton.tsx` — Phase 3 lo reusa sin cambios
- `app/app/layout.tsx` — NO existe; Phase 3 lo crea como client component con `<AuthGuard>` (D-30)
- `app/_components/AuthGuard.tsx` — NO existe; Phase 3 lo crea (D-32)

### External docs (researcher debe leer)
- `node_modules/next/dist/docs/` — App Router 16 patterns para layouts client/server, useSearchParams + Suspense en App Router 16, useRouter from next/navigation. AGENTS.md sigue mandatorio.
- AWS Amplify UI Authenticator hook docs: https://ui.docs.amplify.aws/react/connected-components/authenticator/configuration#useauthenticator-hook — selector pattern, AuthStatus union types
- aws-amplify/auth docs: https://docs.amplify.aws/react/build-a-backend/auth/manage-user-attributes/ — `fetchUserAttributes()` shape; standard claims map (`name`, `email`, `sub`)
- Phase 2 research/summary referenced above ya tienen los specifics de v6.16.x APIs

### Project instruction file
- `AGENTS.md` (importado vía `CLAUDE.md`) — Next.js 16 breaking changes warning sigue vigente

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (de Phase 2)
- **`Authenticator.Provider` montado en root** (`app/AmplifyProvider.tsx`) — `useAuthenticator()` callable desde cualquier client component del tree, sin re-mount. Esto es lo que hace D-30 (layout-level guard) viable.
- **`<SignOutButton>`** (`app/app/SignOutButton.tsx`) — botón sign-out + `signOut()` de `aws-amplify/auth` + `router.push("/")`. Phase 3 lo reusa tal cual.
- **Pattern de redirect-on-authenticated** (`app/login/page.tsx`) — `useEffect` watching `authStatus`. Phase 3 lo evoluciona (D-37) para soportar `?from=`.
- **`<p>Loading…</p>` durante configuring** (`app/login/page.tsx`) — Phase 3 mantiene la misma idea pero con spinner Tailwind para enriquecer (D-34).
- **`Amplify.configure(outputs)` sin `ssr:true`** (`app/AmplifyProvider.tsx`) — Phase 3 NO toca esto. localStorage tokens, client-only, confirmado.

### Established Patterns
- **Quote style: double quotes** (Phase 1 PATTERNS.md)
- **Path alias `@/*`** funcional (`tsconfig.json`) — `app/_components/AuthGuard.tsx` se importa como `@/app/_components/AuthGuard` o relative `../_components/AuthGuard` (planner decide)
- **`"use client"` directive en archivos que usen hooks** — todos los nuevos files de Phase 3 son client components (`AuthGuard.tsx`, `app/app/layout.tsx`)
- **Tailwind v4 vocabulary** (`bg-foreground`, `bg-background`, etc. en `app/globals.css`) — spinner y typography del `/app` page usan estas tokens

### Integration Points
- **`app/app/layout.tsx`** (NEW) — punto donde se monta `<AuthGuard>` para que aplique a todos los children de `/app/*`. Sub-rutas futuras (`app/app/foo/page.tsx`) lo heredan sin extra boilerplate.
- **`app/_components/AuthGuard.tsx`** (NEW) — el componente. Convención `_` prefix excluye del routing de App Router.
- **`app/login/page.tsx`** (MODIFY) — extender con `useSearchParams` + `safeFromPath` + `replace` en vez de `push`.
- **`app/app/page.tsx`** (REPLACE) — reemplaza el placeholder actual con email/name + SignOutButton.

### Constraints / Gotchas conocidos (research debe profundizar)
- **`useSearchParams` en App Router 16** — debe estar dentro de un `<Suspense>` boundary o el build falla con "useSearchParams should be wrapped in a suspense boundary" (cambio de App Router ≥13). Researcher verifica si Next 16.2 sigue exigiéndolo o si hay nueva sintaxis.
- **`fetchUserAttributes()` puede tirar** si el token expiró durante el render — wrap en try/catch en el useEffect, fallback a sólo email.
- **`safeFromPath` allowlist:** validar `path.startsWith("/")`, NOT `path.startsWith("//")` (open redirect via protocol-relative URL), NOT `path.startsWith("/login")` (loop). Tests unit serían valiosos pero — preferencia user "shippeable hoy" — el planner decide si añadir o no.
- **Race entre `Amplify.configure` (module-load en `AmplifyProvider`) y `useAuthenticator` initial render** — ya manejado por Phase 2 (`configuring` state); Phase 3 hereda la solución.
- **Sub-route layouts en App Router 16** — `app/app/layout.tsx` debe ser sibling de `app/app/page.tsx`. Si es client component, debe llevar `"use client"` y NO puede contener `metadata` export (las páginas hijas pueden, pero no el client layout).

</code_context>

<specifics>
## Specific Ideas

- El user picked recommended en TODAS las decisiones de Phase 3. Señal fuerte: "lo más estándar/simple gana" — el planner debe favorecer el camino más idiomático en vez de elaborar abstracciones.
- El allowlist de `?from=` es un detail pequeño pero real (open redirect prevention). No skipearlo aunque sea v1 — son 5 líneas de helper.
- El SignOutButton existente NO se modifica — reuse máximo.
- El placeholder actual de `/app` (Phase 2) explícitamente dijo "Phase 4 le añade el guard" (D-17 de Phase 2). Phase 3 (renumerada de Phase 4) cumple esa promesa.
- Phase 3 es la primera vez que se usa el patrón `app/_components/` en este proyecto. Establece la convención para futuros componentes shared client-side (Phase 4 / datatón pueden seguirla).

</specifics>

<deferred>
## Deferred Ideas

Capturados durante la discusión pero fuera de Phase 3.

### Hacia Phase 4 (Hosting + CI)
- Verificar que el guard funciona en build de producción (no solo dev mode) — Phase 4 lo cubre como parte del smoke test post-deploy
- Revisar si `<Suspense>` boundary alrededor de `useSearchParams` impacta hidratación en producción

### Hacia post-feature (datatón / v2)
- **Server-side auth (`@aws-amplify/adapter-nextjs` + cookie storage)** — abrir mini-phase si la feature del datatón necesita API routes o server actions con sesión. Reabre la decisión de Phase 2 walk-back; verificar primero si versiones nuevas de Amplify v6 ya fixearon el bug del cookie adapter.
- **Shell completo de `/app`** — header con avatar, sidebar nav, layout responsive. La feature del datatón decidirá la estructura real; Phase 3 sólo planta la página protegida mínima.
- **Roles / permisos / multi-tenant** — Cognito Groups + custom claims; abrir cuando la feature lo requiera.
- **Bounce-back con state preservado** (no solo URL pathname, sino también scroll position, form draft, etc.) — overkill v1; localStorage hack si llega a hacer falta.
- **HOC `withAuthGuard(Component)`** considered y descartado por no-idiomático en App Router 16; reabrir solo si el patrón component+layout no escala.
- **AuthContext custom** considered y descartado (Authenticator.Provider ya cubre context); reabrir solo si necesitamos campos derivados que no estén en el user object o attributes.
- **Skeleton elaborado durante `configuring`** vs spinner simple — overkill para hackathon.
- **Route group `(protected)`** para agrupar varias rutas protegidas bajo un mismo layout — útil cuando haya 3+ protected routes; ahora con una sola, overkill.

### Backlog
- Tests unitarios para `safeFromPath` allowlist — defensa en profundidad contra open redirect
- E2E test del flow completo (visitar `/app` sin sesión → /login?from=/app → sign-in → vuelta a /app) — útil pero no crítico para v1

</deferred>

---

*Phase: 03-protected-route-auth-guard*
*Context gathered: 2026-04-25*
