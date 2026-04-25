# Requirements: datathon-2026

**Defined:** 2026-04-25
**Core Value:** Llegar al día del datatón con login funcionando, base desplegada y pipeline de CI listo, para gastar el 100% del tiempo del evento en construir la solución del reto en lugar de pelearse con infra.

## v1 Requirements

Requirements para el release inicial. Cada uno mapea a una phase del roadmap.

### INFRA — Backend & Deploy

- [x] **INFRA-01
**: Backend Amplify Gen2 inicializado (`amplify/` directory + `defineBackend()` en `amplify/backend.ts`) y desplegable a personal sandbox vía `npx ampx sandbox`
- [ ] **INFRA-02**: App desplegada en AWS Amplify Hosting con CI auto-deploy desde GitHub (push a `main` → build → deploy)
- [x] **INFRA-03
**: Vulnerabilidad PostCSS XSS resuelta (actualizar dependencias afectadas detectadas por el codebase mapper en `.planning/codebase/CONCERNS.md`)

### AUTH — Autenticación

- [ ] **AUTH-01**: Cognito User Pool con email + contraseña configurado declarativamente en `amplify/auth/resource.ts` vía `defineAuth({ loginWith: { email: true } })`
- [ ] **AUTH-02**: Federation con Google OAuth funcionando — Google Cloud OAuth client creado, credenciales en Amplify secrets, callback URLs registrados en Cognito User Pool
- [ ] **AUTH-03**: Componente `<Authenticator>` de `@aws-amplify/ui-react` integrado en Next.js — flujos de sign-up (con verificación email), sign-in, sign-out y reset password operativos
- [ ] **AUTH-04**: Ruta protegida (ej. `/app` o `/dashboard`) que redirige a `/login` (o muestra `<Authenticator>`) cuando no hay sesión activa, y muestra contenido cuando sí
- [ ] **AUTH-05**: Sesión persiste entre refrescos del browser (token storage gestionado por Amplify — comprobado en dev y en deploy)

## v2 Requirements

Sin v2 explícitas todavía. Lo deferido vive en Out of Scope (decisión consciente) o emergerá como nuevas requirements cuando se conozca la feature del datatón.

## Out of Scope

Excluido explícitamente. Documentado para evitar scope creep.

| Feature | Razón |
|---------|--------|
| Data layer (Amplify Data + DynamoDB) | Esperar a conocer la feature del datatón antes de modelar |
| Storage S3 | Idem; depende del producto final |
| Magic link login | Overkill para v1; añade dependencia de SES + plantillas |
| MFA / 2FA | Innecesario para usuarios de hackathon de un día |
| GitHub OAuth | Google ya cubre la mayoría de casos sin doble setup |
| Mobile app / PWA | Web-first; pivot mobile no aplica al formato datatón |
| i18n / multi-idioma | Datatón en un solo idioma |
| Analytics / observability | Post-MVP |

## Traceability

Qué phases cubren qué requirements.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 — Foundation & Amplify Backend Skeleton | Complete |
| INFRA-02 | Phase 5 — Amplify Hosting + GitHub CI | Pending |
| INFRA-03 | Phase 1 — Foundation & Amplify Backend Skeleton | Complete |
| AUTH-01 | Phase 2 — Email/Password Auth + Authenticator UI | Pending |
| AUTH-02 | Phase 3 — Google OAuth Federation | Pending |
| AUTH-03 | Phase 2 — Email/Password Auth + Authenticator UI | Pending |
| AUTH-04 | Phase 4 — Protected Route & Auth Guard | Pending |
| AUTH-05 | Phase 2 — Email/Password Auth + Authenticator UI | Pending |

**Coverage:**
- v1 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-25*
*Last updated: 2026-04-24 — traceability table populated after roadmap creation*
