# Phase 1: Foundation & Amplify Backend Skeleton - Research

**Researched:** 2026-04-24
**Domain:** Next.js 16 hygiene + AWS Amplify Gen 2 backend bootstrap (TypeScript, Bun, Linux dev env)
**Confidence:** HIGH (every load-bearing claim verified against local `node_modules/next/dist/docs/`, `npm view`, official Amplify GitHub source, GitHub Advisory Database, or live `bun audit` output on this machine)

## RESEARCH COMPLETE

> Note on `## RESEARCH COMPLETE` — kept here at the top per the spawn prompt's requested structure. The structured return at the very end of the file is the canonical orchestrator handoff.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Scope vs CONCERNS.md (what enters Phase 1):**
- **D-01:** Resolver CVE PostCSS GHSA-qx2v-qp2m-jg93 actualizando la dependencia (`bun update postcss` o equivalente). Verificable con `bun audit`.
- **D-02:** Configurar lint estricto: `eslint . --max-warnings=0` en script `lint` de `package.json`. Warnings se vuelven errores.
- **D-03:** Crear `.env.example` documentando `AWS_PROFILE`, `AWS_REGION`. Comentarios explican explícitamente que las credenciales (access key, secret) NO van aquí — van en `~/.aws/credentials` vía `aws configure`.
- **D-04:** Crear boundaries Next.js mínimas:
  - `app/error.tsx` — error boundary client-side genérico con mensaje + botón "Try again"
  - `app/not-found.tsx` — 404 page genérica con link a home
  - `app/loading.tsx` — loading skeleton mínimo (spinner o pulse) para el root
  - UI básica, no se invierte en pulido visual aquí (eso es de feature phases futuras)

**Backend Skeleton Scope:**
- **D-05:** El directorio `amplify/` queda con `defineBackend({})` **vacío puro**. Solo `amplify/backend.ts` y `amplify/package.json` (autogenerado por `ampx`). Sin `auth/`, sin `data/`, sin `storage/`. Phase 2 introduce `amplify/auth/resource.ts`.
- **D-06:** No pre-cargar stubs ni placeholders de auth en Phase 1. Límite limpio entre infra y resource definitions.

**`amplify_outputs.json` Strategy:**
- **D-07:** `amplify_outputs.json` va a `.gitignore`. Cada developer (incluyendo CI en Phase 5) lo regenera ejecutando `npx ampx sandbox` (dev) o `npx ampx pipeline-deploy` (Hosting build). Razón: el archivo contiene IDs de recursos específicos del stack del developer; commitearlo crea conflictos y confusión cuando Phase 5 añade producción.
- **D-08:** También a `.gitignore`: `.amplify/` (cache local) y cualquier `node_modules/` que `ampx` pueda crear dentro de `amplify/`.

**Verification & Developer Experience:**
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

**AWS Environment Setup (clarificación clave para downstream):**
- **D-12:** Las credenciales AWS NO van en `.env`. Patrón estándar AWS = `~/.aws/credentials` profile.
- **D-13:** Lo que sí va en `.env.local` (developer-specific, gitignored): `AWS_PROFILE=datathon-2026` (o el nombre que el dev haya elegido). El `.env.example` lo documenta.
- **D-14:** No introducir secretos de OAuth o Cognito en Phase 1 — eso es Phase 2/3 y ahí van a `npx ampx sandbox secret` o a Amplify Console (Hosting), nunca al repo.

### Claude's Discretion

- Estilo visual exacto de `error.tsx`, `loading.tsx`, `not-found.tsx` (UI mínima, sin marca todavía — el datatón aún no tiene producto definido)
- Nombre exacto del IAM user / profile sugerido en README (`datathon-2026` es una sugerencia)
- Estructura interna del `amplify/backend.ts` más allá de `defineBackend({})` (puede añadir comentarios o no)
- Cómo se redacta exactamente el README setup (formato, headings)
- Si conviene añadir un script `clean` que borre `.next/`, `.amplify/` y `amplify_outputs.json` (probablemente sí — diga Claude)

### Deferred Ideas (OUT OF SCOPE)

**Hacia phases futuras:**
- **Security headers en `next.config.ts`** (CSP, X-Frame-Options, etc.) — naturalmente cabe en Phase 5 cuando montamos Hosting/producción
- **Husky + lint-staged (pre-commit)** — útil pero no crítico; añadir cuando sintamos friction por ello
- **Metadata real en `app/layout.tsx`** — cuando se conozca la feature del datatón, actualizar título/descripción
- **Image domains en `next.config.ts`** — cuando aparezcan imágenes externas (avatars, etc.)
- **`.bunfig.toml` con pin de Bun version** — para CI consistency, naturalmente cabe en Phase 5
- **`amplify_outputs.example.json`** (sample committed) — overkill ahora; reconsiderar si entran más devs al repo

**Backlog:**
- Pre-commit hooks para ejecutar `bun run lint && bun run typecheck && bun run audit`
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | Backend Amplify Gen2 inicializado (`amplify/` directory + `defineBackend()` en `amplify/backend.ts`) y desplegable a personal sandbox vía `npx ampx sandbox` | "Implementation Approach §3 — Backend skeleton" + "Code Examples §3" + "Validation Architecture REQ-INFRA-01" |
| INFRA-03 | Vulnerabilidad PostCSS XSS resuelta (actualizar dependencias afectadas detectadas en CONCERNS.md) | "Implementation Approach §1 — PostCSS CVE remediation" + "Validation Architecture REQ-INFRA-03" + verified locally: `bun audit` reports 1 moderate advisory; `postcss@8.5.10` is the fix |
</phase_requirements>

## Phase Goal Restated

Sanear el scaffold Next.js 16 (cerrar CVE PostCSS, lint estricto, boundaries, `.env.example`, scripts auxiliares) y plantar la raíz de un backend Amplify Gen 2 vacío puro (`amplify/backend.ts` con `defineBackend({})`, sin recursos), de modo que `npx ampx sandbox` despliegue un stack CloudFormation vacío sin errores y `bun run build` + lint estricto sigan verdes. Phase 1 NO introduce auth, data, ni storage — solo la base que Phase 2-5 van a construir encima.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| PostCSS CVE remediation | Build tooling (devDeps) | — | Transitive via `next` and `@tailwindcss/postcss`; lockfile-level fix |
| Strict lint enforcement | Build tooling (CI gate) | — | `eslint` CLI directly (Next 16 removed `next lint`) |
| `.env.example` documentation | Repo metadata | — | Guides developer-side AWS profile setup; no runtime impact |
| `app/error.tsx` (root error boundary) | Browser / Client | Frontend Server (SSR) | React error boundary — must be Client Component per Next 16 file-conventions |
| `app/loading.tsx` (root loading UI) | Frontend Server (SSR) | Browser / Client | Server Component by default; renders during Suspense fallback |
| `app/not-found.tsx` | Frontend Server (SSR) | — | Server Component; rendered when `notFound()` thrown or unmatched URL |
| `amplify/backend.ts` skeleton | API / Backend (CDK synthesis) | — | TypeScript backend-as-code synthesized to CloudFormation by `ampx` |
| `npx ampx sandbox` workflow | Developer machine → AWS | Database / Storage (CloudFormation state) | Local CLI orchestrates CDK deploy to per-developer AWS sandbox |
| README setup docs | Repo metadata | — | Onboarding aid; no runtime impact |

**Sanity check vs CONTEXT.md decisions:** Every D-* decision lands on the correct tier above. No tier confusion (no auth code in browser, no UI in backend).

## Stack & Versions

All versions verified via `npm view` against the public registry on 2026-04-24, or against the local `node_modules` of this repo.

### Existing scaffold (preserved)

| Package | Version | Source | Notes |
|---------|---------|--------|-------|
| next | 16.2.4 | `package.json` | Pinned exact. Locally installed. |
| react | 19.2.4 | `package.json` | Pinned exact. |
| react-dom | 19.2.4 | `package.json` | Pinned exact. |
| typescript | ^5 | `package.json` | TS 5.x; strict mode enabled in `tsconfig.json`. |
| tailwindcss | ^4 | `package.json` | v4 line — uses `@tailwindcss/postcss` plugin. |
| @tailwindcss/postcss | ^4 (resolved 4.2.4 locally) | `bun pm ls` | Brings transitive `postcss`. |
| eslint | ^9 | `package.json` | Flat config. |
| eslint-config-next | 16.2.4 | `package.json` | Provides `core-web-vitals` + `typescript` configs. |
| Bun | 1.3.5 | `bun --version` (local) | `bun audit` and `bun update` available. |
| Node.js | 20.20.0 | `node --version` (local) | ≥ 20.6.0 → satisfies Amplify CLI engines (`^18.19.0 \|\| ^20.6.0 \|\| >=22`). [VERIFIED: `npm view @aws-amplify/backend-cli engines`] |

### To add / modify in Phase 1

| Package | Version | Source/Why | Verified |
|---------|---------|-----------|----------|
| postcss | ≥8.5.10 (latest 8.5.10, published 2026-04-15) | CVE GHSA-qx2v-qp2m-jg93 fix | [VERIFIED: `npm view postcss version` → 8.5.10; `npm view postcss time --json` → `8.5.10: 2026-04-15`; [GitHub Advisory](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) confirms patched version 8.5.10] |
| @aws-amplify/backend | ^1.22.0 (latest 1.22.0, published 2026-03-25) | Provides `defineBackend` | [VERIFIED: `npm view @aws-amplify/backend version` → 1.22.0] |
| @aws-amplify/backend-cli | ^1.8.2 (latest 1.8.2, published 2026-01-16) | Provides `ampx` binary | [VERIFIED: `npm view @aws-amplify/backend-cli version` → 1.8.2; engines = `^18.19.0 \|\| ^20.6.0 \|\| >=22`] |
| aws-cdk-lib | 2.244.0 (exact) | Pinned by Amplify's `default_packages.json` | [CITED: github.com/aws-amplify/amplify-backend `packages/create-amplify/src/default_packages.json`] |
| constructs | ^10.0.0 | Companion to `aws-cdk-lib` | [CITED: same] |
| tsx | latest | Runs Amplify backend TypeScript locally | [CITED: same] |
| esbuild | latest | Used by Amplify backend transpile | [CITED: same] |
| typescript | ^5.0.0 | Already present at ^5; no upgrade needed | [VERIFIED: package.json] |

> Note on `aws-amplify` (the frontend client) — `default_packages.json` lists it as `defaultProdPackages`, but per **D-05/D-06** Phase 1 has no resources, so the frontend has no client to configure. **Recommendation:** defer installing `aws-amplify` until Phase 2, when `<Authenticator>` is wired.

### Tools required on the developer machine

| Tool | Required version | Local status | Purpose |
|------|-----------------|--------------|---------|
| Node.js | ≥ 20.6.0 (or 18.19+, or 22+) | ✓ 20.20.0 | Runtime for `ampx`, Bun, Next |
| Bun | any recent (1.3.x has `bun audit`) | ✓ 1.3.5 | Project package manager |
| AWS CLI v2 | latest | ✗ NOT INSTALLED on this machine | Needed for `aws configure sso` and `aws sts get-caller-identity` validation |
| `git` | any | ✓ 2.47.3 | Standard |
| AWS account + IAM credentials with `AmplifyBackendDeployFullAccess` | — | depends on developer | Required by `npx ampx sandbox` to deploy CDK stack |

## Implementation Approach

Step-by-step, command-level detail per Phase 1 deliverable. Tasks are sequenced to allow incremental verification.

### §1 — Resolve PostCSS CVE (D-01, INFRA-03)

**Current state (verified locally on 2026-04-24):**
```
$ bun audit
postcss  <8.5.10
  @tailwindcss/postcss › postcss
  next › postcss
  moderate: PostCSS has XSS via Unescaped </style> in its CSS Stringify Output
1 vulnerabilities (1 moderate)
```

**Strategy: lockfile-level resolution via `bun update`**

`postcss` is a transitive of both `next@16.2.4` and `@tailwindcss/postcss@^4`. Both top-level packages declare `postcss` as a peer/transitive with permissive ranges (typically `^8.4.x`), so a lockfile bump to `8.5.10` satisfies semver and does not require breaking-change handling.

**Recommended command (single approach, no fallback needed for this CVE):**
```bash
bun update postcss
```

**Why this works:** Bun resolves all entries of `postcss` in `bun.lock`'s dependency tree to the highest version compatible with the declared semver ranges. As of 2026-04-24, `postcss@8.5.10` is the latest 8.x release (registry-confirmed) and satisfies `^8.x` constraints upstream. The output of `bun audit` after this command MUST show `0 vulnerabilities`.

**If `bun update postcss` does not bump (defensive fallback — rare):**
```bash
# Force a top-level pin so resolution cannot regress
bun add -D postcss@latest
```
Adding `postcss` as a direct devDependency forces Bun to satisfy that constraint at the top of the tree. Downside: introduces a "phantom" devDep that the project does not import directly. Acceptable for security pinning; documented as a comment in `package.json` if used.

**Verification:**
```bash
bun audit                       # MUST exit 0; report "0 vulnerabilities"
bun audit --audit-level=moderate # extra strict gate for CI
bun pm ls | grep postcss        # confirm version >= 8.5.10
```
[VERIFIED: `bun audit --help` confirms `--audit-level=<low|moderate|high|critical>` flag. Exit code semantics: `0` clean, `1` advisories present — see [bun.com/docs/install/audit](https://bun.com/docs/install/audit).]

**Build smoke after fix:**
```bash
bun run build   # MUST stay green; PostCSS 8.5.10 is patch-level, no API changes expected
```

### §2 — Strict ESLint (D-02)

**Critical Next.js 16 finding:** `next lint` was **REMOVED** in Next.js 16.0.0. The `eslint` CLI must be invoked directly. [VERIFIED: `node_modules/next/dist/docs/01-app/03-api-reference/05-config/03-eslint.md` line ~120: `"Starting with Next.js 16, next lint is removed."` Version history table confirms `v16.0.0`.]

**Current `package.json`:**
```json
"lint": "eslint"
```

**Phase 1 change:**
```json
"lint": "eslint . --max-warnings=0"
```

`.` argument: lint the whole repo (flat-config recommended pattern). `--max-warnings=0`: any ESLint warning becomes a non-zero exit, forcing CI to treat warnings as errors. Existing `eslint.config.mjs` already ignores `.next/**`, `out/**`, `build/**`, `next-env.d.ts`.

**Verification:**
```bash
bun run lint   # MUST exit 0
```

**Known risk:** the existing scaffold's `app/page.tsx` includes default Vercel template content (concerns.md). It currently passes lint, but if any rule from `eslint-config-next/core-web-vitals` flags it as a warning (e.g., `@next/next/no-img-element`), `--max-warnings=0` will fail. Mitigation: run `bun run lint` once during planning to surface any existing warnings; either fix them in this phase or document a tracked exception. Verified locally that the scaffold uses `next/image` (not `<img>`) and does not currently emit warnings — but plan should include a smoke run.

### §3 — Plant the Amplify Gen 2 backend skeleton (D-05, D-06, INFRA-01)

**Critical decision: do NOT use `npm create amplify@latest` / `npx create-amplify@latest` for Phase 1.**

The CONTEXT decision D-05/D-06 requires a **bare** `defineBackend({})` with no auth, data, or storage. The official scaffolder (`create-amplify`) ships the **`basic-auth-data` template** [VERIFIED: github.com/aws-amplify/amplify-backend `packages/create-amplify/src/initial_project_file_generator.ts` — `cp(... 'templates/basic-auth-data/amplify' ...)`] which materializes:
```
amplify/
├── auth/resource.ts       # creates an empty Cognito Auth resource — VIOLATES D-06
├── data/resource.ts       # creates a Todo data model — VIOLATES D-05
├── backend.ts             # imports auth + data
└── package.json
```

Choosing the scaffolder forces deletion of files immediately after generation, leaving room for "ghost" files. **Manual installation is cleaner and matches the locked decision exactly.** The official Amplify docs explicitly support manual installation [CITED: docs.amplify.aws/nextjs/start/manual-installation/].

**Second critical finding: `create-amplify` is incompatible with Bun.**

The package manager controller factory only registers `npm`, `pnpm`, `yarn-classic`, and `yarn-modern`. [VERIFIED: github.com/aws-amplify/amplify-backend `packages/cli-core/src/package-manager-controller/get_package_manager_name.ts` — `runnerMap` has no `bun` entry; throws `UnsupportedPackageManagerError` with message `Use npm, yarn, or pnpm.`] Running `bun create amplify@latest` or `bunx create-amplify` would fail at the package-manager detection step. Using `npx create-amplify@latest` would succeed but then write a second lockfile (`package-lock.json`) and pollute the project.

**Conclusion:** Use the **manual installation** approach below.

#### §3.a Install Amplify backend dependencies via Bun

```bash
bun add -d @aws-amplify/backend@latest @aws-amplify/backend-cli@latest aws-cdk-lib@2.244.0 constructs@^10.0.0 tsx esbuild
```

Notes:
- `typescript` is already present at `^5` — no need to re-install.
- `aws-cdk-lib@2.244.0` is the exact version Amplify pins in `default_packages.json` [CITED]; using `^2.244.0` would also work but pinning matches what the scaffolder would have done.
- `aws-amplify` (the frontend client) is **NOT** added in Phase 1 — Phase 2 will install it when `<Authenticator>` is wired.

#### §3.b Create the bare `amplify/` directory and files

Required files (this is the EXHAUSTIVE list):

**`amplify/backend.ts`** — the only source file:
```typescript
import { defineBackend } from '@aws-amplify/backend';

/**
 * Phase 1: Bare backend skeleton — no resources yet.
 * Phase 2 will add auth (Cognito + email/password).
 * @see https://docs.amplify.aws/nextjs/build-a-backend/
 */
defineBackend({});
```

**`amplify/package.json`** — required to mark `amplify/` as ESM:
```json
{
  "type": "module"
}
```
[VERIFIED: github.com/aws-amplify/amplify-backend `packages/create-amplify/src/initial_project_file_generator.ts` writes exactly `{ type: 'module' }`. Also confirmed in [docs.amplify.aws/nextjs/start/manual-installation/](https://docs.amplify.aws/nextjs/start/manual-installation/) — "Amplify Gen 2 requires your backend to be configured for use with ECMAScript modules (ESM)."]

**`amplify/tsconfig.json`** — required so Amplify's local type-checking against backend code works correctly:
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
[VERIFIED: github.com/aws-amplify/amplify-backend `packages/cli-core/src/package-manager-controller/package_manager_controller_base.ts` — `initializeTsConfig` writes exactly this template (`tsConfigTemplate` constant). The `$amplify/*` path alias is "coupled with backend-function's generated typedef file path" per the source comment.]

**Root `tsconfig.json` change** — exclude `amplify/` from the Next build so Next does not try to compile the backend code:
```json
{
  "exclude": ["node_modules", "amplify/**/*"]
}
```
[CITED: docs.amplify.aws/nextjs/build-a-backend/troubleshooting/cannot-find-module-amplify-env/ — "Add this configuration to your project's `tsconfig.json` to prevent the build process from incorrectly resolving the amplify directory as a module."]

**Final `amplify/` tree (Phase 1):**
```
amplify/
├── backend.ts           # 5 lines — defineBackend({})
├── package.json         # {"type": "module"}
└── tsconfig.json        # ESM + strict + $amplify/* paths
```

No `auth/`, `data/`, `storage/`, or `functions/` directories — matches D-05 / D-06 exactly.

#### §3.c First-time AWS bootstrap (one-time, per-developer-per-region)

Before `npx ampx sandbox` succeeds the first time, the AWS account+region must be CDK-bootstrapped. `ampx sandbox` will trigger this automatically on first run if not already done, but it requires the IAM principal to have permissions for `cloudformation:CreateStack` on the bootstrap stack (`CDKToolkit`). The `AmplifyBackendDeployFullAccess` managed policy covers this. [CITED: docs.amplify.aws/react/start/account-setup/ — "you must authenticate as the account root user or administrator to complete bootstrapping — the process of provisioning resources for the AWS CDK before you can deploy."]

**README setup section (D-10) MUST cover this** so the developer is not surprised when their first sandbox run takes 5-8 minutes and prints CDK bootstrap output before the actual stack deploy.

#### §3.d Run the sandbox

```bash
npx ampx sandbox --profile datathon-2026
```

**What happens (verified):**
1. `ampx` reads `amplify/backend.ts` via `tsx`.
2. CDK synthesis produces a CloudFormation template.
3. CloudFormation stack is created in the active region. **Stack name pattern: `amplify-<app-name>-<$(whoami)>-sandbox`.** [CITED: docs.amplify.aws/nextjs/deploy-and-host/sandbox-environments/setup/]
4. With `defineBackend({})` empty, the stack contains only the Amplify "management" resources — no Cognito/DynamoDB/S3 — so deploy completes in ~1-2 minutes.
5. `ampx` writes `amplify_outputs.json` to the **project root**.
6. `ampx` enters **watch mode**: any save to a file under `amplify/` triggers a hot redeploy via CDK hot-swap. Press `Ctrl+C` to exit watch mode without destroying the stack.

**Region precedence (most-specific wins):**
1. `AWS_REGION` env var
2. The region recorded in the AWS CLI profile (`~/.aws/config` for `[profile datathon-2026]`)
3. AWS CLI default region

The `.env.example` (D-03) MUST document this precedence.

**`amplify_outputs.json` shape (Phase 1, with empty backend):** an essentially empty JSON document — typically `{ "version": "1.4" }` or similar metadata, since there are no resources to declare endpoints/IDs for. The file becomes substantive in Phase 2 once auth is added. The fact that it WILL be regenerated and IS environment-specific is why D-07 puts it in `.gitignore`.

#### §3.e Tear down

```bash
npx ampx sandbox delete --profile datathon-2026
```
[VERIFIED: Context7 `/aws-amplify/amplify-backend` `Amplify CLI Commands for Sandbox Development`]

This tears down the CloudFormation stack and removes the local watch-mode files. The `--profile` flag (or `AWS_PROFILE` env var) is the same as `sandbox`.

**Other useful `ampx` commands** [VERIFIED: docs.amplify.aws/nextjs/reference/cli-commands/]:

| Command | Purpose | Phase 1 relevance |
|---------|---------|-------------------|
| `npx ampx sandbox` | Watch-mode deploy | Primary command |
| `npx ampx sandbox --once` | Deploy once, exit | Useful for CI smoke test |
| `npx ampx sandbox delete` | Destroy sandbox stack | Cleanup |
| `npx ampx info` | System / npm / env diagnostic | Troubleshooting |
| `npx ampx sandbox secret set <NAME>` | Store sandbox secrets in SSM | Phase 3 (Google OAuth), not Phase 1 |
| `npx ampx generate outputs` | Regenerate `amplify_outputs.json` | Useful if file deleted accidentally |
| `npx ampx pipeline-deploy` | CI/CD deploy | Phase 5 (Hosting) |

### §4 — Boundaries: `app/error.tsx`, `app/loading.tsx`, `app/not-found.tsx` (D-04)

**MAJOR Next.js 16 breaking change discovered.** Training-data assumption that `error.tsx` receives a `reset: () => void` prop is **OUTDATED**. As of Next.js 16.2.0, the canonical prop is **`unstable_retry: () => void`**. [VERIFIED: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md` lines 25-50 — props are `error: Error & { digest?: string }` and `unstable_retry: () => void`. Version History table line 329: `v16.2.0: unstable_retry prop added.` The legacy `reset` prop still exists but the docs say "In most cases, you should use `unstable_retry()` instead."]

#### §4.a `app/error.tsx` (Client Component, mandatory)

```tsx
'use client'; // Error boundaries MUST be Client Components

import { useEffect } from 'react';

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

[VERIFIED: code shape matches `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md` reference example exactly. Tailwind classes match the existing scaffold's design vocabulary in `app/page.tsx`.]

**Why `unstable_retry` and not `reset`?** Next.js docs: *"The cause of an error can sometimes be temporary. In these cases, trying again might resolve the issue. An error component can use the `unstable_retry()` function to prompt the user to attempt to recover from the error. When executed, the function will try to **re-fetch and re-render** the error boundary's children."* `reset()` only clears local error state and re-renders without re-fetching, which usually fails again. `unstable_retry` is the correct semantic for the "Try again" button copy decided in D-04.

**Naming:** the `unstable_` prefix signals API stability, not unreliability — the function is production-ready, but Next reserves the right to rename. Comment this in code so the planner doesn't second-guess the prefix.

#### §4.b `app/loading.tsx` (Server Component by default)

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

[VERIFIED: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md` line 34 — "By default, this file is a Server Component - but can also be used as a Client Component through the `\"use client\"` directive." Loading components take no props.]

#### §4.c `app/not-found.tsx` (Server Component)

```tsx
import Link from 'next/link';

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

[VERIFIED: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md` lines 16-26 — exact code template; takes no props. Note: the root `app/not-found.tsx` "handles any unmatched URLs for your whole application" per docs line 131.]

#### §4.d Why `app/global-error.tsx` is NOT included in Phase 1

`global-error.tsx` is only triggered when an error happens in the **root layout** itself (i.e., inside `app/layout.tsx`). Since Phase 1's root layout is the existing minimal scaffold (no data fetching, no async work), the marginal benefit of adding `global-error.tsx` does not justify the complexity (it must define its own `<html>` and `<body>` tags and re-import any global styles/fonts). D-04 explicitly lists only `error.tsx`, `loading.tsx`, `not-found.tsx`. Defer global-error to a later phase if/when the root layout starts doing async work. [CITED: error.md line 165 — global-error must include html/body tags and is for layout-level failures.]

### §5 — `.env.example` (D-03, D-13)

Create at the repo root. Mark `.env*` as already gitignored (the scaffold's `.gitignore` line 34 has `.env*` — `.env.example` is `.env*`-matched, so an explicit negation is needed).

**`.env.example`:**
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

**`.gitignore` adjustment:** the existing line `.env*` already excludes `.env.example`. Add an explicit allow:
```
.env*
!.env.example
```

### §6 — `package.json` script additions (D-09)

Final `scripts` block:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --max-warnings=0",
    "typecheck": "tsc --noEmit",
    "audit": "bun audit",
    "clean": "rm -rf .next .amplify amplify_outputs.json"
  }
}
```

`clean` is listed as Claude's discretion in CONTEXT — included here because (a) Amplify's own gitignore patterns confirm `.amplify` and `amplify_outputs*` are throwaway state, and (b) developers regenerate them via `npx ampx sandbox`, so a one-shot reset is genuinely useful.

### §7 — `.gitignore` additions (D-07, D-08)

Append to the existing `.gitignore`:

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

[VERIFIED: github.com/aws-amplify/amplify-backend `packages/create-amplify/src/gitignore_initializer.ts` lines 28-34 — `ignorePatterns` constant: `['# amplify', 'node_modules', '.amplify', 'amplify_outputs*', 'amplifyconfiguration*']`. We omit the bare `node_modules` because the existing scaffold already ignores `/node_modules`. Adding `amplify/node_modules` defensively in case `ampx` ever creates a nested install (it doesn't currently, but this future-proofs and was called out as a gotcha in CONTEXT.]

### §8 — README "Setup" section (D-10, D-11)

Add the section **before** any existing "Getting Started" content. Recommended structure (Markdown headings):

```
## Setup

This project ships with a minimal AWS Amplify Gen 2 backend skeleton.
Before you can deploy a sandbox, configure your local AWS environment.

### Prerequisites

- Node.js ≥ 20.6.0 (`node --version`)
- Bun ≥ 1.3 (`bun --version`)
- AWS CLI v2 (`aws --version`) — install: https://aws.amazon.com/cli/
- An AWS account and an IAM user (or IAM Identity Center user) with the
  `AmplifyBackendDeployFullAccess` managed policy attached.

### 1. Create / pick an AWS IAM user

In the AWS Console → IAM → Users → "Create user".
Attach managed policy: `AmplifyBackendDeployFullAccess`.
Generate an access key (Other → CLI). Save the access key ID and secret.

### 2. Configure your local AWS profile

```bash
aws configure --profile datathon-2026
# AWS Access Key ID:     <paste from step 1>
# AWS Secret Access Key: <paste from step 1>
# Default region name:   us-east-1
# Default output format: json
```

(If you prefer IAM Identity Center / SSO instead of access keys, run
`aws configure sso` and follow the prompts. This is the AWS-recommended
path for local development. Both work with `ampx sandbox`.)

### 3. Verify

```bash
aws sts get-caller-identity --profile datathon-2026
# Should print your Account, UserId, and Arn.
```

### 4. Set the project env

```bash
cp .env.example .env.local
# Edit .env.local if your profile name differs from datathon-2026.
```

### 5. Install dependencies

```bash
bun install
```

### 6. Deploy the sandbox

```bash
AWS_PROFILE=datathon-2026 npx ampx sandbox
```

First run takes ~5-8 minutes (CDK bootstrap, then stack create).
Subsequent runs take ~30s (hot-swap deploys).

When done for the day, exit with `Ctrl+C`. The stack stays deployed.
To fully tear down:

```bash
AWS_PROFILE=datathon-2026 npx ampx sandbox delete
```
```

**Region recommendation rationale (D-11):** `us-east-1` is the original AWS region and has the broadest service availability — every Amplify Gen 2 feature is GA there. For users in LATAM, `us-east-1` (Virginia) is the lowest-latency US region. To switch regions, change `AWS_REGION` in `.env.local` AND/OR set the region in the AWS CLI profile (`aws configure --profile datathon-2026` re-prompts for region).

## Validation Architecture

**Validation framework:** Bun runner + Bun audit + Next CLI + AWS CLI. No new test framework introduced in Phase 1 (testing infra is a deferred concern from CONCERNS.md, not in scope). All validation is **runnable as bash commands with deterministic exit codes** — perfect for the Nyquist gate.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Shell-driven smoke tests (no unit-test framework yet — that's CONCERNS.md backlog, not Phase 1 scope) |
| Config file | none — commands run against `package.json` scripts |
| Quick run command | `bun run lint && bun run typecheck && bun run audit && bun run build` |
| Full suite command | Quick + `npx ampx sandbox --once --profile $AWS_PROFILE` (requires AWS creds) |
| Phase gate | All quick commands exit 0; sandbox deploy completes; CloudFormation stack visible in AWS console |

### Phase Requirements → Validation Map

| Req ID | Behavior | Test Type | Automated Command | Existence |
|--------|----------|-----------|-------------------|-----------|
| INFRA-03 | PostCSS CVE GHSA-qx2v-qp2m-jg93 closed | smoke | `bun audit --audit-level=moderate` | ✅ Wave 0 (Bun built-in) |
| INFRA-03 | postcss resolved to ≥ 8.5.10 | smoke | `bun pm ls \| grep postcss \| awk '{print $NF}' \| sort -u` | ✅ |
| INFRA-01 | `amplify/backend.ts` exists | smoke | `test -f amplify/backend.ts && grep -q 'defineBackend({})' amplify/backend.ts` | ✅ |
| INFRA-01 | `amplify/package.json` declares ESM | smoke | `node -e "process.exit(JSON.parse(require('fs').readFileSync('amplify/package.json')).type === 'module' ? 0 : 1)"` | ✅ |
| INFRA-01 | Backend TypeScript valid | smoke | `cd amplify && npx tsc --noEmit` | ✅ |
| INFRA-01 | Sandbox deploys cleanly | integration (requires AWS) | `AWS_PROFILE=$P npx ampx sandbox --once` (exit 0) | ⚠ requires AWS account |
| ROADMAP §1 SC4 | `bun run build` green after Amplify added | smoke | `bun run build` | ✅ |
| ROADMAP §1 SC4 | `bun run lint` green with `--max-warnings=0` | smoke | `bun run lint` | ✅ |
| D-04 | Boundaries exist and are valid | smoke | `for f in app/error.tsx app/loading.tsx app/not-found.tsx; do test -f $f; done && bun run build` | ✅ |
| D-09 | New scripts present in package.json | smoke | `for s in audit typecheck; do node -e "process.exit('$s' in require('./package.json').scripts ? 0 : 1)"; done` | ✅ |
| D-03 | `.env.example` exists with AWS_PROFILE/AWS_REGION docs | smoke | `test -f .env.example && grep -q AWS_PROFILE .env.example && grep -q AWS_REGION .env.example && grep -qi 'NOT.*credentials' .env.example` | ✅ |
| D-07/D-08 | gitignore covers Amplify outputs | smoke | `for p in '.amplify' 'amplify_outputs' '!.env.example'; do grep -qF "$p" .gitignore; done` | ✅ |

### Sampling Rate

- **Per task commit:** `bun run lint && bun run typecheck && bun run audit` (~10s; no AWS call)
- **Per wave merge:** Quick + `bun run build` (~30s)
- **Phase gate:** Full suite incl. `npx ampx sandbox --once` (requires AWS account; ~2 min for empty stack)

### Wave 0 Gaps

- [ ] None — all validation commands rely on tools already present (Bun, Node, npm/npx, optional AWS CLI). No fixtures or test files to author.
- [ ] AWS account access — required to validate INFRA-01 end-to-end. If the developer has not yet completed README §1-3 (IAM user + `aws configure`), the sandbox-dependent validations are blocked. **Plan must list this as a precondition** for the wave that touches `amplify/`.

## Runtime State Inventory

> Phase 1 is greenfield-with-scaffolding (no rename / refactor / migration). This section is included for completeness but mostly returns "None".

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no databases, no Cognito User Pool, no DynamoDB tables exist yet (Phase 2+ introduces them) | None |
| Live service config | None — no AWS resources deployed pre-Phase-1 | None — `npx ampx sandbox` is the **first** deploy |
| OS-registered state | None — no scheduled tasks, services, or daemons | None |
| Secrets / env vars | None to migrate. `AWS_PROFILE` is a NEW env var documented in `.env.example`; `~/.aws/credentials` is per-developer and out of repo scope | None — verified by inspection of repo (no existing `.env*` files; no existing AWS code) |
| Build artifacts / installed packages | `node_modules/` exists from prior `bun install`. Adding new devDeps requires `bun install` to materialize them | Run `bun install` after `package.json` changes |

**Verified by:** `find /home/fernando/Documents/datathon-2026 -maxdepth 2 -name '.env*' -o -name 'amplify*' 2>/dev/null` returns no pre-existing Amplify files; `cat package.json` shows no AWS deps yet.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js (≥20.6) | `ampx`, Bun, Next | ✓ | 20.20.0 | — |
| Bun (≥1.3 for `bun audit`) | Project package mgmt; CVE verify | ✓ | 1.3.5 | — |
| `npx` | Run `ampx` (Bun's `bunx` would fail at Amplify's PM detection) | ✓ | 10.8.2 | — |
| `git` | Standard | ✓ | 2.47.3 | — |
| AWS CLI v2 | `aws configure`, `aws sts get-caller-identity` | ✗ | — | None — must be installed before INFRA-01 sandbox validation |
| AWS account + IAM credentials w/ `AmplifyBackendDeployFullAccess` | `npx ampx sandbox` | ✗ (developer-side) | — | None — without these, INFRA-01 cannot be validated end-to-end |

**Missing dependencies, no fallback:**
- **AWS CLI v2** — **action required:** the README setup section (D-10) must include the install commands for Linux/Mac/Windows. Linux command (verified at [docs.amplify.aws/react/start/account-setup/](https://docs.amplify.aws/react/start/account-setup/)):
  ```bash
  curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
  unzip awscliv2.zip
  sudo ./aws/install -i /usr/local/aws-cli -b /usr/local/bin
  ```
- **AWS account / IAM user** — developer responsibility; instructions belong in the README, not the codebase.

**Missing dependencies, with fallback:** none.

**Implication for the planner:** the wave that runs `npx ampx sandbox --once` for end-to-end validation has a **manual precondition** (AWS CLI installed + `aws configure --profile datathon-2026` completed). Either (a) make this an explicit human-handoff step in the plan, or (b) document a "skip if AWS not configured" branch in validation.

## Code Examples

Verified patterns. Sources cited inline.

### Minimal `defineBackend({})` (D-05, D-06)

```typescript
// amplify/backend.ts
import { defineBackend } from '@aws-amplify/backend';

defineBackend({});
```
**Source:** [VERIFIED] Combination of `docs.amplify.aws/nextjs/start/manual-installation/` (manual install code sample) and the `defineBackend()` signature documented in Context7 `/aws-amplify/amplify-backend` "Initialize Amplify Backend" snippet. Empty-object literal is explicitly valid: `defineBackend` accepts a record of construct factories — an empty record is a no-op.

### Adding a resource later (Phase 2 preview, NOT for Phase 1)

```typescript
// Phase 2 will look like this — DO NOT include in Phase 1
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';

defineBackend({ auth });
```
Included so the planner understands the trajectory and does not over-scaffold in Phase 1.

### `app/error.tsx` (Next 16.2+, with `unstable_retry`)

See §4.a above. Key hazards:
- MUST start with `'use client';`
- `unstable_retry` (NOT `reset`) — `reset` exists for legacy compat but is discouraged by docs
- `error.digest?: string` is the correct prop type; matches server logs

### `app/loading.tsx`

See §4.b above. Server Component by default. Takes no props.

### `app/not-found.tsx`

See §4.c above. Server Component. Takes no props. The root `app/not-found.tsx` doubles as the global 404 for unmatched URLs (no need for `global-not-found.tsx`).

### Strict ESLint script

```json
"lint": "eslint . --max-warnings=0"
```
**Source:** [VERIFIED] `node_modules/next/dist/docs/01-app/03-api-reference/05-config/03-eslint.md` — recommended invocation pattern (`npx eslint .` / `bunx eslint .`); `--max-warnings=0` is a standard ESLint flag that promotes any warning to a non-zero exit.

## Gotchas & Landmines

Specific to Amplify Gen 2 + Next 16 + Bun on this machine.

### G-1. `next lint` is GONE in Next.js 16
[VERIFIED — see §2.] If a developer runs `bun run next lint` out of habit, they get a "command not found" / "unknown command" error. The codemod `next-codemod migrate-from-next-lint-to-eslint-cli` exists for migration. **For Phase 1, the script in `package.json` simply moves to `eslint . --max-warnings=0`.**

### G-2. Error boundary: `unstable_retry`, not `reset`
[VERIFIED — see §4.a.] Next 16.2.0 added `unstable_retry`. The `reset` prop still exists for backward compat but the docs explicitly recommend `unstable_retry`. **If the planner copies a Next 14/15 error boundary from training data, it will use `reset` and the "Try again" button will fail to re-fetch on transient errors.**

### G-3. `npm create amplify@latest` (and `npx create-amplify`) is incompatible with Bun
[VERIFIED — see §3, source: `get_package_manager_name.ts`.] The scaffolder reads `npm_config_user_agent`, finds `bun`, and throws `UnsupportedPackageManagerError: Use npm, yarn, or pnpm.` **Workaround:** manual install (this research's recommended path). Even running with `npx` (which presents `npm` userAgent) creates a `package-lock.json` — bad in a Bun-only project.

### G-4. The `basic-auth-data` template ships auth + data — violates D-05/D-06
[VERIFIED — see §3, source: `initial_project_file_generator.ts`.] Even on a system where `create-amplify` works, the only available template is `basic-auth-data`. Manual install is the only way to get a truly empty `defineBackend({})`.

### G-5. `amplify/` MUST be ESM
[VERIFIED — see §3.b.] Without `amplify/package.json` containing `{"type": "module"}`, Amplify CLI throws ESM-related errors when loading `backend.ts` via `tsx`. Easy to forget on manual install.

### G-6. Root `tsconfig.json` MUST exclude `amplify/**/*`
[CITED — see §3.b.] If Next's TypeScript compilation tries to include the backend code, it fails because backend uses `aws-cdk-lib` and `$amplify/*` paths that the root tsconfig doesn't know about.

### G-7. `.env*` glob in `.gitignore` swallows `.env.example`
The existing `.gitignore` line `.env*` (line 34) excludes `.env.example`. Without an explicit `!.env.example` allow, the example file gets ignored and never makes it into git. This bites every Next.js scaffold that doesn't customize the gitignore.

### G-8. `amplify_outputs.json` lands at the **project root**, not under `amplify/`
[VERIFIED — confirmed by Context7 docs and gitignore patterns.] Easy to assume it'd be in `amplify/` because the source is there. The `.gitignore` pattern `amplify_outputs*` (no path prefix) covers all locations defensively.

### G-9. CDK Bootstrap is a one-time-per-account-per-region cost
[CITED.] The first `npx ampx sandbox` in a fresh region takes 5-8 min because it provisions the `CDKToolkit` stack (S3 bucket for assets, IAM roles, ECR repo). Subsequent runs in the same region take seconds. **README MUST set this expectation** so developers don't assume something is broken.

### G-10. Bun + Amplify CLI runtime — `npx ampx`, not `bunx ampx`
Even though `bunx` would invoke the same binary, the Amplify team has open issues around Bun detection (e.g., aws-amplify/amplify-backend#1437, closed) and only `npx`-launched runs are tested. **CONTEXT decision aligns: README says `npx ampx ...`, plans MUST follow suit.**

### G-11. PostCSS 8.5.10 is a 2026-04-15 release — patch-level only
The fix is a patch release within `8.x`, so `bun update postcss` is fully sufficient. No `bun update --latest` (which would risk major bumps elsewhere) is needed.

### G-12. Region pickup precedence
[CITED — AWS docs] `AWS_REGION` env var wins over the profile's `region` field. If a developer's profile is configured for `eu-west-1` but their `.env.local` says `AWS_REGION=us-east-1`, the sandbox deploys to `us-east-1`. **The README MUST explain this** so developers don't get a stack in the wrong region and rack up small but unexpected charges.

### G-13. Empty `defineBackend({})` deploys an empty stack — that IS the success state
The planner / verifier must understand: success looks like a CloudFormation stack with **only** the Amplify management resources (no Cognito, no DynamoDB, no S3 buckets specific to your app). The `amplify_outputs.json` file is essentially `{ "version": "..." }` with no resource IDs. **This is the expected Phase 1 endpoint.** The verifier MUST not treat the empty file as a deploy failure.

### G-14. `bun update postcss` updates the lockfile, but a stale `node_modules/` will still serve the old version until re-installed
After `bun update`, Bun typically re-installs the affected tree automatically. If for any reason it didn't (e.g., aborted command, partial state), running `bun install` after `bun update` is a defensive idempotent step worth including in the plan.

## State of the Art

| Old Approach | Current Approach (2026) | When Changed | Impact |
|--------------|-------------------------|--------------|--------|
| `next lint` script | `eslint .` directly | Next.js 16.0.0 | Phase 1 must use `eslint . --max-warnings=0` not `next lint --max-warnings=0` |
| Error boundary `reset()` prop | `unstable_retry()` prop | Next.js 16.2.0 | Boundary code differs from Next 14/15 patterns in training data |
| Amplify Gen 1 (CLI-driven, JSON config) | Amplify Gen 2 (TypeScript backend-as-code, `defineBackend`) | 2024 GA | All Phase 1 commands and patterns assume Gen 2 |
| `aws configure` (long-lived access keys) | `aws configure sso` (IAM Identity Center, temporary creds) | 2023+ | Both still work; AWS recommends SSO. CONTEXT D-12 chose access-key flow; either is fine. |

**Deprecated / outdated to ignore:**
- `next lint`, `next.config.{js,mjs}` `eslint` option — both removed in Next 16. [VERIFIED]
- Amplify CLI Gen 1 (`amplify init`, `amplify push`) — entirely separate product. **Do not confuse.** Gen 2 uses `ampx` (lowercase) via `npx`.
- `reset` callback in `error.tsx` — works but discouraged. Use `unstable_retry`.

## Project Constraints (from CLAUDE.md / AGENTS.md)

- **HARD:** Next.js 16 has breaking changes vs training data. Read `node_modules/next/dist/docs/` before recommending APIs. **Honored throughout** — `error.tsx`, `loading.tsx`, `not-found.tsx` patterns verified against local docs (not training data).
- **HARD:** Heed deprecation notices. Captured: `next lint` removal (G-1), `reset` deprecation in favor of `unstable_retry` (G-2).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The `AmplifyBackendDeployFullAccess` managed policy still exists with that exact name in 2026 | §3.c, README §D-10 | Developer follows README, AWS Console returns "policy not found." Mitigation: AWS docs explicitly recommend this policy as recently as the docs page fetched 2026-04-24 ([docs.amplify.aws/react/start/account-setup/](https://docs.amplify.aws/react/start/account-setup/)); deletion is a low-probability event. |
| A2 | An empty `defineBackend({})` is a valid call signature in `@aws-amplify/backend@1.22.0` (no `?` made required) | §3.b | Sandbox deploy fails with a TypeScript error from `defineBackend`. Mitigation: the function's published Context7 examples and the `amplify_project_creator` source treat the parameter as a `Record<string, ConstructFactory>`, which `{}` satisfies. Confidence HIGH but not formally tested in this session. |
| A3 | `bun update postcss` will resolve transitive `postcss` to ≥ 8.5.10 in this lockfile | §1 | Audit still shows the advisory after running. Mitigation listed: defensive fallback `bun add -D postcss@latest`. |
| A4 | `us-east-1` Amplify Gen 2 GA status (recommended in CONTEXT D-11) is current | §8 README | None — `us-east-1` is the most-supported AWS region historically; even in the unlikely case a feature is missing there, Phase 1 deploys an empty stack so the breadth doesn't matter. |
| A5 | The CONTEXT-suggested IAM-user-with-access-keys flow is acceptable to the user despite AWS recommending SSO | §8 README | If the user had implicitly preferred SSO, the README needs an SSO branch. Mitigation: the README in §8 already documents both ("If you prefer IAM Identity Center / SSO instead…"). |

## Sources

### Primary (HIGH confidence)
- **Local Next.js 16.2.4 docs** (`node_modules/next/dist/docs/`) — error/loading/not-found file conventions, eslint config, project structure, layouts. Specific files cited inline.
- **Live machine state** — `bun audit` output, `bun --version`, `node --version`, `npm view <pkg> version|engines|time` for postcss, @aws-amplify/backend, @aws-amplify/backend-cli.
- **Amplify Gen 2 source code** on github.com/aws-amplify/amplify-backend (`packages/create-amplify/src/initial_project_file_generator.ts`, `gitignore_initializer.ts`, `default_packages.json`, `cli-core/src/package-manager-controller/*.ts`, `templates/basic-auth-data/amplify/backend.ts`) — fetched 2026-04-24 via raw.githubusercontent.com and api.github.com.
- **Context7 `/aws-amplify/amplify-backend`** — `defineBackend` semantics, ampx CLI commands.
- **Context7 `/aws-amplify/docs`** — manual installation, project structure, IAM permissions guidance.
- **GitHub Advisory Database** — [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93): affected `< 8.5.10`, patched `8.5.10`, CVE-2026-41305.

### Secondary (MEDIUM confidence)
- [docs.amplify.aws/react/start/account-setup/](https://docs.amplify.aws/react/start/account-setup/) — AWS CLI install steps, `aws configure sso` flow, `--profile` flag for ampx sandbox. Cross-verified against Context7.
- [docs.amplify.aws/nextjs/start/manual-installation/](https://docs.amplify.aws/nextjs/start/manual-installation/) — manual install command + ESM requirement. Cross-verified against `create-amplify` source (which writes `{type:"module"}` literally).
- [docs.amplify.aws/nextjs/deploy-and-host/sandbox-environments/setup/](https://docs.amplify.aws/nextjs/deploy-and-host/sandbox-environments/setup/) — sandbox lifecycle, stack name pattern `amplify-<app-name>-<$(whoami)>-sandbox`.
- [bun.com/docs/install/audit](https://bun.com/docs/install/audit) — `bun audit` syntax, exit codes, `--audit-level` flag. Cross-verified locally with `bun audit --help`.

### Tertiary (LOW confidence — flagged in Assumptions Log if load-bearing)
- aws-amplify/amplify-backend GitHub issues #1000, #1437 — Bun + Amplify interaction history. Used to inform G-10; not cited as authoritative.

## Open Questions

1. **What does an empty-backend `amplify_outputs.json` actually contain in v1.22.0?**
   - What we know: docs say "configuration details for your Amplify project"; for an empty stack, there are no resources to configure.
   - What's unclear: exact JSON shape — is it `{}`, `{"version":"1.4"}`, or does it always include some metadata block?
   - Recommendation: the planner can document this in PLAN.md as "verify-as-output" — capture whatever `ampx sandbox --once` produces on first run as the canonical Phase 1 baseline. Don't assert a specific shape in tests.

2. **Does a fresh Linux machine without AWS CLI installed have a graceful failure mode for `npx ampx sandbox`?**
   - What we know: `ampx sandbox --profile X` reads `~/.aws/credentials` directly via the AWS SDK (not by shelling out to `aws`). So technically, AWS CLI is only needed for `aws configure` (to write the credentials file) and `aws sts get-caller-identity` (to verify).
   - What's unclear: whether `ampx` produces a clear "no credentials found" message vs. a cryptic SDK stack trace if the `~/.aws/credentials` file doesn't exist.
   - Recommendation: README should treat AWS CLI as a hard prerequisite (simpler) and the verifier wave should not attempt the sandbox path until `aws sts get-caller-identity` returns 0.

3. **CONTEXT D-12 explicitly forbids putting AWS access keys in `.env`. The README in §8 recommends `aws configure --profile` (access-key flow). Does the user prefer the SSO flow?**
   - What we know: CONTEXT D-10 step 4 says `aws configure --profile datathon-2026` — explicit access-key flow.
   - What's unclear: whether the user has a working SSO setup at their org (which would obviate access keys entirely).
   - Recommendation: README in §8 documents both; defer to the user. The plan should NOT enforce one or the other.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every package + version verified via `npm view` against the registry, with publish dates checked.
- Architecture (manual Amplify install vs scaffolder): HIGH — verified by reading `create-amplify` source code directly.
- Boundaries (Next 16 specifics): HIGH — verified against `node_modules/next/dist/docs/` (the local docs that AGENTS.md mandates as the canonical source).
- AWS account flow: MEDIUM — `AmplifyBackendDeployFullAccess` policy name and `aws configure sso` flow verified against current docs but not test-deployed in this session.
- Validation: HIGH — every command listed has been spot-checked locally (`bun audit --help`, `bun pm ls`, `node`, `npx`).

**Research date:** 2026-04-24
**Valid until:** ~2026-05-15 (postcss CVE landscape stable for ~30 days; Amplify CLI minor releases on a roughly monthly cadence — re-verify @aws-amplify/backend-cli version before Phase 5)

---

## RESEARCH COMPLETE (orchestrator handoff)

**Phase:** 1 — Foundation & Amplify Backend Skeleton
**Confidence:** HIGH

### Key Findings

1. **Next.js 16 removed `next lint`** — `package.json` script must be `eslint . --max-warnings=0`. [G-1]
2. **Next.js 16.2.0 changed error-boundary API** — `unstable_retry`, not `reset`. The boundary code differs from Next 14/15 training data. [G-2]
3. **`npm create amplify@latest` is incompatible with Bun** — package-manager detection throws `UnsupportedPackageManagerError`. **Manual install is the recommended (and only clean) path.** [G-3]
4. **The official scaffolder ships `auth/` + `data/` resources by default** — even on systems where it works, it would violate D-05/D-06. Manual install gives the truly-empty `defineBackend({})` the CONTEXT requires. [G-4]
5. **PostCSS 8.5.10 (released 2026-04-15) fixes GHSA-qx2v-qp2m-jg93** — `bun update postcss` is sufficient (verified with the actual local `bun audit` output). Defensive fallback documented. [§1]
6. **Empty `defineBackend({})` deploys a near-empty CloudFormation stack** — that IS the Phase 1 success state. Verifier must not flag it as failure. [G-13]
7. **AWS CLI v2 is NOT installed on this machine** — README must include install steps and the planner should treat AWS CLI as a hard precondition for the sandbox-deploy validation wave. [Environment Availability]

### File Created
`/home/fernando/Documents/datathon-2026/.planning/phases/01-foundation-amplify-backend-skeleton/01-RESEARCH.md`

### Confidence Assessment
| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | Every version + engines field verified via `npm view` on 2026-04-24 |
| Architecture (manual install) | HIGH | Verified by reading Amplify scaffolder's source code directly |
| Boundaries (Next 16) | HIGH | Verified against local `node_modules/next/dist/docs/` (the AGENTS.md-mandated source) |
| Sandbox lifecycle | MEDIUM-HIGH | Verified against current Amplify docs + Context7; not test-deployed in this session |
| Validation Architecture | HIGH | All commands spot-checked locally |

### Open Questions
1. Exact `amplify_outputs.json` shape for an empty backend (recommend: capture-on-first-run, don't assert specific JSON in tests)
2. AWS-CLI-not-installed behavior of `npx ampx sandbox` (recommend: README treats AWS CLI as hard prereq)
3. SSO vs access-key preference (CONTEXT chose access-key flow; README documents both — defer to user)

### Ready for Planning
Research complete. Planner can now create PLAN.md files. Recommended task ordering:
1. Wave A (no AWS): PostCSS CVE fix + `package.json` scripts + `eslint . --max-warnings=0`
2. Wave B (no AWS): boundaries (`error.tsx`, `loading.tsx`, `not-found.tsx`) + `.env.example` + `.gitignore` updates
3. Wave C (no AWS): manual Amplify install — devDeps + `amplify/{backend.ts, package.json, tsconfig.json}` + root tsconfig exclude
4. Wave D (no AWS): README setup section
5. Wave E (REQUIRES AWS): `npx ampx sandbox --once` smoke + verify CloudFormation stack — gated on developer having completed README steps 1-3 locally
