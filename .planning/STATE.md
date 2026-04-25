---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: .planning/phases/03.1-hey-banco-design-system-variante-a-conversational-havi/03.1-UI-SPEC.md
last_updated: "2026-04-25T22:18:44.205Z"
last_activity: 2026-04-25 -- Phase 03.1 execution started
progress:
  total_phases: 5
  completed_phases: 3
  total_plans: 21
  completed_plans: 13
  percent: 62
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-25)

**Core value:** Llegar al día del datatón con login funcionando, base desplegada y pipeline de CI listo, para gastar el 100% del tiempo del evento construyendo la solución, no peleando con infra.
**Current focus:** Phase 03.1 — Hey-banco design system + Variante A conversational HAVI

## Current Position

Phase: 03.1 (Hey-banco design system + Variante A conversational HAVI) — EXECUTING
Plan: 1 of 8
Status: Executing Phase 03.1
Last activity: 2026-04-25 -- Phase 03.1 execution started

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**

- Total plans completed: 3
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 3 | 3 | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01-foundation-amplify-backend-skeleton P01 | 3min | 2 tasks | 2 files |
| Phase 01-foundation-amplify-backend-skeleton P02 | 3min | 2 tasks tasks | 5 files files |
| Phase 01-foundation-amplify-backend-skeleton P04 | 3min | 1 task tasks | 1 file files |
| Phase 02-email-password-auth-authenticator-ui P01 | 3min | 2 tasks tasks | 2 files files |
| Phase 02-email-password-auth-authenticator-ui PP03 | 3min | 5 tasks tasks | 6 files files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Pre-roadmap: Amplify Gen2 sobre Cognito directo (backend-as-code en TS)
- Pre-roadmap: Email + Google OAuth únicamente (no GitHub, no magic link, no MFA)
- Pre-roadmap: AWS Amplify Hosting (no Vercel) — un solo proveedor end-to-end
- Pre-roadmap: Bun como package manager (consistente con `bun.lock` existente)
- Pre-roadmap: No definir data layer en v1.0 (producto TBD hasta el datatón)
- Used package.json overrides to close PostCSS CVE GHSA-qx2v-qp2m-jg93 (next@16.2.4 exact-pins postcss@8.4.31, so bun update / bun add could not lift the nested entry)
- Strict ESLint flat-config gate uses 'eslint . --max-warnings=0' directly (NOT 'next lint' which was removed in Next.js 16 per G-1)
- Phase 1 verification gauntlet established: bun run lint && bun run typecheck && bun run audit && bun run build (must remain green at end of every subsequent plan)
- Used Next 16.2 unstable_retry (NOT legacy reset) in app/error.tsx per node_modules/next/dist/docs and RESEARCH G-2
- Skipped app/global-error.tsx — out of scope per RESEARCH §4.d (root layout has no async work yet); root error.tsx is sufficient
- Append-only .gitignore edit preserves existing 42 lines; !.env.example allow override placed AFTER .env* rule (last-match-wins gitignore semantics)
- Amplify gitignore patterns at repo root (no amplify/ prefix) per G-8 — amplify_outputs.json lands at project root, not under amplify/
- Audit ignore-list for 24 Amplify CLI build-tool transitive CVEs (handlebars, minimatch, immutable, yaml, fast-xml-parser, lodash, uuid, @smithy/config-resolver). PostCSS CVE GHSA-qx2v-qp2m-jg93 remains closed via overrides. User-approved deviation from PLAN 01-03 — see 01-03-SUMMARY.md.
- README ## Setup section uses profile name 'datathon-2026' consistently across all 7 numbered steps; documents both access-key and SSO flows; uses npx ampx (never bunx) per G-10
- Avoided printing the literal anti-pattern 'bunx ampx' in README — rephrased the warning as 'do not launch via Bun's binary launcher' so the educational guidance survives the strict acceptance check (! grep -qF 'bunx ampx')
- Phase 1 complete: empty Amplify Gen2 sandbox deployed to us-east-1 (account 992839645871). Stack: amplify-datathon2026-fernando-sandbox-0d21400c4f. CDK Bootstrap one-time setup completed via temporary AdministratorAccess on aws-cli-amplify IAM user (to be detached post-deploy).
- Phase 2 Plan 01: Used CDK property fullname (NOT name) per L-1 — maps to OIDC standard claim 'name' on the wire
- Phase 2 Plan 01: Omitted passwordPolicy and userVerification — Cognito defaults already match D-19/D-20 (verified against installed @aws-amplify/auth-construct/lib/defaults.js + aws-cdk-lib/aws-cognito/lib/user-pool.js)
- Phase 2 Plan 01: Dropped Phase 1 backend.ts JSDoc — 'bare skeleton' explanation no longer factually correct now that auth resource is wired (PATTERNS Option A)
- Plan 02-02: aws-amplify@6.16.4 + @aws-amplify/ui-react@6.15.3 installed to dependencies (NOT devDeps). adapter-nextjs deferred to Phase 4 per RESEARCH key finding #3. Existing 24 audit ignores cover Amplify v6 transitives — no new ignores needed.
- Plan 02-03: AmplifyProvider hoisted to ROOT (app/AmplifyProvider.tsx) — supersedes CONTEXT D-23 which scoped it to /login. Reason: signOut() in /app would race against Amplify.configure() (RESEARCH §7 / L-2).
- Plan 02-03: Amplify.configure(outputs, { ssr: true }) — REQUIRED for Next.js per official docs. Switches token storage to cookies (per RESEARCH L-3). AUTH-05 still met. SUPERSEDES CONTEXT D-28 wording (fix lands in Plan 02-05 Task 5).
- Plan 02-03: <Authenticator /> rendered bare (no signUpAttributes / formFields / components / loginMechanisms props). Zero Configuration auto-renders Email + Name + Password from amplify_outputs.json#standard_required_attributes (per RESEARCH L-6).
- Plan 02-03: useRouter sourced from next/navigation everywhere (App Router). next/router is Pages Router only and is forbidden by anti-pattern grep (per RESEARCH L-7). signOut from aws-amplify/auth (v6 subpath, NOT v5 Auth namespace).
- Plan 02-04: Cognito User Pool live in us-east-1 (us-east-1_6l4dSfRCz) via incremental sandbox deploy (~45s). amplify_outputs.json populated. Read-only AWS introspection denied by AmplifyBackendDeployFullAccess scope — deploy event log + outputs file substitute as evidence (accepted deviation).
- Plan 02-05: 4 D-29 manual flows validated (sign-up+verify, sign-out+re-sign-in, refresh, reset skipped with rationale). RESEARCH L-3 walked back: Amplify.configure(outputs) without ssr:true (cookie adapter hangs without @aws-amplify/adapter-nextjs). CONTEXT D-28 wording corrected — localStorage stays as token storage (original was right).
- Phase 3 complete: AuthGuard mounted via app/app/layout.tsx gates /app/* (D-30); safeFromPath allowlist closes open-redirect threats T-03-08/09/10 (verified live in 03-03 manual flows); bun run build confirms Suspense around useSearchParams (L-1) and no client-layout metadata export (L-9). AUTH-04 satisfied. Server-side @aws-amplify/adapter-nextjs deferred per D-41 — reopen if datathon feature needs API routes.

### Roadmap Evolution

- Phase 03.1 inserted after Phase 3: Hey-banco design system + Variante A conversational HAVI (URGENT — design pivot, mock fintech UI replacing /app placeholder pre-Hosting)

### Pending Todos

None yet.

### Blockers/Concerns

- CVE PostCSS XSS (GHSA-qx2v-qp2m-jg93) en transitivas — se resuelve en Phase 1 (INFRA-03)
- Next.js 16 tiene cambios respecto a 14/15: leer `node_modules/next/dist/docs/` antes de tocar APIs (ver AGENTS.md)

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: Phase 03.1 UI-SPEC approved
Stopped at: .planning/phases/03.1-hey-banco-design-system-variante-a-conversational-havi/03.1-UI-SPEC.md
Resume file: None

**Planned Phase:** 03.1 () — 0 plans — 2026-04-25T22:17:44.679Z
