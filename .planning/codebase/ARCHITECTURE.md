# Architecture

**Analysis Date:** 2026-04-25

## Pattern Overview

**Overall:** Next.js App Router (server-first architecture)

**Key Characteristics:**
- File-based routing using the `app/` directory
- Server components by default, client components opted into with `"use client"`
- React 19.2.4 with latest JSX transform
- Metadata API for SEO using `Metadata` type from `next`
- Tailwind CSS v4 with inline theme variables
- TypeScript strict mode enforced

## Layers

**Presentation Layer:**
- Purpose: Render UI components and handle user interactions
- Location: `app/` directory with `.tsx` files
- Contains: Page components, layouts, server and client components
- Depends on: React, Next.js built-ins (`next/image`, `next/font`), Tailwind CSS
- Used by: Browser client rendering

**Layout Layer:**
- Purpose: Define hierarchical page structure and shared UI
- Location: `app/layout.tsx` (root layout)
- Contains: HTML structure, font setup, metadata configuration, global styles
- Depends on: `next/font` for Google Fonts, `next` metadata API
- Used by: All pages in the app

**Styling Layer:**
- Purpose: Define visual appearance and responsive behavior
- Location: `app/globals.css`
- Contains: Tailwind CSS import, CSS custom properties, dark mode media queries, base typography
- Depends on: Tailwind CSS v4, CSS custom properties
- Used by: All components via class names

**Static Assets:**
- Purpose: Serve images, icons, and public files
- Location: `public/` directory
- Contains: SVG files (next.svg, vercel.svg, globe.svg, file.svg, window.svg, favicon.ico)
- Depends on: None
- Used by: Image components and direct references in HTML

## Data Flow

**Page Render Flow:**

1. Browser requests `/` (root path)
2. Next.js routes to `app/page.tsx` (Home component)
3. Home component is rendered as server component by default
4. Renders nested JSX with Tailwind classes and Next.js Image component
5. Server-rendered HTML returned to browser
6. Browser displays styled page with loaded images

**Layout Composition:**

1. `app/layout.tsx` (RootLayout) wraps all pages
2. Loads Google Fonts (Geist, Geist Mono) at build time
3. Applies font CSS variables and Tailwind classes to `<html>` and `<body>`
4. Renders `{children}` which inserts page-specific content
5. `app/page.tsx` (Home) rendered as children of RootLayout
6. Global styles from `globals.css` applied to all content

**Static Asset Loading:**

1. Assets in `public/` are accessible at root URL (e.g., `/next.svg`)
2. `Next/image` component optimizes images on demand
3. Priority images (like next.svg in Home) preload during page load

## Key Abstractions

**RootLayout:**
- Purpose: Establishes app-wide structure and metadata
- Examples: `app/layout.tsx`
- Pattern: Server component exporting Metadata and default function
- Responsibilities: Set document language, apply fonts and global styling, define title and description

**Page Components:**
- Purpose: Define content for specific routes
- Examples: `app/page.tsx` (Home component)
- Pattern: Server components by default, exported as default export
- Responsibilities: Render route-specific UI, manage component hierarchy

**Global Styling:**
- Purpose: Centralized CSS for entire application
- Examples: `app/globals.css`
- Pattern: Imported in root layout, uses Tailwind `@import`, CSS custom properties, media queries
- Responsibilities: Define color scheme, typography, dark mode support

**Image Optimization:**
- Purpose: Deliver optimized images with responsive sizing
- Examples: Next.js `Image` component from `next/image`
- Pattern: Wrapper around HTML `<img>` with width, height, priority props
- Responsibilities: Automatic format selection, lazy loading, performance optimization

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Every page load (all routes inherit this layout)
- Responsibilities: Define HTML structure, load fonts, apply global metadata, inject CSS variables

**Home Page:**
- Location: `app/page.tsx`
- Triggers: Navigation to `/`
- Responsibilities: Render homepage UI with hero content, links to deployment and docs

## Error Handling

**Strategy:** Not yet implemented (default Next.js error handling in place)

**Patterns:**
- No custom error boundaries detected
- No error.tsx files present in app directory
- Will fall back to Next.js default error page on runtime errors

## Cross-Cutting Concerns

**Logging:** Not implemented (no logging framework configured)

**Validation:** Not implemented (no form validation or input validation detected)

**Authentication:** Not implemented (no auth middleware or providers present)

**Styling:** Tailwind CSS v4 with @theme inline for custom font variables

**Metadata:** Using Next.js Metadata API in layout; currently static title and description

## Wired vs Not Yet Wired

**Wired:**
- File-based routing (App Router fully configured)
- Root layout and single page
- Tailwind CSS v4 integration
- Google Fonts (Geist family) loaded and applied
- Image component from Next.js (optimized static image in page)
- Dark mode support via CSS media queries

**Not Yet Wired:**
- API routes (no `app/api/` directory)
- Middleware (no `middleware.ts` at root)
- Error boundaries (no `error.tsx` files)
- Loading states (no `loading.tsx` files)
- Not found handler (no `not-found.tsx`)
- Database integration
- Environment variables (no .env files present)
- State management (no context, Redux, Zustand, etc.)
- Component library structure (all components inline)
- Testing (no test files)

---

*Architecture analysis: 2026-04-25*
