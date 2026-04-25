# Codebase Structure

**Analysis Date:** 2026-04-25

## Directory Layout

```
datathon-2026/
├── app/                    # Next.js App Router application directory
│   ├── favicon.ico         # Browser tab icon
│   ├── globals.css         # Global styles and Tailwind import
│   ├── layout.tsx          # Root layout (wraps all pages)
│   └── page.tsx            # Home page route (/)
├── public/                 # Static assets served at URL root
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── node_modules/           # Package dependencies (not committed)
├── .next/                  # Next.js build output (generated)
├── .git/                   # Git repository data
├── .planning/              # Project planning documents
│   └── codebase/           # Codebase analysis documents
├── .claude/                # Claude agent configuration
├── eslint.config.mjs       # ESLint configuration (flat format)
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── postcss.config.mjs       # PostCSS configuration (for Tailwind)
├── package.json            # Node.js dependencies and scripts
├── bun.lock                # Bun package lock file
├── .gitignore              # Git ignore rules
├── next-env.d.ts           # Next.js generated type definitions
├── AGENTS.md               # Agent guidelines (breaking changes warning)
├── CLAUDE.md               # Links to AGENTS.md
└── README.md               # Project documentation
```

## Directory Purposes

**`app/`:**
- Purpose: Next.js App Router directory containing routes, layouts, and pages
- Contains: `.tsx` files for pages, layouts, and page components
- Key files: `layout.tsx` (root layout), `page.tsx` (home page), `globals.css` (global styles)

**`public/`:**
- Purpose: Static file serving at application root URL
- Contains: Images (SVG icons), favicon, any public assets
- Access pattern: Files accessible at `/<filename>` (e.g., `/next.svg`)

**`node_modules/`:**
- Purpose: Installed npm/bun packages
- Contains: React, Next.js, Tailwind, TypeScript, ESLint, and their dependencies
- Status: Generated on install, not committed to git

**`.next/`:**
- Purpose: Next.js build output and development cache
- Contains: Compiled JavaScript, static assets, build metadata
- Status: Generated on build/dev, not committed to git

**`.planning/`:**
- Purpose: GSD agent planning and analysis documents
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md
- Status: Checked into git

**`.claude/`:**
- Purpose: Claude agent configuration
- Contains: Agent-specific settings and skill definitions
- Files: `settings.local.json`

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout (app initialization, metadata, fonts)
- `app/page.tsx`: Home page route at `/`
- `next.config.ts`: Next.js configuration entry point

**Configuration:**
- `tsconfig.json`: TypeScript compiler options, path aliases (`@/*` → `./*`)
- `next.config.ts`: Next.js-specific configuration (currently empty)
- `postcss.config.mjs`: PostCSS plugins (Tailwind CSS)
- `eslint.config.mjs`: ESLint rules and configuration

**Styling:**
- `app/globals.css`: Global CSS, Tailwind import, custom properties, dark mode

**Build & Runtime:**
- `package.json`: Dependencies, version info, build scripts
- `bun.lock`: Package lock file (uses Bun as package manager)
- `.gitignore`: Files excluded from git

**Type Definitions:**
- `next-env.d.ts`: Auto-generated Next.js types
- `node_modules/` .d.ts files: Type definitions from dependencies

## Naming Conventions

**Files:**
- Pages: `page.tsx` (lowercase, special convention)
- Layouts: `layout.tsx` (lowercase, special convention)
- Config files: Descriptive names (e.g., `next.config.ts`, `tsconfig.json`)
- CSS: `globals.css` (global) or imported within components
- Components: PascalCase (e.g., `RootLayout`, `Home`) when defined inline

**Directories:**
- Special App Router directories: lowercase (`app/`, `public/`)
- Feature directories: Would use lowercase with hyphens (pattern not yet used)

**Type Exports:**
- Metadata type imported from `next` package
- Component props typed with React.ReactNode, Readonly generics

## Where to Add New Code

**New Pages:**
- Location: `app/[route-name]/page.tsx`
- Pattern: Create directory under `app/`, add `page.tsx` file
- Example: `app/dashboard/page.tsx` for `/dashboard` route

**New Layouts:**
- Location: `app/[segment]/layout.tsx`
- Pattern: Wrap specific route segments with shared UI
- Example: `app/dashboard/layout.tsx` for dashboard-specific layout

**New Components:**
- Recommendation: Create `components/` directory at root level (not yet present)
- Pattern: `components/[ComponentName].tsx` or `components/[category]/[ComponentName].tsx`
- Do NOT currently import from paths outside `app/` — need to establish structure first

**Utility Functions:**
- Recommendation: Create `lib/` directory at root level (not yet present)
- Pattern: `lib/[utility-name].ts`
- Use path alias: `import { util } from "@/lib/[utility-name]"`

**Styling:**
- Global styles: Add to `app/globals.css`
- Component-scoped styles: Use Tailwind classes inline or create `.module.css` files (pattern not yet established)

**API Routes:**
- Location: `app/api/[route]/route.ts`
- Pattern: Export handler functions (GET, POST, etc.) from `route.ts`
- Not yet present; when adding, establish error handling and validation patterns

**Middleware:**
- Location: `middleware.ts` at root of project
- Purpose: Request/response interception (authentication, redirects, etc.)
- Not yet present

## Special Directories

**`.git/`:**
- Purpose: Git version control repository
- Contains: Commit history, branches, configuration
- Generated: Yes (initialized by `git init`)
- Committed: N/A (git metadata)

**`node_modules/`:**
- Purpose: Installed package dependencies
- Generated: Yes (created by `npm install` or `bun install`)
- Committed: No (in `.gitignore`)

**`.next/`:**
- Purpose: Next.js development and build cache
- Generated: Yes (created on `next dev` or `next build`)
- Committed: No (in `.gitignore`)

**`.planning/codebase/`:**
- Purpose: Architecture and structure analysis documents
- Generated: Yes (created by GSD codebase mapper agents)
- Committed: Yes (tracks codebase decisions)

## Current Limitations & Future Structure

**Not Yet Established:**
- `components/` directory for reusable React components
- `lib/` directory for utility functions and helpers
- `api/` routes under `app/`
- Form validation library or patterns
- State management solution
- Testing directory structure
- Environment variable schema

**Path Aliases Currently Available:**
- `@/*` resolves to root directory (configured in `tsconfig.json`)

**Recommendations for Next Phase:**
1. Create `components/` directory with subdirectories by feature (e.g., `components/forms/`, `components/ui/`)
2. Create `lib/` directory with `utils/`, `api/`, `hooks/` subdirectories
3. Establish `app/api/` routes if API needed, with consistent error response patterns
4. Create `.env.example` documenting required environment variables
5. Add test directory structure (e.g., `__tests__/`) once testing framework is chosen

---

*Structure analysis: 2026-04-25*
