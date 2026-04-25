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

### Active

<!-- Scope de v1.0. Building toward these. -->

- [ ] Backend Amplify Gen2 inicializado y desplegable a sandbox
- [ ] Cognito User Pool con email + contraseña
- [ ] Cognito federation con Google OAuth
- [ ] Componente `<Authenticator>` integrado en Next.js (sign-up, sign-in, sign-out, reset password)
- [ ] Página protegida que sólo es accesible logged in (redirige a login si no hay sesión)
- [ ] App desplegada en AWS Amplify Hosting con CI desde GitHub
- [ ] Vulnerabilidad PostCSS XSS detectada por mapper resuelta (parche dependencias)

### Out of Scope

<!-- Excluido explícitamente para v1.0. -->

- Data layer (DynamoDB vía Amplify Data) — esperar a conocer la feature del datatón antes de modelar
- Storage S3 — idem; depende del producto final
- Magic link login — overkill para v1; añade dependencia de SES + plantillas
- MFA / 2FA — innecesario para usuarios de hackathon de un día
- GitHub OAuth — Google cubre la mayoría de los casos sin doble setup
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
- **Auth provider**: AWS Cognito User Pool (gestionado por Amplify) — Email + Google OAuth.
- **Hosting**: AWS Amplify Hosting con CI desde GitHub — Único proveedor (AWS) end-to-end.
- **Timeline**: Datatón con fecha conocida — Trade-offs siempre a favor de "shippeable hoy" sobre "perfecto".

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Amplify Gen2 sobre Cognito directo | Backend-as-code en TS; auth + futuras data/storage en una sola declaración. Ahorra horas vs SDK manual. | — Pending |
| Email + Google OAuth (no GitHub, no magic link) | Cubre 99% de usuarios de hackathon; cada provider extra son ~30 min de setup OAuth | — Pending |
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
*Last updated: 2026-04-25 after initialization*
