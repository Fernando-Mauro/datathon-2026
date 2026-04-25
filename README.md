This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Setup

This project ships with a minimal AWS Amplify Gen 2 backend skeleton (`amplify/backend.ts` — currently a bare `defineBackend({})`). Before you can deploy a personal sandbox, configure your local AWS environment.

### Prerequisites

- Node.js ≥ 20.6.0 — verify with `node --version`
- Bun ≥ 1.3 — verify with `bun --version` (project uses Bun for `bun audit` and as the package manager)
- AWS CLI v2 — verify with `aws --version` (install instructions in step 1 below if missing)
- An AWS account and an IAM user (or IAM Identity Center user) with the `AmplifyBackendDeployFullAccess` managed policy attached.

### 1. Install AWS CLI v2 (if not already installed)

On Linux x86_64:

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install -i /usr/local/aws-cli -b /usr/local/bin
aws --version
```

For macOS, Windows, or other architectures see https://aws.amazon.com/cli/.

### 2. Create / pick an AWS IAM user

In the AWS Console → IAM → Users → "Create user".
Attach managed policy: `AmplifyBackendDeployFullAccess`.
Generate an access key (Other → CLI). Save the access key ID and secret somewhere safe — you'll paste them into `aws configure` in the next step.

### 3. Configure your local AWS profile

Pick ONE of the two flows:

**Option A — Long-lived access keys (simplest):**

```bash
aws configure --profile datathon-2026
# AWS Access Key ID:     <paste from step 2>
# AWS Secret Access Key: <paste from step 2>
# Default region name:   us-east-1
# Default output format: json
```

**Option B — IAM Identity Center / SSO (AWS-recommended for daily use):**

```bash
aws configure sso
# Follow the interactive prompts. Use the same profile name (datathon-2026)
# so the rest of this README applies unchanged.
```

Both flows work with `npx ampx sandbox`.

> **Why no access keys in `.env`?** AWS access keys belong in `~/.aws/credentials` (managed by `aws configure`), NOT in `.env.local`. See the warning block in `.env.example`.

### 4. Verify AWS access

```bash
aws sts get-caller-identity --profile datathon-2026
# Should print { "UserId": "...", "Account": "...", "Arn": "..." } with exit code 0.
```

If this fails, fix it before continuing — `npx ampx sandbox` won't work either.

### 5. Set the project env

```bash
cp .env.example .env.local
# Edit .env.local if your profile name differs from `datathon-2026`.
```

`.env.local` is gitignored. The repo only ever tracks `.env.example`.

### 6. Install dependencies

```bash
bun install
```

### 7. Deploy the sandbox

```bash
AWS_PROFILE=datathon-2026 npx ampx sandbox
```

Always invoke the Amplify CLI through `npx` (do not launch it via Bun's binary launcher) — Amplify's CLI tooling currently has rough edges with non-`npx` package managers.

**First run takes ~5-8 minutes** because it provisions the CDK bootstrap stack (`CDKToolkit`) in your chosen region. Subsequent runs in the same region take ~30 seconds (CDK hot-swap deploys).

The command stays in watch mode (any save to a file under `amplify/` triggers a hot redeploy). Press `Ctrl+C` to exit watch mode without destroying the stack.

When you're done for the day and want to fully tear down:

```bash
AWS_PROFILE=datathon-2026 npx ampx sandbox delete
```

> **Region precedence (highest wins):**
> 1. `AWS_REGION` env var (set in `.env.local`)
> 2. The region recorded in `~/.aws/config` for the AWS_PROFILE above
> 3. AWS CLI default region
>
> `us-east-1` is recommended (broadest service availability, low latency from US/LATAM). Change `AWS_REGION` in `.env.local` to deploy elsewhere.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
