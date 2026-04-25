# Phase 2: Email/Password Auth + Authenticator UI - Discussion Log

> **Audit trail only.** No usar como input para planning, research o execution agents.
> Las decisiones canónicas viven en `02-CONTEXT.md` — este log preserva las alternativas consideradas.

**Date:** 2026-04-25
**Phase:** 02-email-password-auth-authenticator-ui
**Areas discussed:** Auth UI placement, Signup attributes, Authenticator styling, Post-login destination

---

## Gray Area Selection

| Option | Description | Selected |
|---|---|---|
| Dónde vive el login | Wrap toda la app vs ruta /login vs inline en home | ✓ |
| Atributos signup | Solo email vs email+name vs email+name+handle | ✓ |
| Estilo Authenticator | Default AWS vs tematizado Tailwind vs headless custom | ✓ |
| Post-login destino | A `/app` vs ?next= vs stay vs home autenticado | ✓ |

---

## Auth UI Placement

| Option | Description | Selected |
|---|---|---|
| Ruta /login (Rec.) | Home pública. `/login` dedicada. Phase 4 protege `/app`. | ✓ |
| Wrap toda la app | Root layout envuelve todo. App 100% logged-in. | |
| Inline en home | Hero + botón sign-in inline o modal. | |

**User's choice:** Ruta `/login` dedicada.
**Rationale:** Limpio, escala, encaja con Phase 4 (que va a proteger `/app`). Permite landing pública para mostrar a jueces sin login.

---

## Signup Attributes

| Option | Description | Selected |
|---|---|---|
| Email + name (Rec.) | email + password + `fullname` (built-in). Personaliza UX. 3 campos en form. | ✓ |
| Solo email | Lo mínimo. 2 campos. No personalización. | |
| Email + name + handle | Email + password + name + custom displayName. Overkill v1. | |

**User's choice:** Email + name (built-in Cognito attribute).
**Rationale:** Permite saludo personalizado en `/app` ("Welcome, Fernando") sin overhead innecesario.

---

## Authenticator Styling

| Option | Description | Selected |
|---|---|---|
| Default AWS | Look-and-feel AWS (morado/naranja). 0 esfuerzo. | ✓ |
| Tematizado básico (Rec.) | Theme object con tokens Tailwind 4 ya en `globals.css`. ~30 min. | |
| Headless custom | `useAuthenticator()` hook + form propio. 2-4 horas. | |

**User's choice:** Default AWS (deviating from Rec.).
**Rationale:** Producto del datatón TBD — sin brand a matchear. Tematización útil más tarde como "polish phase". Para hackathon, máxima velocidad gana.

---

## Post-Login Destination

| Option | Description | Selected |
|---|---|---|
| A `/app` (Rec.) | Sign-in success → router.push("/app"). Simple, predecible. | ✓ |
| Query param ?next= | `/login?next=/app/upload` → redirect al next. Soporta deep-links. Más código. | |
| Stay en /login | Authenticator muestra "logged in as X" + sign-out. Usuario navega manual. | |
| Home `/` autenticada | Home renderiza distinto según `useAuthenticator()`. Acopla home con auth state. | |

**User's choice:** Redirect a `/app`.
**Rationale:** Simple, predecible, encaja con Phase 4 que hace `/app` la ruta protegida principal. Para hackathon donde el producto vive en una sola área, suficiente.

---

## Claude's Discretion

Áreas donde el usuario delegó decisiones a Claude (capturadas en `02-CONTEXT.md` §Claude's Discretion):

- Si añadir un link "Sign in" en home `/` o no
- Layout exacto de `app/login/page.tsx` y `app/app/page.tsx` placeholder
- Si crear `app/login/layout.tsx` con el Provider o ponerlo en page.tsx
- Cómo importar `amplify_outputs.json` (path alias vs relative)
- Cuándo correr `npx ampx sandbox` (modo watch o `--once`) durante development

---

## Inferred Decisions (no explicitly asked, derived from context)

Estas decisiones complementarias fueron derivadas y plasmadas en CONTEXT sin pregunta directa al usuario. Si alguna no encaja, abrir conversación:

1. **Verificación email obligatoria** (D-19) — Cognito default cuando email es required; consistente con "auth básico que funciona"
2. **Password policy default** (D-20) — Cognito default (≥8 chars + mixed); custom innecesario v1
3. **Persistencia sesión via localStorage** (D-28) — Amplify default; XSS risk aceptado v1
4. **Sign-out → redirect a `/`** (D-27) — más natural que stay en `/app`
5. **`<Authenticator>` default cubre 4 flujos sin slots custom** (D-25) — sign-up + verify + sign-in + sign-out + reset out-of-the-box
6. **Phase 2 crea placeholder `/app`** — necesario para que el redirect post-login no 404 antes de que Phase 4 plante el guard

---

## Deferred Ideas

Capturados en `02-CONTEXT.md` §Deferred Ideas:

- Theming custom del Authenticator
- Rate limiting / brute-force protection custom
- Forgot username flow
- Custom error UI para auth flows
- Server-side session validation con `@aws-amplify/adapter-nextjs`
- Sign-out a página "Goodbye" custom
- Custom email verification template (branding)
- Password policy custom

---

*Discussion completed: 2026-04-25*
