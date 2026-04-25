# Roadmap: datathon-2026

## Overview

Camino desde el scaffold actual de Next.js 16 hasta una base desplegada en AWS con autenticación funcional, lista para que el día del datatón el tiempo se gaste en construir la solución del reto, no en infraestructura. Cinco fases secuenciales: primero saneamos el scaffold y plantamos el backend Amplify Gen2, luego habilitamos auth por email, después federamos Google, después protegemos la primera ruta, y finalmente conectamos Amplify Hosting con CI desde GitHub.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Amplify Backend Skeleton** - Scaffold sano (sin CVE) y backend Amplify Gen2 desplegable a sandbox vacío
- [ ] **Phase 2: Email/Password Auth + Authenticator UI** - Cognito User Pool + `<Authenticator>` integrado con sesión persistente
- [ ] **Phase 3: Google OAuth Federation** - Login con Google funcionando vía federación Cognito
- [ ] **Phase 4: Protected Route & Auth Guard** - Ruta `/app` que sólo es accesible logged in
- [ ] **Phase 5: Amplify Hosting + GitHub CI** - Despliegue continuo desde `main` a Amplify Hosting

## Phase Details

### Phase 1: Foundation & Amplify Backend Skeleton
**Goal**: El repo está limpio de la CVE de PostCSS y tiene un backend Amplify Gen2 desplegable a sandbox personal sin recursos todavía.
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-03
**Success Criteria** (what must be TRUE):
  1. `bun audit` (o equivalente) ya no reporta GHSA-qx2v-qp2m-jg93 contra `postcss`
  2. Existe `amplify/backend.ts` con `defineBackend({})` (o un recurso vacío) y el directorio `amplify/` está versionado
  3. `npx ampx sandbox` arranca en local sin errores y crea el stack en CloudFormation
  4. `bun run build` y `bun run lint` siguen pasando después de añadir Amplify
**Plans**: 5 plans
Plans:
- [ ] 01-01-PLAN.md — Wave A: Close PostCSS CVE (`bun update postcss`) and harden `package.json` scripts (strict lint, typecheck, audit, clean)
- [ ] 01-02-PLAN.md — Wave B: Create `app/{error,loading,not-found}.tsx` boundaries (Next 16.2 `unstable_retry`), `.env.example`, and Amplify-aware `.gitignore`
- [ ] 01-03-PLAN.md — Wave C: Manual Amplify Gen 2 install — devDeps + `amplify/{backend.ts,package.json,tsconfig.json}` + root tsconfig exclude
- [ ] 01-04-PLAN.md — Wave D: Add README `## Setup` section (AWS CLI install, IAM, profile config, sandbox lifecycle)
- [ ] 01-05-PLAN.md — Wave E: Manual gate + `npx ampx sandbox --once` smoke deploy to CloudFormation (autonomous: false; requires AWS account)

### Phase 2: Email/Password Auth + Authenticator UI
**Goal**: Un usuario puede registrarse con email y contraseña, verificar el email, iniciar y cerrar sesión desde la app, y la sesión sobrevive a un refresco.
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-03, AUTH-05
**Success Criteria** (what must be TRUE):
  1. `amplify/auth/resource.ts` declara `defineAuth({ loginWith: { email: true } })` y se despliega al sandbox
  2. La app envuelve el árbol React con `<Authenticator>` (o equivalente) y muestra los flujos de sign-up con verificación por email, sign-in y sign-out
  3. Tras hacer sign-in, refrescar el navegador deja al usuario logged in (no vuelve al login)
  4. El usuario puede iniciar reset password desde la UI y completar el flujo de código por email
**Plans**: TBD
**UI hint**: yes

### Phase 3: Google OAuth Federation
**Goal**: Un usuario puede pulsar "Sign in with Google" en la app y completar el login vía Cognito federation.
**Depends on**: Phase 2
**Requirements**: AUTH-02
**Success Criteria** (what must be TRUE):
  1. Existe un OAuth Client en Google Cloud con los redirect URIs de Cognito (sandbox y prod) registrados
  2. Las credenciales (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) viven en Amplify secrets, no en el repo
  3. `amplify/auth/resource.ts` declara `externalProviders: { google: { ... } }` y se despliega al sandbox
  4. El botón de Google aparece en `<Authenticator>` y completar el flujo deja al usuario con sesión activa en la app
**Plans**: TBD
**UI hint**: yes

### Phase 4: Protected Route & Auth Guard
**Goal**: La ruta `/app` (o equivalente) es inaccesible sin sesión y muestra contenido específico cuando hay sesión.
**Depends on**: Phase 3
**Requirements**: AUTH-04
**Success Criteria** (what must be TRUE):
  1. Visitar `/app` sin sesión redirige a la página de login (o renderiza `<Authenticator>` directamente)
  2. Visitar `/app` con sesión activa muestra contenido protegido que incluye al menos el email del usuario
  3. El patrón de guard está reutilizable (HOC, layout, o middleware documentado) para proteger nuevas rutas en el futuro
**Plans**: TBD
**UI hint**: yes

### Phase 5: Amplify Hosting + GitHub CI
**Goal**: Cada push a `main` en GitHub dispara un build en AWS Amplify Hosting que despliega la app + backend a producción automáticamente.
**Depends on**: Phase 4
**Requirements**: INFRA-02
**Success Criteria** (what must be TRUE):
  1. La app Amplify está creada en AWS Console y conectada al repo de GitHub en la rama `main`
  2. Existe `amplify.yml` en el repo con los pasos de build correctos para Bun + Next.js 16 + backend Gen2
  3. Un push a `main` dispara un build verde y la URL pública sirve la app (login + protected route funcionan en prod)
  4. La sesión de email/password y la federación con Google funcionan contra el backend de producción (no sólo sandbox)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Amplify Backend Skeleton | 0/5 | Planned | - |
| 2. Email/Password Auth + Authenticator UI | 0/TBD | Not started | - |
| 3. Google OAuth Federation | 0/TBD | Not started | - |
| 4. Protected Route & Auth Guard | 0/TBD | Not started | - |
| 5. Amplify Hosting + GitHub CI | 0/TBD | Not started | - |

---
*Roadmap created: 2026-04-24*
*Phase 1 plans created: 2026-04-25*
