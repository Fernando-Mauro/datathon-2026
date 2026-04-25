---
phase: 1
plan: "01-03"
status: complete
completed: 2026-04-25
commits:
  - "5c325aa"
  - "68e9174"
requirements_addressed:
  - INFRA-01
---

# Plan 01-03 Summary — Manual Amplify Gen 2 Install + Backend Skeleton

**Wave:** C
**Tasks:** 2/2 complete
**Requirement closed:** INFRA-01 (skeleton portion)

---

## What was built

### Task 1 — Install Amplify Gen 2 devDeps via Bun (orchestrator-completed)

Installed via `bun add -d`:
- `@aws-amplify/backend@1.22.0`
- `@aws-amplify/backend-cli@1.8.2` (provides `ampx` and `amplify` binaries)
- `aws-cdk-lib@2.244.0` (exact pin per PLAN.md to avoid transitive drift)
- `constructs@10.6.0`
- `tsx@4.21.0`
- `esbuild@0.28.0`

NOT installed:
- `aws-amplify` (frontend client) — Phase 2 only
- `package-lock.json` does NOT exist — Bun-only project preserved

Did NOT use `npm create amplify@latest` / `npx create-amplify` / `bun create amplify` — incompatible with Bun (G-3) AND ships unwanted `auth/`+`data/` template (G-4).

Committed in `5c325aa`.

### Task 1 deviation from PLAN — `audit` script ignore-list

**Problem:** Installing Amplify Gen 2 introduced 24 transitive CVEs in build-tool dependencies (`handlebars`, `minimatch`, `immutable`, `yaml`, `fast-xml-parser`, `lodash`, `uuid`, `@smithy/config-resolver`). All build-time only — none ship to runtime. The `audit` script (`bun audit`) became permanently red.

**User decision (via AskUserQuestion):** Add an explicit `--ignore` list to the `audit` script. Each accepted advisory is visible in `package.json` so future updates can revoke entries when Amplify ships fixes.

**Implementation:** Updated `package.json` `scripts.audit` to:
```
bun audit --audit-level=moderate --ignore=<24 GHSA IDs>
```

Accepted GHSAs by package:
- `handlebars`: `GHSA-3mfm-83xf-c92r`, `GHSA-2w6w-674q-4c4q`, `GHSA-2qvq-rjwj-gvw9`, `GHSA-7rx3-28cr-v5wh`, `GHSA-442j-39wm-28r2`, `GHSA-xjpj-3mr7-gcpf`, `GHSA-xhpv-hc6g-r9c6`, `GHSA-9cx6-37pm-9jff`
- `minimatch`: `GHSA-3ppc-4f35-3m26`, `GHSA-7r86-cg39-jmmj`, `GHSA-23c5-xmqv-rm74`
- `immutable`: `GHSA-wf6x-7x77-mvgw`
- `yaml`: `GHSA-48c2-rrv3-qjmp`
- `fast-xml-parser`: `GHSA-37qj-frw5-hhjh`, `GHSA-m7jm-9gc2-mpf2`, `GHSA-jmr7-xgp7-cmfj`, `GHSA-fj3w-jwp8-x2g3`, `GHSA-8gc5-j5rx-235r`, `GHSA-jp2q-39xq-3w4g`, `GHSA-gh4j-gqv2-49f6`
- `lodash`: `GHSA-r5fr-rjxr-66jc`, `GHSA-f23m-r3pf-42rh`
- `uuid`: `GHSA-w5hq-g745-h8pq`
- `@smithy/config-resolver`: `GHSA-6475-r3vj-m8vf`

**Note:** `GHSA-qx2v-qp2m-jg93` (PostCSS, INFRA-03) remains closed via `package.json` overrides — NOT in the ignore-list. The runtime stack remains clean.

**Future maintenance:** When Amplify ships dependency updates, run `bun audit` (raw, without ignore-list flags) to see which advisories are still active. Remove resolved IDs from the script.

### Task 2 — Skeleton files + root tsconfig exclude

Created (DOUBLE QUOTES throughout per PATTERNS.md normalization):

**`amplify/backend.ts`**:
```typescript
import { defineBackend } from "@aws-amplify/backend";

/**
 * Phase 1: Bare backend skeleton — no resources yet.
 * Phase 2 will add auth (Cognito + email/password).
 * @see https://docs.amplify.aws/nextjs/build-a-backend/
 */
defineBackend({});
```

**`amplify/package.json`** — declares ESM (G-5):
```json
{
  "type": "module"
}
```

**`amplify/tsconfig.json`** — ES2022 strict + `$amplify/*` path alias for generated outputs:
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

**`tsconfig.json` (root)** — modified `exclude` array to `["node_modules", "amplify/**/*"]` per G-6, so Next's TS compilation does not try to compile the backend (which uses `aws-cdk-lib` and `$amplify/*` paths the root tsconfig does not know about).

NOT created (per D-05/D-06): `amplify/auth/`, `amplify/data/`, `amplify/storage/` — Phase 2+ only.

Committed in `68e9174`.

---

## Acceptance criteria — all green

- `package.json` `devDependencies` contains all 6 Amplify deps; `aws-cdk-lib` exactly `2.244.0`; `aws-amplify` NOT present ✓
- No `package-lock.json` ✓
- `amplify/backend.ts` exists with `defineBackend({})` and `from "@aws-amplify/backend"` import ✓
- `amplify/package.json` declares `{"type": "module"}` ✓
- `amplify/tsconfig.json` declares `$amplify/*` path alias ✓
- Root `tsconfig.json` excludes `amplify/**/*` ✓
- No `amplify/auth/`, `amplify/data/`, `amplify/storage/` directories ✓
- `cd amplify && npx --no-install tsc --noEmit` exits 0 ✓
- `bun run lint` exits 0 ✓
- `bun run typecheck` exits 0 ✓
- `bun run build` exits 0 (4 pages compiled) ✓
- `bun run audit` exits 0 (with ignore-list; PostCSS CVE remains closed) ✓

---

## Files

**Created:**
- `amplify/backend.ts`
- `amplify/package.json`
- `amplify/tsconfig.json`

**Modified:**
- `package.json` (added 6 devDeps + `audit` script ignore-list — Task 1)
- `bun.lock` (regenerated — Task 1)
- `tsconfig.json` (added `amplify/**/*` to exclude — Task 2)

**Commits:**
- `5c325aa` — `feat(01-03): install Amplify Gen2 devDeps + audit ignore-list for transitive build-tool CVEs`
- `68e9174` — `feat(01-03): create empty Amplify backend skeleton + exclude amplify from root tsconfig`

---

## Phase 1 progress

| Plan | Wave | Status |
|---|---|---|
| 01-01 | A — CVE PostCSS + scripts | ✅ done |
| 01-02 | B — boundaries + .env + .gitignore | ✅ done |
| 01-03 | C — Amplify install + skeleton | ✅ done |
| 01-04 | D — README setup | ⏳ next |
| 01-05 | E — Manual gate + sandbox deploy | ⏳ pending |

3/5 plans complete (60%). INFRA-03 closed (Plan 01-01). INFRA-01 partial — file structure done; end-to-end deploy validation pending Plan 01-05.

---

## Notes for Plan 01-04 (README)

- Document the AWS CLI v2 install commands (CONFIRMED NOT INSTALLED on this machine — RESEARCH §Environment Availability).
- Suggest profile name `datathon-2026` (per CONTEXT D-12, D-13 + RESEARCH §6).
- Suggest region `us-east-1` (per CONTEXT D-11 + RESEARCH §6).
- Set expectation: first `npx ampx sandbox` per region takes 5-8 min for CDK Bootstrap (G-9).
- Use `npx ampx`, NOT `bunx ampx` (G-10).
