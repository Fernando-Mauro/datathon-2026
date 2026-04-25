# Technology Stack

**Analysis Date:** 2026-04-25

## Languages

**Primary:**
- TypeScript 5.x - All source files (`.ts`, `.tsx`)

**Secondary:**
- JavaScript (CommonJS) - Configuration files (`.mjs`)

## Runtime

**Environment:**
- Node.js 20.x (current runtime version: 20.20.0, no version pinning via `.nvmrc`)

**Package Manager:**
- Bun (lockfile: `bun.lock` present, 107KB)
- Also supports npm, yarn, pnpm for development scripts

## Frameworks

**Core:**
- Next.js 16.2.4 - Full-stack React framework with App Router
- React 19.2.4 - UI component library
- React DOM 19.2.4 - React rendering engine

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework
- @tailwindcss/postcss 4.x - PostCSS plugin for Tailwind
- PostCSS - CSS processing (via `postcss.config.mjs`)

**Fonts:**
- next/font/google - Automatic font optimization (Geist font family preloaded)

## Key Dependencies

**Critical:**
- next@16.2.4 - App Router, server components, build tooling, image optimization
- @types/node@^20 - Node.js type definitions
- @types/react@^19 - React type definitions
- @types/react-dom@^19 - React DOM type definitions

**Build & Tooling:**
- tailwindcss@^4 - CSS utility generation
- @tailwindcss/postcss@^4 - Modern Tailwind integration
- typescript@^5 - Type checking and transpilation

**Linting:**
- eslint@^9 - JavaScript/TypeScript linting
- eslint-config-next@16.2.4 - Next.js linting rules and web vitals config

## Configuration

**TypeScript:**
- File: `tsconfig.json`
- Target: ES2017
- Module: esnext with bundler resolution
- Strict mode: enabled
- Path aliases: `@/*` maps to project root
- Includes: TypeScript files (`.ts`, `.tsx`), generated Next.js types, module type definitions
- Excludes: `node_modules`

**Build/Dev:**
- Next.js config: `next.config.ts` (minimal default configuration)
- PostCSS config: `postcss.config.mjs` (Tailwind integration)
- ESLint config: `eslint.config.mjs` (flat config format)
  - Includes: Core Web Vitals rules + TypeScript rules
  - Ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`

**Development Scripts:**
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

## Platform Requirements

**Development:**
- Node.js 20.x or compatible
- Bun or npm/yarn/pnpm for package management
- ESLint 9.x for linting
- TypeScript 5.x for type checking

**Production:**
- Node.js 20.x (runtime compatible)
- Vercel (recommended deployment target per README)
- Standard HTTP server for `next start`

**Special Notes:**
- trustedDependencies: `sharp`, `unrs-resolver` (native module handling in Bun)
- ignoreScripts: `sharp`, `unrs-resolver` (skip post-install scripts)

---

*Stack analysis: 2026-04-25*
