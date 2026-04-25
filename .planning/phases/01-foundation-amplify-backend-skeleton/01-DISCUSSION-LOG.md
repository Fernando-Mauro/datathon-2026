# Phase 1: Foundation & Amplify Backend Skeleton - Discussion Log

> **Audit trail only.** No usar como input para planning, research o execution agents.
> Las decisiones canónicas viven en `01-CONTEXT.md` — este log preserva las alternativas consideradas.

**Date:** 2026-04-25
**Phase:** 01-foundation-amplify-backend-skeleton
**Areas discussed:** Scope vs CONCERNS.md, Backend skeleton scope, amplify_outputs.json, Verificación + DX

---

## Gray Area Selection

| Option | Description | Selected |
|---|---|---|
| Scope vs CONCERNS.md | Qué issues del scaffold (además del CVE) entran en Phase 1 | ✓ |
| Backend skeleton scope | Qué tan "lleno" sale `amplify/` al cierre de Phase 1 | ✓ |
| amplify_outputs.json | Cómo manejar el archivo que genera `ampx sandbox` | ✓ |
| Verificación + DX | Qué cuenta como "Phase 1 done" + guía AWS env vars | ✓ |

**Note from user:** "tambien me debes de guiar a poner en las .env las variables para que esto se pueda desplegar de manera correcta en aws."

→ Se folded en el área "Verificación + DX" (D-10..D-14).

---

## Scope vs CONCERNS.md

| Option | Description | Selected |
|---|---|---|
| Lint estricto | `eslint . --max-warnings=0` — convierte warnings en errores | ✓ |
| .env.example + AWS guide | `.env.example` documentando AWS_PROFILE/REGION + sección README setup AWS | ✓ |
| Error/loading boundaries | `app/error.tsx`, `app/not-found.tsx`, `app/loading.tsx` con UI básica | ✓ |
| Resto a futuro | Security headers, Husky, metadata real, image domains, .bunfig.toml — diferidos | ✓ |

**User's choice:** Las primeras tres incluidas en Phase 1; el resto explícitamente diferido a phases futuras.
**Notes:** Selección de "Resto a futuro" interpretada como confirmación de que esos issues quedan deferred (no contradice la inclusión de los otros tres).

---

## Backend Skeleton Scope

| Option | Description | Selected |
|---|---|---|
| Vacío puro (Rec.) | Solo `defineBackend({})`. Phase 2 añade `auth/resource.ts`. Límites limpios. | ✓ |
| Con stub de auth | Pre-cargar `amplify/auth/resource.ts` con `defineAuth({ loginWith: { email: true } })` | |
| Con storage placeholder | Skeleton + bucket S3 placeholder. Innecesario v1. | |

**User's choice:** Vacío puro.
**Notes:** Mantiene el límite Phase 1 ↔ Phase 2 limpio: Phase 1 = infra, Phase 2 = primer resource.

---

## amplify_outputs.json

| Option | Description | Selected |
|---|---|---|
| Gitignore (Rec.) | Cada dev/CI genera el suyo. Estándar AWS. | ✓ (tras reconsiderar) |
| Commit al repo | Compartido entre devs. Conveniente solo, frágil después. | (reconsiderado) |
| Gitignore + sample | Gitignore real + commit `amplify_outputs.example.json` con valores fake | |

**User's choice (inicial):** Commit al repo.
**Reflexión presentada:** El archivo contiene IDs específicos del sandbox personal del developer; commitearlo crea conflictos cuando Phase 5 introduzca producción (build de Hosting genera otro distinto). En solo + hackathon es manejable pero fragil.
**User's choice (final):** Cambiar a gitignore. Razón aceptada: evitar rework en Phase 5.

---

## Verificación + DX

### Sub-pregunta 1: scripts auxiliares

| Option | Description | Selected |
|---|---|---|
| bun audit script | `"audit": "bun audit"` para re-verificar CVEs | ✓ |
| tsc --noEmit script | `"typecheck": "tsc --noEmit"` para validar tipos rápido | ✓ |
| ampx sandbox smoke | Documentar en README cómo correr `ampx sandbox` y qué esperar | ✓ |
| Todos los anteriores | Confirmación de que se quieren los tres | ✓ |

**User's choice:** Los tres scripts + documentación README.

### Sub-pregunta 2: nivel de guía AWS

| Option | Description | Selected |
|---|---|---|
| Mínima | Lista de comandos `aws configure` + IAM permissions. ~10 líneas. | |
| Step-by-step (Rec.) | Walkthrough completo: IAM user, policies, configure, validar. ~30 líneas. | ✓ |
| Deferir a Phase 5 | Solo .env.example placeholder ahora; guía completa más tarde | |

**User's choice:** Step-by-step.
**Notes:** Coincide con la nota explícita del usuario "me debes de guiar a poner en .env las variables".

---

## Claude's Discretion

Áreas donde el usuario delegó decisiones a Claude (capturadas en `01-CONTEXT.md` §Claude's Discretion):

- Estilo visual exacto de `error.tsx`, `loading.tsx`, `not-found.tsx`
- Nombre exacto del IAM user / profile sugerido en README
- Estructura interna de `amplify/backend.ts` más allá de `defineBackend({})`
- Redacción exacta del README setup
- Si añadir un script `clean`

---

## Deferred Ideas

Capturados durante la discusión pero fuera de Phase 1 (en `01-CONTEXT.md` §Deferred Ideas):

- Security headers en `next.config.ts` → Phase 5
- Husky + lint-staged (pre-commit)
- Metadata real en `app/layout.tsx` → cuando se conozca la feature
- Image domains en `next.config.ts` → cuando se necesiten
- `.bunfig.toml` con pin de Bun version → Phase 5
- `amplify_outputs.example.json` (sample committed)
- Pre-commit hook ejecutando `bun run lint && bun run typecheck && bun run audit`

---

*Discussion completed: 2026-04-25*
