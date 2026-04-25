# Testing Patterns

**Analysis Date:** 2026-04-25

## Test Framework Status

**Not Configured**

This is a Next.js 16.2.4 scaffold with no testing framework currently installed or configured. No test runner (Jest, Vitest, Playwright, Cypress), assertion library, or test files exist in the source tree.

## Recommended Setup for Current Next.js Version

Given Next.js 16.2.4 with React 19.2.4, the following testing stack is idiomatic:

### Unit & Component Testing
- **Runner:** Vitest (preferred for modern Next.js projects with faster feedback)
- **Alternative:** Jest (traditional, more widely documented)
- **Assertion Library:** Vitest includes Chai-compatible assertions or use `@testing-library/jest-matchers`

### React Component Testing
- **Library:** @testing-library/react (v15+)
- **DOM utilities:** @testing-library/dom

### E2E Testing
- **Framework:** Playwright or Cypress (both support Next.js well)
- **Playwright:** Recommended for modern projects, supports components and E2E

## Current Package.json Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

**No test scripts defined.** Once testing is set up, add:
- `"test"` — Run all tests
- `"test:watch"` — Watch mode for development
- `"test:coverage"` — Generate coverage reports
- `"e2e"` — Run E2E tests (if using Playwright/Cypress)

## Test File Organization

**Recommended Location:**
- Co-located with source files (preferred for maintainability)
- Pattern: `[filename].test.ts` or `[filename].test.tsx` adjacent to `[filename].ts(x)`
- Alternative: Separate `__tests__` directory at project root or per-module

**Example Structure:**
```
app/
├── page.tsx
├── page.test.tsx
├── layout.tsx
└── layout.test.tsx

lib/
├── utils.ts
├── utils.test.ts
```

## Test Structure

**Not yet established.** Once testing framework is chosen:

### For Vitest + React Testing Library
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home Component', () => {
  it('should render the main heading', () => {
    render(<Home />);
    expect(screen.getByText(/get started/i)).toBeInTheDocument();
  });
});
```

### For Jest + React Testing Library
```typescript
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home Component', () => {
  it('should render the main heading', () => {
    render(<Home />);
    expect(screen.getByText(/get started/i)).toBeInTheDocument();
  });
});
```

## Mocking

**Not yet configured.**

**Recommended Approach:**
- Use testing library's built-in utilities for component mocking
- Mock Next.js modules: `next/image`, `next/font/google` as needed
- For API routes: Mock fetch or use MSW (Mock Service Worker)

**Example mocking Next.js Image:**
```typescript
jest.mock('next/image', () => ({
  __esModule: true,
  default: () => <img />,
}));
```

## Fixtures and Test Data

**Not yet in place.**

**Recommended Location:**
- `__tests__/fixtures/` for shared test data
- `__tests__/factories/` for data factory patterns
- Keep fixtures close to tests that use them

## Coverage

**Requirements:** Not enforced

**Recommendation:** Once testing is set up, consider:
- Target: 70-80% coverage for critical paths
- Use `--coverage` flag with Vitest or Jest
- Configure in `vitest.config.ts` or `jest.config.js`

**View Coverage:**
```bash
npm run test:coverage
# or
npm test -- --coverage
```

## Test Types

### Unit Tests
**Scope:** Individual functions, utilities, pure logic
**Approach:**
- Test one concern per test
- Mock external dependencies
- Use table-driven tests for multiple cases

### Component Tests
**Scope:** React component rendering, user interactions, props
**Approach:**
- Render component with Testing Library
- Query DOM using accessible queries (getByRole, getByText)
- Test user interactions (click, type)
- Avoid implementation details

### Integration Tests
**Scope:** Multiple components/systems working together
**Approach:**
- Render multiple components
- Test real user flows (form submission, navigation)
- May involve API mocking

### E2E Tests
**Framework:** Playwright (recommended for Next.js 16)
**Scope:** Full application workflows in real browser
**Example:**
```typescript
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/create next app/i);
});
```

## Common Patterns (To Be Established)

### Async Testing
```typescript
it('should fetch data', async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});
```

### Error Testing
```typescript
it('should handle errors', () => {
  expect(() => riskyFunction()).toThrow('Expected error');
});
```

## Next Steps for Testing Setup

1. **Choose runner:** Recommend Vitest for speed, or Jest for ecosystem maturity
2. **Install dependencies:**
   - `vitest` + `@testing-library/react` + `@testing-library/jest-dom`
   - Or `jest` + `@testing-library/react` + `jest-environment-jsdom`
3. **Create config file:**
   - `vitest.config.ts` or `jest.config.js`
4. **Add test script** to `package.json`
5. **Write first test** in co-located `.test.tsx` file
6. **Integrate with CI/CD** (GitHub Actions recommended)

---

*Testing analysis: 2026-04-25*
