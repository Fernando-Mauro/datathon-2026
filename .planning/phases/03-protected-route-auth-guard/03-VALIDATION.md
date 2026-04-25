---
phase: 3
slug: protected-route-auth-guard
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-25
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source: 03-RESEARCH.md §Validation Architecture (lines 824-857).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | **None installed** — project has zero test runner (verified in `package.json`: no `vitest`, `jest`, `playwright`, `cypress`). Per CONTEXT user constraint "shippeable hoy", Phase 3 does NOT install one. |
| **Config file** | none |
| **Quick run command** | `bun run lint && bun run typecheck` |
| **Full suite command** | `bun run lint && bun run typecheck && bun run audit && bun run build` (Phase 1 gauntlet) |
| **Estimated runtime** | ~10s quick / ~30-60s full (prod build dominates; catches K-3 / L-1 Suspense regression) |

---

## Sampling Rate

- **After every task commit:** `bun run lint && bun run typecheck`
- **After every plan wave:** `bun run lint && bun run typecheck && bun run audit && bun run build`
- **Before `/gsd-verify-work`:** Full suite green + 4 manual walkthroughs (see Manual-Only table)
- **Max feedback latency:** ~60s (production build dominates)

---

## Per-Task Verification Map

*Filled by gsd-planner. Each task in PLAN.md must have either an `<automated>` verify command or a Wave 0 dependency.*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | AUTH-04 | TBD | TBD | TBD | TBD | TBD | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] **No test runner install** — explicit decision per CONTEXT "shippeable hoy"; Layers 2-3 (unit, integration) intentionally empty
- [ ] **No E2E framework** — Playwright deferred (CONTEXT backlog item)
- [ ] **`safeFromPath` unit tests** — listed as desirable in CONTEXT backlog but not required for Phase 3 ship; the pure function is small enough that visual code review covers correctness

*Phase 3 ships with manual + static validation only — mirrors Phase 2 D-29's manual-flow approach which the user already accepted.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/app` without session redirects to `/login?from=%2Fapp` | AUTH-04 | No test runner; flow requires real `Authenticator.Provider` + Cognito sandbox | Open browser incognito → `http://localhost:3000/app` → expect redirect to `/login?from=%2Fapp` (URL-encoded) |
| `/app` with session shows email + name | AUTH-04 | Requires real Cognito session and `fetchUserAttributes()` round trip | Sign in via `<Authenticator>` with seeded test user → land on `/app` → see `Welcome, {fullname}` + email |
| Guard pattern reusable | AUTH-04 | Reusability is structural (typed exports) | Code review of `app/_components/AuthGuard.tsx` — `import { AuthGuard } from "@/app/_components/AuthGuard"` resolves cleanly from any route file |
| `?from=` allowlist rejects open redirect | AUTH-04 (security) | Manual probe — no e2e | Visit `/login?from=//evil.com` → sign in → MUST land on `/app` (not evil.com); also test `/login?from=javascript:alert(1)` and `/login?from=/login?from=/login` (loop) |
| `<Suspense>` boundary survives prod build | AUTH-04 (UX/L-1) | Build-time check, not runtime | `bun run build` exits 0; without Suspense Next 16 fails with "useSearchParams should be wrapped in a suspense boundary" |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify (lint/typecheck/build) or are explicitly manual-only with rationale
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (lint+typecheck after each commit catches most regressions)
- [ ] Wave 0 acknowledges no test framework (explicit decision)
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter (after planner + auditor pass)

**Approval:** pending — auditor + verifier sign off after execution
