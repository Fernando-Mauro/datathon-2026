# datathon-2026

## What This Is

Aplicación Next.js base, integrada con AWS, lista para servir como solución de un próximo datatón con fecha conocida. La feature concreta del producto se decidirá cuando arranque el reto; este v1.0 entrega únicamente la base técnica desplegable con autenticación funcional, para que el tiempo del evento se gaste construyendo la solución del problema, no la infraestructura.

## Core Value

Llegar al día del datatón con login funcionando, base desplegada y pipeline de CI listo, para gastar el 100% del tiempo del evento en construir la solución del reto en lugar de pelearse con infra.

## Requirements

### Validated

<!-- Inferido del scaffold Next.js existente (ver `.planning/codebase/`). -->

- ✓ Next.js 16.2.4 App Router compila y corre — existing
- ✓ TypeScript 5.x strict mode configurado — existing
- ✓ Tailwind CSS 4.x integrado vía `@tailwindcss/postcss` — existing
- ✓ ESLint 9 (flat config) con reglas Next.js + Web Vitals — existing
- ✓ Bun como package manager (lockfile `bun.lock` presente) — existing
- ✓ Fuentes Geist (Sans + Mono) cargadas vía `next/font/google` — existing
- ✓ Root layout + home page renderizan correctamente — existing
- ✓ Backend Amplify Gen2 desplegable a sandbox — Validated en Phase 1
- ✓ Vulnerabilidad PostCSS XSS resuelta — Validated en Phase 1
- ✓ Cognito User Pool con email + contraseña — Validated en Phase 2
- ✓ `<Authenticator>` integrado en Next.js (sign-up, sign-in, sign-out, reset password) — Validated en Phase 2
- ✓ Sesión persiste entre refrescos (localStorage) — Validated en Phase 2
- ✓ Página protegida `/app` con guard reusable — Validated en Phase 3 (`<AuthGuard>` + `app/app/layout.tsx` + safeFromPath open-redirect allowlist)
- ✓ HaviCA conversational UI (Variante A: HAVI chat motor central + sub-routes + handoff humano + alert/success/warning + animaciones + desktop shell) — Validated en Phase 03.1
- ✓ App desplegada en AWS Amplify Hosting con CI auto-deploy desde GitHub (push master → build → deploy live) — Validated en Phase 4

### Active

<!-- Scope de v1.0. Building toward these. -->

(none — v1.0 milestone complete)

### Out of Scope

<!-- Excluido explícitamente para v1.0. -->

- Data layer (DynamoDB vía Amplify Data) — esperar a conocer la feature del datatón antes de modelar
- Storage S3 — idem; depende del producto final
- Magic link login — overkill para v1; añade dependencia de SES + plantillas
- MFA / 2FA — innecesario para usuarios de hackathon de un día
- Google OAuth federation — para "público abierto" requiere Google verification (3-10 días + privacy policy URL pública + screenshots), bloqueada por Hosting (Phase 4) primero. Drop confirmado 2026-04-25; reabrible post-v1 con verification completo.
- GitHub OAuth — Google también dropeado (ver fila anterior); email+password de Phase 2 cubre login en v1
- Mobile app / PWA — web-first; pivot mobile no aplica al formato datatón
- i18n — datatón en un solo idioma
- Analytics / observability — se añade post-MVP

## Context

- **Mapa del codebase:** `.planning/codebase/` — generado 2026-04-25 con scaffold de Next.js 16.2.4 inicial sin más lógica.
- **Versión de Next.js inusual:** Next.js 16.x tiene cambios respecto a 14/15 documentados en `node_modules/next/dist/docs/` y reglas en `AGENTS.md` — leer antes de tocar APIs de Next.
- **AWS sin restricciones impuestas:** Stack libre. Decisión propia ir con Amplify Gen2 por velocidad (backend-as-code declarativo).
- **Datatón con fecha:** No bloqueado por scope, pero fecha fija → priorizar minimal viable sobre completitud.
- **Sin restricción de stack del datatón:** Libertad total para elegir.

## Constraints

- **Tech stack**: Next.js 16.2.4 + React 19.2.4 + TypeScript 5 + Tailwind 4 — Already scaffolded; no cambiar.
- **Package manager**: Bun — Ya existe `bun.lock`; consistente con preferencia explícita del usuario.
- **Backend**: AWS Amplify Gen2 (TypeScript backend-as-code) — Decisión técnica; la justificación es velocidad para hackathon.
- **Auth provider**: AWS Cognito User Pool (gestionado por Amplify) — Email + password únicamente en v1. Google OAuth federation dropeado 2026-04-25 a Out of Scope (necesita Google verification post-Hosting).
- **Hosting**: AWS Amplify Hosting con CI desde GitHub — Único proveedor (AWS) end-to-end.
- **Timeline**: Datatón con fecha conocida — Trade-offs siempre a favor de "shippeable hoy" sobre "perfecto".

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Amplify Gen2 sobre Cognito directo | Backend-as-code en TS; auth + futuras data/storage en una sola declaración. Ahorra horas vs SDK manual. | — Pending |
| Email + password únicamente (Google dropeado) | Inicialmente: email + Google OAuth. Tras discuss-phase 3 (2026-04-25): Google requiere verification (3-10d) bloqueada por Hosting; drop a Out of Scope. Email/password de Phase 2 ya cumple AUTH funcional. Phase 3/4 renumeradas. | Dropped Google 2026-04-25 |
| AWS Amplify Hosting (no Vercel) | Mantener un solo proveedor (AWS) end-to-end; integración nativa con backend Gen2 | — Pending |
| Bun como package manager | Ya hay `bun.lock` en el repo; user lo confirmó explícitamente | — Pending |
| No definir data layer en v1.0 | El producto está TBD; modelar DynamoDB ahora sería trabajo a tirar | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-25 — v1.0 milestone COMPLETE. All 7 requirements satisfied: Phase 1 (foundation + CVE) + Phase 2 (Cognito email auth) + Phase 3 (auth guard) + Phase 03.1 (HaviCA conversational UI + desktop shell) + Phase 4 (Hosting + CI live). Product rebrand to HaviCA done. Ready for the datatón.*
