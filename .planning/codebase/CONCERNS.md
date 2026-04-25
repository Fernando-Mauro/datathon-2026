# Codebase Concerns

**Analysis Date:** 2026-04-25

## Security Vulnerabilities

**PostCSS XSS Vulnerability:**
- Risk: PostCSS < 8.5.10 has a moderate-severity XSS vulnerability via unescaped `</style>` in CSS Stringify Output (GHSA-qx2v-qp2m-jg93)
- Files: `package.json` (transitive dependency through `@tailwindcss/postcss` and `next`)
- Current mitigation: None - vulnerable version is in use
- Recommendations: Update `postcss` to 8.5.10 or later via `bun update`

**Missing Security Headers:**
- Risk: No security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.) are configured
- Files: `next.config.ts`
- Current mitigation: None configured
- Recommendations: Add `headers()` export to `next.config.ts` to set Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, and other security headers

**Missing Image Domain Configuration:**
- Risk: External image domains not whitelisted in Next.js Image optimization
- Files: `next.config.ts`, `app/page.tsx`
- Current mitigation: None - only internal `/next.svg` and `/vercel.svg` are used currently
- Recommendations: Configure `images.domains` or `images.remotePatterns` in `next.config.ts` before loading any external images

## Missing Critical Infrastructure

**No Authentication System:**
- Problem: No authentication/authorization layer exists
- Files: Project-wide
- Blocks: User-specific features, protected routes, session management
- Recommendations: Plan authentication approach (NextAuth.js, Supabase Auth, custom JWT, etc.) before building user-facing features

**No Testing Infrastructure:**
- Problem: No test framework configured or test files present
- Files: Missing test config, no `.test.tsx` or `.spec.tsx` files
- Risk: Cannot validate behavior changes, untested code paths will accumulate
- Recommendations: Configure Jest or Vitest, add test runner to `package.json` scripts, establish testing patterns

**No Error Boundaries or Error Handling:**
- Problem: No custom error pages or error boundary components
- Files: Missing `error.tsx`, `not-found.tsx`, `layout` error handling
- Risk: Unhandled runtime errors will show raw error screens to users
- Recommendations: Create `app/error.tsx` for client-side error boundaries, `app/not-found.tsx` for 404 handling, consider `app/global-error.tsx`

**No Loading States:**
- Problem: No `loading.tsx` skeleton screens or Suspense boundaries
- Files: Missing `app/loading.tsx`
- Risk: Poor perceived performance and no loading feedback
- Recommendations: Add `app/loading.tsx` for root-level loading UI, use `<Suspense>` in layout for streaming

**No Environment Configuration:**
- Problem: No `.env.example` or `.env.local` file documenting required configuration
- Files: Missing `.env.example`
- Risk: New developers won't know what environment variables to set
- Recommendations: Create `.env.example` documenting all required and optional variables

## Type Safety Issues

**Generated Type Files Using `any`:**
- Problem: Auto-generated Next.js type files (`/.next/types/validator.ts`) use `any` and `@ts-ignore` directives
- Files: `.next/types/validator.ts`
- Impact: Type safety degraded in generated code (auto-generated, not actionable)
- Note: This is acceptable as these are build outputs, not source code

**No Runtime Validation:**
- Problem: No schema validation for environment variables, API responses, or form inputs
- Files: Project-wide
- Risk: Invalid data could flow through system undetected
- Recommendations: Consider libraries like Zod, io-ts, or Valibot when building API routes or handling external data

## Accessibility Gaps

**Missing Alt Text Context:**
- Problem: Decorative images use simple alt text without semantic meaning
- Files: `app/page.tsx` (lines 8-9 and 47-48)
- Risk: Screen reader users may hear repetitive "logo" descriptions
- Recommendations: Use empty alt text (`alt=""`) for purely decorative images, add meaningful alt text for informational images

**Missing ARIA Labels:**
- Problem: Link buttons lack descriptive labels for screen readers
- Files: `app/page.tsx` (lines 38-52, 53-60)
- Risk: Context-dependent buttons may be unclear to assistive technology users
- Recommendations: Add `aria-label` where text alone doesn't clarify purpose (e.g., social media links)

**Hardcoded Color Contrast Not Validated:**
- Problem: Dark mode colors defined in `app/globals.css` and `app/page.tsx` are not contrast-tested
- Files: `app/globals.css` (lines 3-5), `app/page.tsx` (inline styles)
- Risk: Text may not meet WCAG AA/AAA contrast requirements
- Recommendations: Validate color contrast ratios with axe DevTools or similar

## Code Quality Issues

**No Linting Enforcement in CI:**
- Problem: ESLint is configured but `lint` script has no error threshold
- Files: `package.json` (line 9)
- Impact: Lint rules are suggestions, not requirements
- Recommendations: Configure `eslint` command to fail on errors: `"lint": "eslint . --max-warnings=0"`

**Placeholder Metadata:**
- Problem: Default boilerplate metadata not updated
- Files: `app/layout.tsx` (lines 16-17)
- Impact: Site metadata shows "Create Next App" instead of actual project name/description
- Note: This is low priority but should be updated before launch

**Default Vercel-Specific Content:**
- Problem: Page includes template links to Vercel deployment and docs
- Files: `app/page.tsx`
- Impact: Generic template copy should be replaced with actual content
- Recommendations: Replace template content with actual project content before production

## Dependency Management

**Mixed Package Manager Usage:**
- Problem: Using Bun (`bun.lock`) but ESLint/TS configs suggest npm/yarn heritage
- Files: `bun.lock`, `package.json`
- Impact: Lock file mismatch if contributors use different package managers
- Recommendations: Document that Bun is the required package manager, or standardize on npm/yarn across team

**No Package Lock Versioning Strategy:**
- Problem: No `.npmrc`, `.bunfig.toml`, or package manager config documented
- Files: Missing package manager configuration files
- Risk: Different versions of Bun could produce different lock files
- Recommendations: Add `.bunfig.toml` to lock Bun version, or document required version in README

## Testing & Validation Gaps

**No Pre-commit Hooks:**
- Problem: ESLint can run but nothing prevents committing lint violations
- Files: Missing `.husky` or similar pre-commit hook setup
- Risk: Code standards degradation over time
- Recommendations: Set up Husky + lint-staged to enforce linting on commits

**No Build Verification:**
- Problem: No CI/CD pipeline configured to validate builds before merge
- Files: Missing `.github/workflows/` or equivalent
- Risk: Broken builds could be committed to main
- Recommendations: Configure GitHub Actions (or equivalent) to run `bun run build` on pull requests

## Performance Considerations

**Image Optimization Not Configured:**
- Problem: Next.js Image components used but no optimization config
- Files: `next.config.ts`
- Impact: Images loaded without format optimization (WebP, AVIF), responsive sizing
- Note: Next.js provides defaults, but explicit config recommended for production
- Recommendations: Add `images` config for formats, device sizes, and optimization

**No Font Subsetting Beyond Default:**
- Problem: Google Fonts loaded with basic `subsets: ["latin"]`
- Files: `app/layout.tsx` (lines 5-7, 10-12)
- Impact: Loads full font files even if only ASCII is used
- Recommendations: Verify font subsets match actual content, consider removing unused fonts

## Fragile Areas

**Single Layout with No Error Boundary:**
- Problem: Root layout has no error handling
- Files: `app/layout.tsx`
- Why fragile: Any error in page content cascades to entire app
- Safe modification: Always wrap interactive features in `<Suspense>` and `error.tsx` boundaries
- Test coverage: No tests exist to validate layout behavior under error conditions

**Global CSS Overrides Without Scope:**
- Problem: `body` styles in `app/globals.css` override font-family broadly
- Files: `app/globals.css` (line 25)
- Why fragile: Changes here affect all text rendering site-wide
- Risk: Font stack conflicts (Arial/Helvetica vs. CSS variables)
- Safe modification: Document why Arial is chosen over CSS variables, consider removing in favor of CSS variables only

## Known Limitations

**Scaffold Still Contains Template Content:**
- This is a fresh Next.js scaffold with default boilerplate
- No custom business logic, data fetching, or domain-specific functionality implemented yet
- All concerns above assume future development; many are "prevention" rather than "bugs"
- Once feature development begins, revisit this document to identify real runtime issues

---

*Concerns audit: 2026-04-25*
