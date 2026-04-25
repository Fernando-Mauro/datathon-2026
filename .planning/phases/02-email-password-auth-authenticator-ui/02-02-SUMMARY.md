---
phase: 2
plan: "02-02"
status: complete
completed: 2026-04-25
commits:
  - "9fe4313"
requirements_addressed:
  - AUTH-03
---

# Plan 02-02 Summary — Frontend Deps (aws-amplify + @aws-amplify/ui-react)

**Wave:** B
**Tasks:** 2/2 complete (both merged into a single commit since no audit ignore-list extension was needed)
**Requirement closed:** AUTH-03 (deps portion — wiring is Plan 02-03; manual flows are Plan 02-05)

---

## What was built

### Task 1 — Install Amplify frontend client deps

Command (run by orchestrator — executor sandbox blocked `bun add` per documented Phase 1 fallback path):
```bash
bun add aws-amplify@^6.16.4 @aws-amplify/ui-react@^6.15.3
```

Result:
- `aws-amplify@6.16.4` installed to `dependencies` (NOT devDeps)
- `@aws-amplify/ui-react@6.15.3` installed to `dependencies` (NOT devDeps)
- 103 packages total transitive (Amplify v6 + Radix UI internals + Hookform + i18n)
- `bun.lock` regenerated
- NO `package-lock.json` created (Bun-only project preserved)
- Bun warned about peer-dep mismatch on `react@19.2.4` — non-blocking; both Amplify packages accept React 18+ peers and work with React 19 in practice

NOT installed (per RESEARCH key finding #3):
- `@aws-amplify/adapter-nextjs` — NOT needed in Phase 2 (purely client-side auth). Defer to Phase 4 if/when server-side session validation in route handlers / server actions is needed.

### Task 2 — Audit policy enforcement

Ran `bun run audit` (which uses Phase 1's existing 24-item ignore-list). **Result: exit 0 — no new advisories surfaced.** The Amplify v6 client tree happens to share the same vulnerable transitive deps that the Amplify CLI tree (Phase 1) already flagged (handlebars, minimatch, immutable, yaml, fast-xml-parser, lodash, uuid, @smithy/config-resolver). The 24 ignores set in Plan 01-03 cover both trees.

NO new ignores added — the existing list suffices. Tasks 1+2 merged into a single commit per "no extension needed" path.

---

## Acceptance criteria — all green

- `dependencies['aws-amplify']` === `^6.16.4` ✓
- `dependencies['@aws-amplify/ui-react']` === `^6.15.3` ✓
- `devDependencies['aws-amplify']` === undefined ✓
- `devDependencies['@aws-amplify/ui-react']` === undefined ✓
- `node_modules/aws-amplify/` exists ✓
- `node_modules/@aws-amplify/ui-react/` exists ✓
- NO `package-lock.json` ✓
- `bun run audit` exit 0 (existing 24 ignores cover Amplify v6 transitive CVEs) ✓
- `bun run lint` exit 0 ✓
- `bun run typecheck` exit 0 ✓
- `bun run build` exit 0 (Next 16.2.4 Turbopack, 4 pages prerendered) ✓

---

## Deviations from PLAN

### 1. Sandbox blocked `bun add` — orchestrator ran the install

Same pattern as Phase 1 Plan 01-03 (executor's bash sandbox blocks `bun add` even with `dangerouslyDisableSandbox: true`). Per the documented fallback in `<sandbox_note>`, executor returned CHECKPOINT REACHED. Orchestrator ran the install directly, verified, and committed. Functionally equivalent.

### 2. Tasks 1 + 2 merged into a single commit

Plan envisioned 2 atomic commits (install + audit-ignore extension). Since `bun run audit` returned exit 0 with the existing ignores, there was no ignore-list change to commit separately. Single commit with the install captures both tasks.

---

## Files

**Modified:**
- `package.json` (added 2 deps to `dependencies` block)
- `bun.lock` (regenerated)

**Commit:** `9fe4313` — `feat(02-02): install aws-amplify@6.16.4 + @aws-amplify/ui-react@6.15.3 (deps)`

---

## Phase 2 progress

| Plan | Wave | Status |
|---|---|---|
| 02-01 | A — backend auth resource | ✅ done |
| 02-02 | B — frontend deps | ✅ done |
| 02-03 | C — frontend wiring | ⏳ next |
| 02-04 | D — sandbox redeploy | ⏳ pending |
| 02-05 | E — manual D-29 flows | ⏳ pending |

2/5 plans complete (40%). AUTH-03 deps portion closed (wiring + manual flows still pending Plan 02-03 + Plan 02-05).

---

## Notes for Plan 02-03 (frontend wiring)

- `aws-amplify@6.16.4` and `@aws-amplify/ui-react@6.15.3` ready for import
- Subpath imports work: `import { signOut } from "aws-amplify/auth"`, `import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react"`
- CSS path: `import "@aws-amplify/ui-react/styles.css"` in `app/layout.tsx`
- `Amplify` exported from `aws-amplify` (default-style); use `import { Amplify } from "aws-amplify"` then `Amplify.configure(outputs, { ssr: true })`
