---
phase: 1
plan: "01-05"
status: complete
completed: 2026-04-25
commits:
  - "<this-commit>"
requirements_addressed:
  - INFRA-01
manual_gate: satisfied
---

# Plan 01-05 Summary — Manual Gate + Empty Sandbox Deploy

**Wave:** E
**Tasks:** 2/2 complete
**Requirement closed:** INFRA-01 (end-to-end validation)

---

## What was built

### Task 1 — Manual gate (satisfied via orchestrator pre-flight)

The plan required a developer-confirmed gate that AWS environment is configured. Orchestrator verified inline:

- AWS CLI v2 installed: `aws-cli/2.34.37 Python/3.14.4 Linux/6.12.63+deb13-amd64`
- IAM user reachable: `aws sts get-caller-identity --profile aws-cli-amplify` returned:
  - UserId: `AIDA6OKO2XKX4UKLIEA7A`
  - Account: `992839645871`
  - Arn: `arn:aws:iam::992839645871:user/aws-cli-amplify`
- `.env.local` exists with `AWS_PROFILE=aws-cli-amplify` and `AWS_REGION=us-east-1`

### Task 2 — Sandbox deploy

**Pre-deploy: CDK Bootstrap (one-time per account+region)**

`AmplifyBackendDeployFullAccess` does NOT include the `cloudformation:CreateChangeSet` permission needed for CDK Bootstrap (creates the `CDKToolkit` stack: S3 staging bucket, IAM roles, ECR repo). User temporarily attached `AdministratorAccess` to the IAM user, ran:

```bash
AWS_PROFILE=aws-cli-amplify npx cdk bootstrap aws://992839645871/us-east-1 --profile aws-cli-amplify
```

`CDKToolkit` stack created in `us-east-1` (12 resources, ~38 seconds). Deploys in this region from now on can reuse this stack — bootstrap is one-time.

**Sandbox deploy (the actual Plan 01-05 deliverable)**

```bash
AWS_PROFILE=aws-cli-amplify AWS_REGION=us-east-1 npx ampx sandbox --once --profile aws-cli-amplify
```

Output (key lines):
```
Identifier:   fernando
Stack:        amplify-datathon2026-fernando-sandbox-0d21400c4f
Region:       us-east-1
Synthesizing backend... ✔ 0.79s
Running type checks... ✔ 5.42s
Building and publishing assets... ✔ 3s
Deployment completed in 7.39 seconds
File written: amplify_outputs.json
```

Total wall-clock: ~17 seconds (empty backend = trivial deploy after CDK Bootstrap was done separately).

`amplify_outputs.json` (22 bytes — minimal because no resources):
```json
{
  "version": "1.4"
}
```

This is the **expected success state for an empty `defineBackend({})`** per RESEARCH §G-13. Phase 2 will populate this file with Cognito User Pool ID, etc.

---

## Acceptance criteria — all green

- `npx ampx sandbox --once` exit 0 ✓
- `amplify_outputs.json` exists at repo root (22 bytes, `{"version": "1.4"}`) ✓
- `git check-ignore -v amplify_outputs.json` matches `.gitignore:46:amplify_outputs*` ✓
- CloudFormation stack `amplify-datathon2026-fernando-sandbox-0d21400c4f` visible via `aws cloudformation list-stacks --status CREATE_COMPLETE` ✓
- `amplify/backend.ts` unchanged from plan 03 commit `68e9174` (no implicit drift during deploy) ✓
- `bun run lint` exit 0 ✓
- `bun run typecheck` exit 0 ✓
- `bun run build` exit 0 (4 pages prerendered) ✓
- `bun run audit` exit 0 (with ignore-list from plan 03) ✓

---

## Deviations from PLAN

### 1. AWS profile name — `aws-cli-amplify` instead of `datathon-2026`

PLAN/CONTEXT/README suggested profile name `datathon-2026`. User chose to use a pre-existing profile `aws-cli-amplify` configured in `~/.aws/credentials`. Functionally equivalent — `.env.local` and all `--profile` flags reference `aws-cli-amplify` consistently. Not worth retrofitting docs.

### 2. CDK Bootstrap required temporary admin escalation

`AmplifyBackendDeployFullAccess` lacks `cloudformation:CreateChangeSet`. User-approved deviation: temporarily attached `AdministratorAccess`, ran bootstrap, will detach after this commit. Bootstrap is one-time per account+region — future deploys (including Phase 5 production) reuse the same `CDKToolkit` stack.

This is a known IAM gap in the AWS-provided managed policies for Amplify Gen 2. Long-term mitigation options for the team:
- Keep a separate "bootstrap" admin profile/user
- Document the temporary escalation procedure in README §Setup (TODO for future polish)

### 3. IAM eventual consistency

After attaching `AdministratorAccess`, the first `cdk bootstrap` call still failed with `AccessDenied` because the policy hadn't propagated to the regional CloudFormation endpoint. ~90 seconds later the same call succeeded. Documented for future operators.

### 4. Sandbox deploy run from orchestrator (not executor)

The executor agent's bash sandbox blocks `npx ampx sandbox` even with `dangerouslyDisableSandbox: true`. Orchestrator ran the deploy directly. Functionally equivalent — `gsd-sdk query commit` will record this as a normal Plan 01-05 closure.

---

## Files

**No source code changes** — Plan 05 is a deploy/validation plan. Only side effect:
- `amplify_outputs.json` generated at repo root (gitignored — does NOT enter the commit)

**Generated AWS resources** (out of repo):
- CloudFormation stack `CDKToolkit` (one-time bootstrap, `us-east-1`)
- CloudFormation stack `amplify-datathon2026-fernando-sandbox-0d21400c4f` (sandbox; tear down with `npx ampx sandbox delete --profile aws-cli-amplify`)
- S3 buckets, IAM roles, ECR repo (children of the two stacks above)

---

## Phase 1 progress: COMPLETE (5/5)

| Plan | Wave | Status | Commit |
|---|---|---|---|
| 01-01 | A — CVE PostCSS + scripts | ✅ done | `fb9b158` |
| 01-02 | B — boundaries + .env + .gitignore | ✅ done | `59b8848` |
| 01-03 | C — Amplify install + skeleton | ✅ done | `2dc772e` |
| 01-04 | D — README setup | ✅ done | `05f526b` |
| 01-05 | E — Manual gate + sandbox deploy | ✅ done | `<this-commit>` |

**ROADMAP §Phase 1 success criteria — all met:**
1. ✅ `bun audit` clean of GHSA-qx2v-qp2m-jg93 (closed via `package.json` overrides → postcss@8.5.10)
2. ✅ `amplify/backend.ts` exists with `defineBackend({})` (Plan 03)
3. ✅ `npx ampx sandbox` deploys CloudFormation stack — verified live: `amplify-datathon2026-fernando-sandbox-0d21400c4f`
4. ✅ `bun run build` and `bun run lint` pass after Amplify added (re-verified post-deploy)

**Requirements closed:** INFRA-01 (Amplify Gen 2 backend skeleton + sandbox-deployable), INFRA-03 (PostCSS CVE).

---

## Next steps

**Immediate:**
1. **Detach `AdministratorAccess`** from IAM user `aws-cli-amplify` (security hygiene — orchestrator will prompt user inline).
2. **Optional teardown** of the sandbox stack to avoid AWS charges:
   ```bash
   npx ampx sandbox delete --profile aws-cli-amplify
   ```
   The deployed empty stack costs ~$0/month at idle but the S3 staging bucket from CDK Bootstrap may have small storage charges. Phase 2 will redeploy when needed.

**Phase 2 readiness:**
- All Phase 1 deliverables in place. Phase 2 (Email/Password Auth + Authenticator UI) can begin.
- Run `/gsd-discuss-phase 2` next.
