# Phase 1: Foundation & Amplify Backend Skeleton - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Sanear el scaffold de Next.js 16 (resolver CVE PostCSS), añadir higiene mínima (lint estricto, error/loading boundaries, `.env.example`, scripts auxiliares), y plantar la raíz del backend Amplify Gen2 — `amplify/backend.ts` con `defineBackend({})` vacío puro — de modo que `npx ampx sandbox` despliegue un stack vacío sin errores en CloudFormation.

**No incluido en esta phase (límites firmes):**
- Cualquier resource Amplify (auth, data, storage) — viene en Phase 2 en adelante
- Configuración de Cognito, Google OAuth, rutas protegidas — Phases 2-4
- Amplify Hosting, CI desde GitHub, security headers — Phase 5
- Cualquier feature de producto — TBD post-datatón

</domain>

<decisions>
## Implementation Decisions

### Scope vs CONCERNS.md (qué entra en Phase 1)

- **D-01:** Resolver CVE PostCSS GHSA-qx2v-qp2m-jg93 actualizando la dependencia (`bun update postcss` o equivalente). Verificable con `bun audit`.
- **D-02:** Configurar lint estricto: `eslint . --max-warnings=0` en script `lint` de `package.json`. Warnings se vuelven errores.
- **D-03:** Crear `.env.example` documentando `AWS_PROFILE`, `AWS_REGION`. Comentarios explican explícitamente que las credenciales (access key, secret) NO van aquí — van en `~/.aws/credentials` vía `aws configure`.
- **D-04:** Crear boundaries Next.js mínimas:
  - `app/error.tsx` — error boundary client-side genérico con mensaje + botón "Try again"
  - `app/not-found.tsx` — 404 page genérica con link a home
  - `app/loading.tsx` — loading skeleton mínimo (spinner o pulse) para el root
  - UI básica, no se invierte en pulido visual aquí (eso es de feature phases futuras)

### Backend Skeleton Scope

- **D-05:** El directorio `amplify/` queda con `defineBackend({})` **vacío puro**. Solo `amplify/backend.ts` y `amplify/package.json` (autogenerado por `ampx`). Sin `auth/`, sin `data/`, sin `storage/`. Phase 2 introduce `amplify/auth/resource.ts`.
- **D-06:** No pre-cargar stubs ni placeholders de auth en Phase 1. Límite limpio entre infra y resource definitions.

### `amplify_outputs.json` Strategy

- **D-07:** `amplify_outputs.json` va a `.gitignore`. Cada developer (incluyendo CI en Phase 5) lo regenera ejecutando `npx ampx sandbox` (dev) o `npx ampx pipeline-deploy` (Hosting build). Razón: el archivo contiene IDs de recursos específicos del stack del developer; commitearlo crea conflictos y confusión cuando Phase 5 añade producción.
- **D-08:** También a `.gitignore`: `.amplify/` (cache local) y cualquier `node_modules/` que `ampx` pueda crear dentro de `amplify/`.

### Verification & Developer Experience

- **D-09:** Añadir scripts a `package.json`:
  - `"audit": "bun audit"` — verifica CVEs (lo que cierra INFRA-03 después de la actualización)
  - `"typecheck": "tsc --noEmit"` — type check sin emitir build
  - (Existentes se preservan: `dev`, `build`, `start`, `lint`)
- **D-10:** Documentar en README.md (sección "Setup") el flujo step-by-step para configurar AWS local:
  1. Crear IAM user en AWS Console (o reutilizar uno)
  2. Attach managed policy `AmplifyBackendDeployFullAccess`
  3. Generar access key + secret
  4. `aws configure --profile datathon-2026` (sugerencia de nombre de profile)
  5. Validar con `aws sts get-caller-identity --profile datathon-2026`
  6. Cómo correr `npx ampx sandbox` (qué esperar como output, cómo limpiar con `npx ampx sandbox delete`)
- **D-11:** README también documenta: cuál `AWS_REGION` usar (sugerir `us-east-1` como default — más servicios disponibles, menos latencia para usuarios US/LATAM en datatón) y cómo cambiarla.

### AWS Environment Setup (clarificación clave para downstream)

- **D-12:** Las credenciales AWS NO van en `.env`. Patrón estándar AWS = `~/.aws/credentials` profile.
- **D-13:** Lo que sí va en `.env.local` (developer-specific, gitignored): `AWS_PROFILE=datathon-2026` (o el nombre que el dev haya elegido). El `.env.example` lo documenta.
- **D-14:** No introducir secretos de OAuth o Cognito en Phase 1 — eso es Phase 2/3 y ahí van a `npx ampx sandbox secret` o a Amplify Console (Hosting), nunca al repo.

### Claude's Discretion

- Estilo visual exacto de `error.tsx`, `loading.tsx`, `not-found.tsx` (UI mínima, sin marca todavía — el datatón aún no tiene producto definido)
- Nombre exacto del IAM user / profile sugerido en README (`datathon-2026` es una sugerencia)
- Estructura interna del `amplify/backend.ts` más allá de `defineBackend({})` (puede añadir comentarios o no)
- Cómo se redacta exactamente el README setup (formato, headings)
- Si conviene añadir un script `clean` que borre `.next/`, `.amplify/` y `amplify_outputs.json` (probablemente sí — diga Claude)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — visión del proyecto, constraints, key decisions (Amplify Gen2, Bun, Cognito + Google)
- `.planning/REQUIREMENTS.md` — INFRA-01 e INFRA-03 cubiertas por esta phase; resto es out-of-scope para Phase 1
- `.planning/ROADMAP.md` §"Phase 1" — goal, success criteria oficiales (4 ítems)

### Codebase state (pre-Phase 1)
- `.planning/codebase/STACK.md` — Next.js 16.2.4, React 19.2.4, Tailwind 4, Bun, ESLint 9 flat config
- `.planning/codebase/STRUCTURE.md` — directorio actual: `app/`, `public/`, no hay `components/`, `lib/`, `app/api/`, `middleware.ts`
- `.planning/codebase/ARCHITECTURE.md` — App Router, no auth/middleware/error boundaries wired
- `.planning/codebase/CONCERNS.md` — lista completa; Phase 1 atiende: CVE PostCSS (D-01), lint enforcement (D-02), `.env.example` (D-03), error/loading/not-found (D-04). El resto se difiere.
- `.planning/codebase/CONVENTIONS.md` — estilo y patterns existentes (TS strict, paths `@/*`)

### External docs (researcher debe leer)
- `node_modules/next/dist/docs/` — Next.js 16 tiene cambios respecto a 14/15; según `AGENTS.md` esto es **mandatorio**. En particular ver docs sobre `error.tsx`, `loading.tsx`, `not-found.tsx` en App Router 16.
- AWS Amplify Gen2 docs (online): https://docs.amplify.aws/react/build-a-backend/ — patrón canónico de `defineBackend()`, ciclo de vida de `npx ampx sandbox`, gitignore recomendado oficial
- AWS IAM managed policy `AmplifyBackendDeployFullAccess` — referenciado en D-10; researcher debe verificar que sigue siendo el nombre actual y los permisos cubren `npx ampx sandbox`

### CVE
- GHSA-qx2v-qp2m-jg93 (PostCSS XSS) — researcher puede consultar https://github.com/advisories/GHSA-qx2v-qp2m-jg93 para confirmar el rango afectado y la versión fix

### Project instruction file
- `AGENTS.md` (importado vía `CLAUDE.md`) — warning crítico sobre Next.js 16 breaking changes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Bun + lockfile** — `bun.lock` ya existe; usar `bun add`/`bun update`/`bun install` consistente.
- **TypeScript strict** — `tsconfig.json` ya tiene strict mode + `@/*` path alias; no necesita cambios para Phase 1.
- **ESLint flat config** — `eslint.config.mjs` ya configurado con reglas Next.js + Web Vitals; D-02 es solo cambiar el script en `package.json`.
- **App Router scaffold** — `app/layout.tsx` y `app/page.tsx` ya renderizan; las nuevas boundaries (`error.tsx`, `loading.tsx`, `not-found.tsx`) son hermanas en `app/`.

### Established Patterns
- **Server components por defecto** — `error.tsx` debe ser client component (lleva `"use client"` por requerimiento de React error boundaries); `loading.tsx` y `not-found.tsx` pueden ser server components.
- **Tailwind v4** — usar clases inline para las nuevas boundaries; no crear archivos CSS adicionales.
- **Geist font ya cargada** — las boundaries heredan tipografía del root layout sin trabajo extra.

### Integration Points
- **`package.json` scripts** — punto de entrada para D-02 (`lint --max-warnings=0`), D-09 (`audit`, `typecheck`).
- **`.gitignore` raíz** — añadir entradas para `amplify_outputs.json`, `.amplify/`, `amplify/node_modules/`, `.env.local`.
- **`README.md`** — añadir sección "Setup" antes de cualquier "Getting Started" existente.
- **Repo root** — donde va el directorio `amplify/` (NO dentro de `app/` ni `src/`).

### Constraints / Gotchas
- **Bun + Amplify CLI**: `npx ampx ...` típicamente funciona pero puede haber edge cases con resolución de módulos. Researcher debe verificar si conviene usar `bunx` en su lugar, o documentar `npx` explícitamente.
- **Next.js 16 + React 19**: error boundaries y not-found tienen sintaxis ligeramente distinta a 14/15. Researcher debe leer docs locales en `node_modules/next/dist/docs/`.
- **AWS region us-east-1**: hay regiones donde Amplify Gen2 no está GA todavía (verificar). `us-east-1` es el seguro.

</code_context>

<specifics>
## Specific Ideas

- El `.env.example` debe ser **explícitamente didáctico** — comentarios explicando "esto NO es donde van las credenciales AWS, eso va en `~/.aws/credentials`". El usuario explícitamente pidió guía, no solo placeholders.
- README setup debe ser **step-by-step copy-pasteable** — no asume conocimiento previo de IAM. El usuario indicó preferencia "Step-by-step (Rec.)".
- Profile name sugerido: `datathon-2026` (matchea el directorio del repo — fácil de recordar).
- Region default sugerida: `us-east-1` (más servicios, menor latencia para US/LATAM).

</specifics>

<deferred>
## Deferred Ideas

Capturados durante la discusión pero fuera de Phase 1. No perderlos.

### Hacia phases futuras
- **Security headers en `next.config.ts`** (CSP, X-Frame-Options, etc.) — naturalmente cabe en Phase 5 cuando montamos Hosting/producción
- **Husky + lint-staged (pre-commit)** — útil pero no crítico; añadir cuando sintamos friction por ello
- **Metadata real en `app/layout.tsx`** — cuando se conozca la feature del datatón, actualizar título/descripción
- **Image domains en `next.config.ts`** — cuando aparezcan imágenes externas (avatars, etc.)
- **`.bunfig.toml` con pin de Bun version** — para CI consistency, naturalmente cabe en Phase 5
- **`amplify_outputs.example.json`** (sample committed) — overkill ahora; reconsiderar si entran más devs al repo

### Backlog
- Pre-commit hooks para ejecutar `bun run lint && bun run typecheck && bun run audit`

</deferred>

---

*Phase: 01-foundation-amplify-backend-skeleton*
*Context gathered: 2026-04-25*
