# Testing Guide

E2E tests use Playwright with V8 coverage, Monocart Reporter, and [Supawright](https://github.com/isaacharrisholt/supawright) for test data management.

## Test Structure

```
e2e/
├── _shared/
│   ├── app-fixtures.ts              # Merged test fixtures (coverage + supawright)
│   └── fixtures/
│       ├── supawright.ts            # Supawright fixture
│       └── v8-code-coverage.ts      # V8 coverage utilities
├── books.test.ts
└── demo.test.ts
```

## Prerequisites

Local Supabase must be running:

```bash
npx supabase start
```

The `.env.test` file contains local credentials and is committed (well-known dev defaults — not secrets).

## Configuration

Key Playwright settings:

- Tests run on Desktop Chrome only
- CI: 2 retries, single worker
- Auto-starts preview server on port 4173
- `resetOnNavigation: false` for cumulative coverage

## Supawright (Test Data)

Creates test records and cleans them up automatically after each test, respecting FK constraints.

```ts
import { expect, test } from './_shared/app-fixtures';

test('shows created book', async ({ page, supawright }) => {
  await supawright.create('books', { title: 'My Book', author: 'Author' });
  await page.goto('/books');
  await expect(page.getByText('My Book')).toBeVisible();
});
```

### Fixture Setup

```ts
// e2e/_shared/fixtures/supawright.ts
import { withSupawright } from 'supawright';

import type { Database } from '../../src/lib/modules/shared/domain/database.types';

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

All tests import `test` and `expect` from `app-fixtures.ts` (not directly from Playwright).

## Writing Tests

1. Import from `'./_shared/app-fixtures'`
2. Use `data-testid` attributes for stable selectors
3. Use `supawright.create()` for test data (auto-cleanup)
4. Use Playwright's auto-retrying assertions (`toBeVisible`, `toHaveText`)

## Running Tests

| Command                     | Description                        |
| --------------------------- | ---------------------------------- |
| `pnpm test`                 | Reset DB + run E2E tests           |
| `pnpm test:ui`              | Reset DB + run in UI mode          |
| `pnpm test:ci`              | Run only (no DB reset, used in CI) |
| `pnpm test:show-report`     | Open Monocart HTML report          |
| `pnpm coverage:show-report` | Open V8 coverage report            |

## Coverage Reports

| Format        | Path                                                   |
| ------------- | ------------------------------------------------------ |
| Monocart HTML | `./coverage/e2e/monocart-report.html`                  |
| V8 HTML       | `./coverage/e2e/v8/index.html`                         |
| LCOV          | `./coverage/e2e/lcov/code-coverage.lcov.info`          |
| Cobertura XML | `./coverage/e2e/cobertura/code-coverage.cobertura.xml` |

## CI Pipeline

The GitHub Actions workflow starts a fresh local Supabase instance, generates `.env.test` from `supabase status`, and runs `pnpm test:ci`. Coverage is uploaded as a `test-report` artifact (7-day retention). Playwright traces are uploaded on failure.
