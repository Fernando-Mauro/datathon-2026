# Phase 3: Protected Route & Auth Guard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-25
**Phase:** 03-protected-route-auth-guard
**Areas discussed:** Guard pattern shape, Loading + redirect UX, Protected page content, Server-side auth (adapter-nextjs)

**Note:** Phase 3 was originally Phase 4 (Protected Route & Auth Guard) and got renumbered after Phase 3 (Google OAuth Federation) was removed earlier in the same session — see commit `c27f1b7`.

---

## Guard pattern shape

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| ¿Qué forma toma el guard? | `<AuthGuard>` + layout | Componente cliente reusable + montado en `app/app/layout.tsx` | ✓ |
| | Solo `app/app/layout.tsx` | Sin componente externo | |
| | Solo `<AuthGuard>` por página | Sin layout automático | |
| | HOC `withAuthGuard(Component)` | Patrón menos idiomático en App Router 16 | |
| ¿Cómo determina el guard si hay sesión? | useAuthenticator hook | Mismo patrón que `/login` | ✓ |
| | getCurrentUser() async | Más control sobre user info | |
| | Combinar ambos | Hook + fetchUserAttributes | |
| ¿Dónde plantamos `<AuthGuard>`? | `app/_components/AuthGuard.tsx` | Underscore prefix = ignored by routing | ✓ |
| | `components/AuthGuard.tsx` root | Nuevo top-level dir | |
| | `app/auth/AuthGuard.tsx` | Nuevo subdir bajo app/ | |
| | `lib/auth/AuthGuard.tsx` | Tradicional lib dir | |
| ¿Cómo expone user info? | Children fetch their own | AuthGuard solo gating | ✓ |
| | Pass user via render prop | Verboso en TS | |
| | AuthContext custom | Overkill | |

**User's choice:** All recommended defaults.
**Notes:** No follow-up questions needed — user signaled clear preference for simplest/most idiomatic options.

---

## Loading + redirect UX

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| ¿Qué renderizamos durante configuring? | Spinner + 'Loading…' | Centrado, consistente con /login | ✓ |
| | Skeleton del placeholder | Más sofisticado | |
| | Pantalla blanca | Render null | |
| | Redirect inmediato a /login | Causa flash si la sesión sí existe | |
| ¿Cómo redirigimos sin sesión? | router.replace('/login') | No pollutea history | ✓ |
| | router.push('/login') | Permite back loop | |
| | <Authenticator> inline en /app | Duplica provider/UI | |
| ¿Pasamos ?from= para bounce-back? | Sí, con allowlist | Open-redirect prevention via path validation | ✓ |
| | No, login siempre va a /app | Más simple, menos UX | |
| | Defer hasta Phase 4 | Sin bounce-back en v1 | |
| ¿/login soporta ?from=? | Mantener current + ?from= | useEffect lee searchParams | ✓ |
| | Solo /app, ignorar ?from= | Coherente si bounce-back = no | |
| | Que decida Claude | Auto-coherente | |

**User's choice:** All recommended defaults.
**Notes:** El allowlist de `?from=` (validar `startsWith("/")`, NOT `startsWith("//")`, NOT `startsWith("/login")`) queda como decisión de planner sobre dónde ubicar la helper function (`safeFromPath`).

---

## Protected page content

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| ¿Qué muestra /app con sesión? | Email + name + sign-out | "Signed in as {fullname} ({email})" | ✓ |
| | Solo email + sign-out | Mínimo viable según ROADMAP | |
| | Shell completo (header+sidebar) | Anticipar datatón | |
| | Placeholder mínimo + nota | Defer estructura post-feature | |
| ¿Cómo lee email/name? | useAuthenticator (user object) | Sincrónico desde context | ✓ |
| | fetchUserAttributes() async | Returns todos los attrs | |
| | Combinar ambos | Doble fuente | |
| ¿Qué archivo modificamos? | Reemplazar `app/app/page.tsx` | Placeholder existente se vuelve real | ✓ |
| | Mantener page.tsx + añadir layout.tsx | Separar responsabilidades | |
| | Crear route group `(protected)` | Overkill con 1 ruta | |

**User's choice:** All recommended defaults.
**Notes:** Para el campo `name` se necesita `fetchUserAttributes()` separado del hook (el `user` object base no incluye custom attrs). El planner debe wrap en try/catch con fallback a solo email.

---

## Server-side auth (adapter-nextjs)

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| ¿adapter-nextjs en Phase 3? | Diferido — client-only confirmado | Respeta Phase 2 walk-back | ✓ |
| | Instalar pero NO ssr:true | Sin valor inmediato, peso extra | |
| | Instalar + activar | Reabre Phase 2 walk-back | |

**User's choice:** Diferido.
**Notes:** Reabre como mini-phase post-feature si la solución del datatón necesita API routes / server actions con sesión. Verificar primero si Amplify v6.x más nuevo ya fixeó el bug que causó el walk-back original.

---

## Claude's Discretion

- Implementación visual exacta del spinner + Loading… (clases Tailwind, tamaño)
- Layout/typography del `/app` content
- Ubicación física de `safeFromPath` (helper file vs inlined)
- Si mostrar `user.username` (sub) además de email — debug-only, probablemente no
- Suspense vs useState/useEffect simple para el async fetch
- Tipo TS custom `User` vs nativo aws-amplify
- Copy exacto de "Signed in as …"

## Deferred Ideas

- Server-side auth (post-feature mini-phase)
- Shell layout completo (datatón decide)
- Roles / permisos / multi-tenant (post-feature)
- Bounce-back con state preservado (overkill v1)
- HOC pattern (descartado por no-idiomático)
- AuthContext custom (descartado por redundante con Authenticator.Provider)
- Skeleton elaborado durante configuring (overkill v1)
- Route group `(protected)` (overkill con 1 ruta)
- Tests unit/E2E (backlog)
