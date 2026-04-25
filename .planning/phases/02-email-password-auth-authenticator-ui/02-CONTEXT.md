# Phase 2: Email/Password Auth + Authenticator UI - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Levantar Cognito User Pool con email + password + atributo `name` declarativamente en `amplify/auth/resource.ts` vía Amplify Gen 2, integrar el componente `<Authenticator>` de `@aws-amplify/ui-react` en una ruta dedicada `/login` de Next.js, y verificar que los flujos de sign-up (con verificación por email), sign-in, sign-out, reset password y persistencia de sesión funcionan end-to-end contra el sandbox.

**No incluido en esta phase (límites firmes):**
- Google OAuth federation — Phase 3
- Ruta protegida con guard reutilizable — Phase 4 (Phase 2 sólo crea un placeholder `/app` accesible)
- Amplify Hosting / production deploy — Phase 5
- MFA, GitHub OAuth, magic link — Out of Scope (proyecto)
- Producto / data layer / storage — TBD

</domain>

<decisions>
## Implementation Decisions

### Auth UI Placement (D-15..D-17)

- **D-15:** El `<Authenticator>` vive en una ruta dedicada `app/login/page.tsx`. NO se envuelve toda la app — home queda pública.
- **D-16:** Home `/` (`app/page.tsx`) queda como está (scaffold default por ahora — el producto está TBD). Phase 2 NO modifica el home más allá de añadir un link "Sign in" → `/login` si conviene (Claude's discretion).
- **D-17:** Phase 2 crea un placeholder mínimo `app/app/page.tsx` (no es un typo — la ruta es `/app`, dentro de `app/`) que muestra "Welcome, {name}" y un botón Sign out. Es accesible sin guard en Phase 2 (cualquiera puede visitar `/app` directamente). Phase 4 le añade el guard de redirect-si-no-hay-sesión y hace el patrón reutilizable.

### Cognito User Pool (D-18..D-21)

- **D-18:** `amplify/auth/resource.ts` declara:
  ```typescript
  defineAuth({
    loginWith: { email: true },
    userAttributes: {
      email: { required: true, mutable: false },
      fullname: { required: true, mutable: true }
    }
  })
  ```
  *(researcher debe verificar el nombre exacto del atributo built-in — puede ser `fullname`, `name`, o un standard claim — y la estructura exacta de `userAttributes` en `@aws-amplify/backend@1.22.0`)*

- **D-19:** Verificación de email **obligatoria** en sign-up (Cognito default cuando email es required). El usuario recibe un código por email y debe ingresarlo antes de poder loguearse. `accountRecovery: "EMAIL_ONLY"` para reset password.

- **D-20:** Password policy = Cognito default (≥ 8 chars, contiene uppercase + lowercase + número + carácter especial). NO custom policy — para hackathon innecesario.

- **D-21:** El backend wiring vive en `amplify/backend.ts`:
  ```typescript
  import { defineBackend } from "@aws-amplify/backend";
  import { auth } from "./auth/resource";

  defineBackend({ auth });
  ```
  Reemplaza el `defineBackend({})` vacío de Phase 1.

### `<Authenticator>` Integration (D-22..D-25)

- **D-22:** Frontend deps a instalar (devDependencies + dependencies según corresponda — researcher debe verificar):
  - `aws-amplify` (cliente JS: `Amplify.configure`, `signIn`, `signOut`, etc.)
  - `@aws-amplify/ui-react` (componente `<Authenticator>` + `useAuthenticator()` hook)
  - `@aws-amplify/adapter-nextjs` — investigar si se necesita para App Router + server components o si es opt-in. Researcher decide.

- **D-23:** Patrón canónico Amplify Gen2 + Next.js App Router:
  - Crear `app/login/AmplifyProvider.tsx` (client component, `"use client";`) que importa `Amplify.configure(amplify_outputs)` a módulo-load
  - `app/login/page.tsx` importa `AmplifyProvider` y renderiza `<Authenticator>` dentro
  - Importar el CSS oficial: `@aws-amplify/ui-react/styles.css` en `app/layout.tsx` o en el provider (researcher verifica dónde)

- **D-24:** Tema **default AWS** (no theming custom en v1). El `<Authenticator>` aparece con su look-and-feel propio (cards moradas, naranja primario). Cuando el producto del datatón tenga brand, abrir como "polish phase" y temar con tokens Tailwind 4.

- **D-25:** El `<Authenticator>` por default ya soporta los 4 flujos requeridos por ROADMAP §Phase 2 success criteria — sign-up + verificación email + sign-in + sign-out + reset password vienen out-of-the-box. No customización de slots necesaria v1.

### Post-Auth Flow (D-26..D-28)

- **D-26:** Tras sign-in exitoso → `router.push("/app")`. Implementación: `useEffect` en `app/login/page.tsx` que escucha `useAuthenticator(({ authStatus }) => [authStatus])` y dispara el redirect cuando `authStatus === "authenticated"`. (Researcher confirma este es el patrón canónico.)

- **D-27:** Sign-out: botón en `app/app/page.tsx` que llama a `signOut()` de `aws-amplify/auth` y luego `router.push("/")` (vuelve a home pública). Claude's discretion en el placement visual.

- **D-28:** Persistencia de sesión: Amplify default es localStorage (auto-rehidrata al refrescar). NO custom storage adapter en v1 — los tradeoffs XSS están aceptados como riesgo conocido del v1 (mitigation post-MVP).

### Validation in Sandbox (D-29)

- **D-29:** Validación end-to-end (success criteria ROADMAP §Phase 2):
  1. Sign-up con un email real (o alias `+test1`, `+test2`, etc. del developer) → recibir código → ingresar → ver "logged in"
  2. Sign-out → re-sign-in con las mismas credenciales → succeed
  3. Refresh del navegador post-sign-in → sigue logged in (no vuelve a `/login`)
  4. Reset password flow: "Forgot password?" link en `<Authenticator>` → ingresar email → recibir código → ingresar nuevo password → poder loguearse con el nuevo
  Cada uno verificable manualmente en `npx ampx sandbox` (que ahora corre con `auth` resource desplegado).

### Claude's Discretion

- Si añadir un link "Sign in" / "Sign up" visible en `app/page.tsx` (home) o dejar que el usuario navegue manualmente a `/login`. Sensato: añadir un botón pequeño top-right.
- Layout exacto de `app/login/page.tsx` (centrado vertical/horizontal, max-width del card, etc.)
- Layout y copy exacto de `app/app/page.tsx` placeholder (Phase 4 lo va a refactorizar de todos modos)
- Si crear un `app/login/layout.tsx` que envuelve sólo `/login` con el Provider, o si poner el Provider directamente en `page.tsx` (researcher decide cuál es más idiomático en App Router 16)
- Cómo importar `amplify_outputs.json` en código TypeScript (probablemente `import outputs from "../../amplify_outputs.json"` con resolveJsonModule ya activo en tsconfig)
- Cuándo correr `npx ampx sandbox` (modo watch o `--once` de nuevo) durante development — researcher recomienda

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — visión, constraints (Amplify Gen2, Cognito + Google federation, Bun)
- `.planning/REQUIREMENTS.md` — Phase 2 owns AUTH-01, AUTH-03, AUTH-05; AUTH-02 (Google) es Phase 3, AUTH-04 (guard) es Phase 4
- `.planning/ROADMAP.md` §"Phase 2" — goal + 4 success criteria oficiales
- `.planning/phases/01-foundation-amplify-backend-skeleton/01-CONTEXT.md` — D-05/D-06 (skeleton vacío) ahora se rompe intencionalmente: Phase 2 añade el primer resource (`auth`)
- `.planning/phases/01-foundation-amplify-backend-skeleton/01-05-SUMMARY.md` — sandbox stack name + AWS profile (`aws-cli-amplify`) + region (`us-east-1`)

### Codebase state (post-Phase 1)
- `.planning/codebase/STACK.md` — base tech (Next 16, React 19, Tailwind 4, Bun) — Phase 2 añade `aws-amplify` + `@aws-amplify/ui-react`
- `.planning/codebase/ARCHITECTURE.md` — App Router patterns; Phase 2 introduce el primer client-component pattern via Provider wrapper
- `.planning/codebase/STRUCTURE.md` — donde plantar nuevas rutas (`app/login/`, `app/app/`)
- `.planning/codebase/CONVENTIONS.md` — quote style, naming
- `amplify/backend.ts` — actualmente `defineBackend({})`; Phase 2 lo cambia a `defineBackend({ auth })`
- `amplify/auth/resource.ts` — NO EXISTE aún; Phase 2 lo crea
- `app/error.tsx`, `app/loading.tsx`, `app/not-found.tsx` — boundaries de Phase 1; Phase 2 los respeta

### External docs (researcher debe leer)
- `node_modules/next/dist/docs/` — Next.js 16 App Router, especialmente patrones para rutas con client component providers (G-2 cuidado, esta versión tiene cambios)
- AWS Amplify Gen2 docs (online): https://docs.amplify.aws/react/build-a-backend/auth/ — `defineAuth()` API, `userAttributes`, `accountRecovery`, `loginWith` shapes
- Amplify UI Authenticator docs: https://ui.docs.amplify.aws/react/connected-components/authenticator — props del componente, `useAuthenticator()` hook signatures, theme override pattern
- `@aws-amplify/adapter-nextjs` package — verificar si requerido para App Router server components, o sólo para server actions / route handlers

### Project instruction file
- `AGENTS.md` (importado vía `CLAUDE.md`) — Next.js 16 breaking changes warning sigue vigente

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (de Phase 1)
- **`amplify/backend.ts`** — punto de entrada del backend; Phase 2 lo modifica para wire `auth`
- **App Router scaffold** — `app/layout.tsx` (root, server) + `app/page.tsx` (home, server) + boundaries; Phase 2 añade rutas hermanas `app/login/` y `app/app/`
- **`tsconfig.json`** — ya tiene `resolveJsonModule: true` (Next.js 16 default), permite `import outputs from "../amplify_outputs.json"` directamente
- **`.env.example`** — ya documenta `AWS_PROFILE`, `AWS_REGION`. Phase 2 NO añade nuevos env vars (config viene de `amplify_outputs.json`)
- **Tailwind v4 vocabulary** — tokens en `app/globals.css` (`bg-foreground`, `bg-background`, etc.). El home placeholder y `/app` placeholder pueden usarlos

### Established Patterns
- **Server components por defecto** — `app/login/page.tsx` puede ser server component que renderiza un client `<AmplifyProvider>` que a su vez renderiza `<Authenticator>` (`<Authenticator>` y `useAuthenticator` son client-only)
- **Quote style: double quotes** (PATTERNS.md de Phase 1)
- **Path alias `@/*`** funcional en `tsconfig.json` — útil para `import outputs from "@/amplify_outputs.json"` (verificar si funciona con archivos en root, o si conviene usar relative paths)

### Integration Points
- **`amplify/backend.ts`** — punto donde Phase 2 conecta el resource auth
- **`app/layout.tsx`** — posible hogar para el `<link rel="stylesheet" href="@aws-amplify/ui-react/styles.css">` o el import correspondiente
- **`amplify_outputs.json`** — generado por `ampx sandbox`; Phase 2 lee de aquí. Sigue gitignored (D-07 de Phase 1).

### Constraints / Gotchas conocidos (research debe profundizar)
- **`<Authenticator>` requiere CSS de `@aws-amplify/ui-react/styles.css`** — sin él, sale sin estilos. Importarlo en root layout o en provider.
- **Hidratación SSR/CSR** — el Provider usa `Amplify.configure` que es side-effect a module-load. El `<Authenticator>` lee del singleton; si el provider no ejecuta antes que el Authenticator, falla. Pattern documentado en docs Amplify oficial.
- **`adapter-nextjs`** — para Next.js App Router con server actions / route handlers que necesitan acceso a la sesión, se requiere; para sólo client-side `<Authenticator>`, puede no ser necesario. Researcher confirma.
- **`fullname` vs `name`** — Cognito built-in attribute names son específicos (OpenID Connect standard claims). Usar el correcto.
- **CDK Bootstrap** — ya hecho en Phase 1, Phase 2 hereda. No es necesario re-bootstrap.

</code_context>

<specifics>
## Specific Ideas

- El usuario explícitamente prefiere "lo más rápido que funcione" para hackathon. El default AWS theme y el `<Authenticator>` out-of-the-box son la elección consciente sobre custom UI — palanca máxima por tiempo invertido.
- Los 4 flujos del ROADMAP success criteria (sign-up + verify + sign-in + sign-out + reset) son TODOS gratis con `<Authenticator>` default. Cero código de form a escribir.
- La fricción real va a estar en: (a) wiring `Amplify.configure` correcto, (b) el patrón de redirect post-auth, (c) verificar que el sandbox redeploya el auth resource sin errores, (d) confirmar que el email de verificación llega (Cognito usa SES o Cognito built-in; researcher verifica).
- El developer se va a auto-test usando su propio email + alias `+1`, `+2`, etc. para no necesitar múltiples cuentas.

</specifics>

<deferred>
## Deferred Ideas

Capturados durante la discusión pero fuera de Phase 2.

### Hacia phases futuras
- **Theming custom del `<Authenticator>`** con tokens Tailwind 4 — abrir cuando el producto del datatón tenga brand
- **Rate limiting / brute-force protection** — Cognito tiene defaults razonables, configurar límites custom es post-MVP
- **Forgot username** flow — Cognito lo soporta pero no urgente
- **Custom error UI** para los flujos de auth — default messages OK para v1
- **Server-side session validation** en API routes / route handlers — necesitará `@aws-amplify/adapter-nextjs`; abrir cuando exista API real (post-feature)
- **Sign-out a una página de "Goodbye"** específica vs home — innecesario v1
- **Custom email verification template** (con branding) — Cognito permite override, hackathon no lo requiere
- **Password policy custom** (≥ 12 chars, etc.) — innecesario v1; default Cognito ya razonable

### Backlog
- Pre-commit hook para verificar que `amplify_outputs.json` no se haya commiteado por accidente (gitignore ya lo cubre, pero defensa-en-profundidad)

</deferred>

---

*Phase: 02-email-password-auth-authenticator-ui*
*Context gathered: 2026-04-25*
