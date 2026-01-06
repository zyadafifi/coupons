# Testing Guide

This document describes the testing setup for the coupons application.

## Overview

The project uses a comprehensive testing stack:

- **Unit/Component Tests**: Vitest + React Testing Library
- **Integration Tests**: Vitest + MSW (Mock Service Worker)
- **E2E Tests**: Playwright
- **Coverage**: @vitest/coverage-v8

## Testing Stack

### Dependencies

- `vitest` - Fast unit test runner with Vite integration
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers for DOM
- `@testing-library/user-event` - User interaction simulation
- `jsdom` - DOM implementation for Node.js
- `msw` - API mocking with Mock Service Worker
- `@vitest/coverage-v8` - Code coverage using V8
- `@playwright/test` - End-to-end testing framework

## Running Tests

### Unit/Component Tests

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI (helpful for debugging)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests (headless)
npm run e2e

# Run E2E tests with UI
npm run e2e:ui
```

### Full CI Pipeline

```bash
# Run full CI pipeline locally (lint + test + build + e2e)
npm run ci
```

## Test Structure

### Unit/Component Tests

Tests are located alongside components with `.test.tsx` or `.spec.tsx` extensions:

```
src/
  components/
    admin/
      AdminProtectedRoute.test.tsx
    coupon/
      CouponCodeBox.test.tsx
  test/
    setup.ts              # Test setup and polyfills
    render.tsx            # Custom render with providers
    mocks/
      server.ts           # MSW server setup
      handlers.ts         # API request handlers
      firebase.ts         # Firebase mocks
      supabase.ts         # Supabase mocks
```

### E2E Tests

E2E tests are located in the `e2e/` directory:

```
e2e/
  smoke.test.ts          # Basic app loading tests
  navigation.test.ts     # Navigation/routing tests
  admin-auth.test.ts     # Admin authentication flows
```

## Writing Tests

### Component Tests

Use the custom `renderWithProviders` utility for consistent test setup:

```typescript
import { render, screen } from '@/test/render';
import { MyComponent } from './MyComponent';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Mocking Firebase/Supabase

Firebase and Supabase are automatically mocked in tests. No real API calls are made:

- Firebase modules are mocked via `src/test/mocks/firebase.ts`
- Supabase client is mocked via `src/test/mocks/supabase.ts`

### Mocking API Calls with MSW

Use MSW to mock REST API endpoints:

```typescript
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

test('loads data from API', async () => {
  server.use(
    http.get('/api/data', () => {
      return HttpResponse.json({ id: '1', name: 'Test' });
    })
  );

  render(<MyComponent />);
  await waitFor(() => {
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### E2E Tests

E2E tests run against a built preview server (production-like):

```typescript
import { test, expect } from '@playwright/test';

test('app loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#root')).toBeVisible();
});
```

## Coverage

Coverage thresholds are configured in `vite.config.ts`:

- **Statements**: 60%
- **Branches**: 50%
- **Lines**: 60%
- **Functions**: 55%

These thresholds are enforced in CI and can be increased over time.

Coverage reports are generated in `coverage/` directory when running `npm run test:coverage`.

## CI/CD

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs:

1. Linting (`npm run lint`)
2. Unit/component tests with coverage (`npm run test:coverage`)
3. Build (`npm run build`)
4. E2E tests (`npm run e2e`)

Coverage reports and Playwright reports are uploaded as artifacts on failure.

## Test Utilities

### `src/test/render.tsx`

Provides `renderWithProviders()` wrapper that includes:
- QueryClientProvider (React Query)
- MemoryRouter (React Router)
- AppProvider (App context)
- AdminAuthProvider (Admin auth context)

### `src/test/setup.ts`

Sets up:
- MSW server
- Browser polyfills (matchMedia, ResizeObserver, IntersectionObserver, clipboard)
- Test cleanup

## Mocking Guidelines

1. **Never call real Firebase/Supabase in tests** - Always use mocks
2. **Use MSW for REST API calls** - Provides realistic network mocking
3. **Mock at the hook/context level when possible** - Easier than mocking deep Firebase calls
4. **Keep mocks simple** - Only mock what's necessary for the test

## Best Practices

1. **Test behavior, not implementation** - Focus on what users see/do
2. **Use `screen` queries** - Prefer `screen.getByRole()` over DOM queries
3. **Wait for async operations** - Use `waitFor()` for async updates
4. **Isolate tests** - Each test should be independent
5. **Test critical paths** - Focus on user-facing features first
6. **Keep tests maintainable** - Update tests when changing behavior, not implementation

## Troubleshooting

### Tests failing due to Firebase

Ensure Firebase mocks are imported before components that use Firebase:

```typescript
import '@/test/mocks/firebase';
```

### MSW handlers not working

Check that handlers are registered before rendering:

```typescript
import { server } from '@/test/mocks/server';

beforeEach(() => {
  server.use(/* your handler */);
});
```

### E2E tests timing out

- Increase timeout in `playwright.config.ts`
- Check that preview server starts correctly
- Verify baseURL is correct

## Coverage Exclusions

The following files are excluded from coverage:

- `src/vite-env.d.ts`
- `src/main.tsx`
- `src/App.tsx`
- Test files (`*.test.tsx`, `*.spec.tsx`)
- Test utilities (`src/test/**`)

This can be adjusted in `vite.config.ts` if needed.

