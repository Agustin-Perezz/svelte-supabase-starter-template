# Svelte Supabase Starter Template

A production-ready SvelteKit starter template with Supabase, following Clean Architecture and shift-left quality practices. Catch bugs early, ship with confidence.

## Documentation

Full documentation is available in the [`docs/`](./docs/) folder:

| Document | Description |
|----------|-------------|
| [Architecture Overview](./docs/01_ARCHITECTURE.md) | Layered architecture and design patterns |
| [Svelte Standards](./docs/02_SVELTE-STANDARDS.md) | Svelte 5 patterns, SOLID principles, form handling |
| [Routing & Pages](./docs/03_ROUTING-PAGES.md) | File-based routing and page structure |
| [Supabase Guide](./docs/04_SUPABASE-GUIDE.md) | Database integration and clean architecture layers |
| [Testing Guide](./docs/05_TESTING.md) | E2E testing with Playwright and V8 coverage |
| [UI Components](./docs/06_UI-COMPONENTS.md) | Component architecture and styling system |
| [TypeScript Standards](./docs/07_TYPESCRIPT-STANDARDS.md) | TypeScript conventions and coding rules |

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm check` | Run type checks |
| `pnpm lint` | Lint and check formatting |
| `pnpm format` | Format code with Prettier |
| `pnpm test` | Run E2E tests |
| `pnpm test:show-report` | Open Monocart test report |
| `pnpm coverage:show-report` | Open V8 coverage report |
| `pnpm supabase:gen-types` | Generate types from remote Supabase |
| `pnpm supabase:gen-types:local` | Generate types from local Supabase |

## Environment Variables

Copy `.env.dist` to `.env` and fill in the values:

```
# Supabase
PUBLIC_SUPABASE_URL=your-supabase-project-url
PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# API
VITE_API_BASE_URL=your-base-api

# Sentry
VITE_SENTRY_DSN=your-sentry-dsn
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```
