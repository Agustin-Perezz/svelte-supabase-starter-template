# Testing Guide

This project uses Playwright for end-to-end testing with V8 code coverage collection, Monocart Reporter for reporting, and [Supawright](https://github.com/isaacharrisholt/supawright) for Supabase test data management.

## Test Structure

```
e2e/
├── _shared/
│   ├── app-fixtures.ts              # Custom test fixtures (coverage + supawright)
│   └── fixtures/
│       ├── supawright.ts            # Supawright fixture for Supabase test data
│       └── v8-code-coverage.ts      # V8 coverage collection utilities
├── books.test.ts                    # Books e2e tests (supawright example)
└── demo.test.ts                     # Basic smoke test
```

## Prerequisites

### Local Supabase

Tests require a running local Supabase instance. Install and start it:

```bash
# Start local Supabase (migrations run automatically)
npx supabase start
```

### Environment Variables

The `.env.test` file contains the local Supabase credentials and is committed to the repo (these are well-known default keys for local development — not secrets):

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

This file is loaded automatically by Playwright via `dotenv`.

## Configuration

### Playwright Config

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], monocartReporter],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI
  }
});
```

**Key settings:**

- Tests run only on Desktop Chrome
- CI retries flaky tests twice with single worker
- Auto-starts preview server on port 4173
- Traces captured only on retried tests
- `.env.test` is loaded for Supabase credentials

### Monocart Reporter

Generates multiple coverage output formats:

```ts
// playwright.monocart-reporter.ts
export const monocartReporter = new MonocartReporter({
  outputDir: './coverage/e2e',
  reports: [
    ['v8', { outputDir: './coverage/e2e/v8' }],
    ['lcov', { outputFile: './coverage/e2e/lcov/code-coverage.lcov.info' }],
    [
      'cobertura',
      { outputFile: './coverage/e2e/cobertura/code-coverage.cobertura.xml' }
    ],
    ['console-summary']
  ],
  sourceFilter: (sourcePath) =>
    sourcePath.includes('/src/') &&
    !sourcePath.includes('node_modules') &&
    !sourcePath.includes('@vite') &&
    !sourcePath.includes('@sveltejs') &&
    !sourcePath.includes('svelte/internal')
});
```

## Supawright (Test Data Management)

[Supawright](https://github.com/isaacharrisholt/supawright) manages database records during tests — creating test data with auto-generated values and cleaning up after each test.

### Fixture Setup

```ts
// e2e/_shared/fixtures/supawright.ts
import { withSupawright } from 'supawright';

import type { Database } from '../../../src/lib/domain/types/database.types';

export const supaTest = withSupawright<Database, 'public'>(['public'], {
  supabase: {
    supabaseUrl: process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  },
  database: {
    host: '127.0.0.1',
    port: 54322,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
  }
});
```

The fixture is merged with the V8 coverage fixture in `app-fixtures.ts` using Playwright's `mergeTests`.

### Creating Test Data

```ts
import { expect, test } from './_shared/app-fixtures';

test('creates a book', async ({ supawright }) => {
  // Create with explicit data
  const book = await supawright.create('books', {
    title: 'My Book',
    author: 'Author Name'
  });
  expect(book.id).toBeDefined();

  // Create with auto-generated data (non-nullable fields filled automatically)
  const autoBook = await supawright.create('books', { title: 'Only Title' });
  expect(autoBook.author).toBeDefined(); // auto-generated
});
```

### Querying via Supabase Client

```ts
test('query records', async ({ supawright }) => {
  const book = await supawright.create('books', { title: 'Test' });

  const { data } = await supawright
    .supabase('public')
    .from('books')
    .select()
    .eq('id', book.id)
    .single();

  expect(data!.title).toBe('Test');
});
```

### Automatic Cleanup

Supawright automatically deletes all records created during a test when it finishes — respecting foreign key constraints. It also discovers and removes related records created via the standard Supabase client.

### Generating Database Types

When the database schema changes, regenerate the TypeScript types:

```bash
# From local Supabase
pnpm supabase:gen-types:local

# From remote Supabase (requires SUPABASE_PROJECT_ID)
pnpm supabase:gen-types
```

## Coverage Collection

### V8 Coverage Fixture

```ts
// e2e/_shared/fixtures/v8-code-coverage.ts
export async function collectV8Coverage({ page }: { page: Page }) {
  await page.coverage.startJSCoverage({ resetOnNavigation: false });
  await page.coverage.startCSSCoverage({ resetOnNavigation: false });
}

export async function stopV8CoverageAndReport(
  { page }: { page: Page },
  testInfo: TestInfo
) {
  const [jsCoverage, cssCoverage] = await Promise.all([
    page.coverage.stopJSCoverage(),
    page.coverage.stopCSSCoverage()
  ]);

  const coverageList = [...jsCoverage, ...cssCoverage];
  await testInfo.attach('coverage', { body: JSON.stringify(coverageList) });
}
```

**Key:** `resetOnNavigation: false` accumulates coverage across page navigations.

### Custom Test Fixture

All tests import `test` and `expect` from `app-fixtures.ts` instead of Playwright directly. The fixture merges V8 coverage collection with the supawright harness:

```ts
// e2e/_shared/app-fixtures.ts
import { mergeTests } from '@playwright/test';

import { supaTest } from './fixtures/supawright';

const test = mergeTests(coverageTest, supaTest);
export { test, expect };
```

## Writing Tests

### Best Practices

1. **Import from fixtures** — Always import `test` and `expect` from `./_shared/app-fixtures`
2. **Use data-testid** — Prefer `data-testid` attributes for stable selectors
3. **Test user flows** — Focus on complete user journeys, not implementation details
4. **Use assertions** — Leverage Playwright's auto-retrying assertions (`toBeVisible`, `toHaveText`)
5. **Use supawright for data** — Create test data via `supawright.create()` instead of manual inserts; cleanup is automatic

## Running Tests

| Command                     | Description                                  |
| --------------------------- | -------------------------------------------- |
| `pnpm test`                 | Reset database and run E2E tests             |
| `pnpm test:ui`              | Reset database and run E2E tests in UI mode  |
| `pnpm test:ci`              | Run E2E tests only (no db reset, used in CI) |
| `pnpm test:show-report`     | Open Monocart HTML report                    |
| `pnpm coverage:show-report` | Open V8 coverage HTML report                 |

**Prerequisite:** Local Supabase must be running (`npx supabase start`).

The `test` and `test:ui` scripts run `npx supabase db reset` before tests to ensure a clean database state. The `test:ci` script skips the reset since CI starts a fresh Supabase instance.

## Coverage Reports

Reports are generated in `coverage/e2e/`:

| Format        | Path                                                   | Purpose                    |
| ------------- | ------------------------------------------------------ | -------------------------- |
| Monocart HTML | `./coverage/e2e/monocart-report.html`                  | Interactive test results   |
| V8 HTML       | `./coverage/e2e/v8/index.html`                         | Line-by-line code coverage |
| LCOV          | `./coverage/e2e/lcov/code-coverage.lcov.info`          | CI integration             |
| Cobertura XML | `./coverage/e2e/cobertura/code-coverage.cobertura.xml` | CI integration             |

## Git Hooks

### Pre-Push Hook

```bash
# .husky/pre-push
pnpm test
```

The full E2E test suite runs before every push (including a database reset). This ensures no untested code reaches the remote.

## CI Pipeline

The GitHub Actions workflow starts a local Supabase instance and runs tests against it:

```yaml
- name: Setup Supabase CLI
  uses: supabase/setup-cli@v1
  with:
    version: latest

- name: Start Supabase
  run: supabase start -x imgproxy,edge-runtime,logflare,vector,pgbouncer

- name: Generate .env.test for Playwright
  run: |
    echo "SUPABASE_URL=$(supabase status -o env | grep API_URL | cut -d= -f2-)" >> .env.test
    echo "SUPABASE_SERVICE_ROLE_KEY=$(supabase status -o env | grep SERVICE_ROLE_KEY | cut -d= -f2-)" >> .env.test
    echo "PUBLIC_SUPABASE_URL=$(supabase status -o env | grep API_URL | cut -d= -f2-)" >> .env.test
    echo "PUBLIC_SUPABASE_ANON_KEY=$(supabase status -o env | grep ANON_KEY | cut -d= -f2-)" >> .env.test

- name: Run E2E tests
  run: pnpm test:ci
```

**CI behavior:**

- Installs Supabase CLI and starts local instance (excluding unused services for speed)
- Migrations from `supabase/migrations/` are applied automatically on start
- Generates `.env.test` from `supabase status` output (overrides committed defaults if needed)
- Installs Chromium with system dependencies
- Runs `pnpm test:ci` (no database reset — fresh instance is already clean)
- Runs tests with 2 retries for flaky tests
- Uploads coverage as `test-report` artifact (7-day retention)
- Uploads Playwright traces on failure as `playwright-traces` artifact
