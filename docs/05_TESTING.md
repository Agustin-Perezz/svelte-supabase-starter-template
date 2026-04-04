# Testing Guide

This project uses Playwright for end-to-end testing with V8 code coverage collection and Monocart Reporter for reporting.

## Test Structure

```
e2e/
├── _shared/
│   ├── app-fixtures.ts              # Custom test fixtures with coverage
│   └── fixtures/
│       └── v8-code-coverage.ts      # V8 coverage collection utilities
└── demo.test.ts                     # Example test
```

## Configuration

### Playwright Config

```ts
// playwright.config.ts
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

```ts
// e2e/_shared/app-fixtures.ts
export const test = base.extend<{}, { workerIndex: number }>({
  workerIndex: [
    async ({}, use, workerInfo) => {
      await use(workerInfo.workerIndex);
    },
    { scope: 'worker', auto: true }
  ]
});

test.beforeEach(async ({ page }) => {
  await collectV8Coverage({ page });
});

test.afterEach(async ({ page }, testInfo) => {
  await stopV8CoverageAndReport({ page }, testInfo);
});
```

All tests import `test` and `expect` from `app-fixtures.ts` instead of Playwright directly.

## Writing Tests

### Example Test

```ts
// e2e/demo.test.ts
import { expect, test } from './_shared/app-fixtures';

test('home page has heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

### Best Practices

1. **Import from fixtures** — Always import `test` and `expect` from `./_shared/app-fixtures`
2. **Use data-testid** — Prefer `data-testid` attributes for stable selectors
3. **Test user flows** — Focus on complete user journeys, not implementation details
4. **Use assertions** — Leverage Playwright's auto-retrying assertions (`toBeVisible`, `toHaveText`)

## Running Tests

| Command                     | Description                  |
| --------------------------- | ---------------------------- |
| `pnpm test`                 | Run E2E tests                |
| `pnpm test:e2e`             | Run E2E tests (alias)        |
| `pnpm test:show-report`     | Open Monocart HTML report    |
| `pnpm coverage:show-report` | Open V8 coverage HTML report |

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

The full E2E test suite runs before every push. This ensures no untested code reaches the remote.

## CI Pipeline

The GitHub Actions workflow runs tests in CI:

```yaml
- name: Install Playwright browsers
  run: pnpm exec playwright install --with-deps chromium

- name: Run Playwright tests
  run: pnpm test

- name: Upload test report
  uses: actions/upload-artifact@v4
  with:
    name: test-report
    path: coverage/e2e/
    retention-days: 7
```

**CI behavior:**

- Installs Chromium with system dependencies
- Runs tests with 2 retries for flaky tests
- Uploads coverage as `test-report` artifact (7-day retention)
- Uploads Playwright traces on failure as `playwright-traces` artifact
