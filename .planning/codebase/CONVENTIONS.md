# Coding Conventions

**Analysis Date:** 2026-04-25

## Naming Patterns

**Files:**
- Component files: PascalCase with `.tsx` extension (e.g., `page.tsx`, `layout.tsx`)
- Config files: camelCase or kebab-case with appropriate extensions (e.g., `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`)
- Asset and data files: lowercase with hyphens (e.g., `globals.css`)

**Functions:**
- React components: PascalCase (e.g., `Home()`, `RootLayout()`)
- Regular functions/helpers: camelCase
- Exported functions/modules: Named exports with descriptive names
- Handler functions: Prefixed with verb (`handle`, `on`) followed by camelCase event name

**Variables:**
- Constants: camelCase or UPPER_SNAKE_CASE for module-level configuration
- Component props: camelCase
- CSS class utilities: lowercase with hyphens (Tailwind CSS convention)

**Types:**
- TypeScript types and interfaces: PascalCase (e.g., `Metadata`, `Readonly`)
- Type imports marked explicitly: `import type { Metadata } from "next"`
- Props interfaces: ComponentName suffixed with `Props` or inline with Readonly generic

## Code Style

**Formatting:**
- No dedicated Prettier config file present — uses Next.js/ESLint defaults
- Indentation: 2 spaces (Next.js standard)
- Quote style: Double quotes for JSX and strings
- Semicolons: Present throughout
- Line length: Typical Next.js default (no explicit configuration observed)

**Linting:**
- Tool: ESLint 9.x with flat config format
- Config file: `eslint.config.mjs` (modern ESLint format using ES modules)
- Extends: `eslint-config-next` with two preset configurations:
  - `nextVitals`: Core Web Vitals rules
  - `nextTs`: TypeScript support rules
- Global ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- Run command: `npm run lint` (defined as `eslint` in `package.json`)

## Import Organization

**Order:**
1. External library imports (Next.js, React)
2. Type imports (explicitly marked with `import type`)
3. Local/internal imports
4. CSS/style imports

**Example from codebase:**
```typescript
import Image from "next/image";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
```

**Path Aliases:**
- Base alias: `@/*` maps to `./*` (project root)
- Defined in `tsconfig.json` under `compilerOptions.paths`
- Current implementation allows importing from root level

## Error Handling

**Patterns:**
- No explicit error handling patterns evident in scaffold code
- Next.js default error handling applies (error boundaries at route level)
- Type safety via strict TypeScript (`"strict": true` in `tsconfig.json`)

## Logging

**Framework:** Console API (no external logging library configured)

**Patterns:**
- Not yet established in codebase — scaffold is minimal
- Recommend using `console.log()`, `console.error()`, `console.warn()` for now

## Comments

**When to Comment:**
- No explicit JSDoc/TSDoc usage in current scaffold
- Comments for non-obvious logic preferred
- File-level comments for major components optional

**JSDoc/TSDoc:**
- Not enforced; consider adding for exported functions and complex types as codebase grows

## Function Design

**Size:** Small, focused functions preferred (React component pattern)

**Parameters:**
- React Server Components: Use destructuring for props
- Props pattern: Readonly wrapper for immutability (see `layout.tsx` example)

**Return Values:**
- React components return JSX elements
- Handlers return void or Promise for async operations

## Module Design

**Exports:**
- Default exports for page/layout components (Next.js requirement)
- Named exports for utilities and helper functions
- Use explicit `export default` for clarity

**Barrel Files:**
- Not currently used in scaffold; consider for lib/ or utils/ directories if created
- Follow pattern: re-export all public API from `index.ts`

## TypeScript Patterns

**Compiler Options:**
- Target: ES2017
- Module: ESNext
- Strict mode: Enabled
- JSX: react-jsx (automatic JSX transformation)
- incremental: true (faster rebuilds)

**Type Imports:**
- Always use `import type` for types (seen in `layout.tsx`)
- Helps tree-shaking and clarity

## Styling

**Framework:** Tailwind CSS v4 with PostCSS integration

**Pattern:**
- Utility-first CSS with Tailwind classes
- Custom theme variables via CSS custom properties
- Dark mode support via `dark:` prefix

**Example from codebase:**
```tsx
<div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
```

**CSS Imports:**
- Global styles in `app/globals.css`
- Imported in root layout
- Use `@import "tailwindcss"` and `@theme` directives for configuration

---

*Convention analysis: 2026-04-25*
