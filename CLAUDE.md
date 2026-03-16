# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

---

## Project Overview

**sveltekit-production-starter** is a production-ready SvelteKit starter template built around **shift-left quality practices** — catching bugs at the earliest possible stage rather than in production.

### What It Provides

A fully wired foundation for building SvelteKit applications with:

- **Svelte 5 (Runes API)** — reactive state with `$state`, `$derived`, `$effect`, and `$props`
- **TypeScript** — strict mode, no `any`, leveraging `satisfies` and utility types
- **Tailwind CSS v4** — utility-first styling with `tailwind-merge` and `tailwind-variants`
- **shadcn-svelte (Bits UI)** — accessible, composable UI primitives (`Button`, `Input`, `Label`, `FormField`)
- **sveltekit-superforms + Zod** — type-safe form handling with server-side validation
- **Axios** — configured HTTP client for API communication
- **Sentry** — error tracking and performance monitoring (production-only, wired into both client and server hooks)

### Quality Pipeline

Every code change passes through layered quality gates:

1. **Pre-commit** — `lint-staged` runs Prettier + ESLint on staged files via Husky
2. **Pre-push** — Full Playwright E2E test suite with V8 code coverage
3. **CI (GitHub Actions)** — Lint, type-check, E2E tests, and production build on every push/PR to `main`
4. **Runtime** — Sentry monitors errors and performance in production

### Existing Routes

- `/` — Home page
- `/protected` — Server-guarded page with `+page.server.ts` auth logic
- `/books` — Books CRUD with Supabase
- `/images` — Image route (scaffold)

### Key Libraries

| Category      | Library                                                                   |
| ------------- | ------------------------------------------------------------------------- |
| UI Components | `bits-ui`, shadcn-svelte patterns                                         |
| Forms         | `sveltekit-superforms`, `zod`                                             |
| HTTP          | `axios`                                                                   |
| Styling       | `tailwindcss` v4, `tailwind-merge`, `tailwind-variants`, `tw-animate-css` |
| Monitoring    | `@sentry/sveltekit`                                                       |
| Testing       | `@playwright/test`, `monocart-reporter` (V8 coverage)                     |
| Code Quality  | `eslint`, `prettier`, `husky`, `lint-staged`                              |

---

## Architecture

### Key Directories

- `src/routes/` — File-based routing; `+page.svelte` for pages, `+layout.svelte` for layouts
- `src/lib/components/ui/` — Reusable UI components following shadcn-svelte patterns
- `src/lib/server/` — Server-only code (auth, etc.)
- `src/hooks.client.ts` / `src/hooks.server.ts` — SvelteKit lifecycle hooks with Sentry integration
- `e2e/` — Playwright E2E tests with V8 code coverage

### Forms

Uses **sveltekit-superforms** with **Zod** schemas for validation. Form components in `$components/ui/form-field/` handle error display automatically.

---

## Coding Standards

Svelte 5, SOLID principles, and TypeScript standards are enforced via scoped rules in `.claude/rules/`:

- `svelte-standards.md` — Runes API, SvelteKit patterns, SOLID principles (activates on `*.svelte`, `*.svelte.ts`)
- `typescript-standards.md` — `satisfies`, type guards, strict rules (activates on `*.ts`, `*.svelte.ts`)
- `clean-architecture.md` — Domain/use-case layer boundaries (activates on `src/domain/**`, `src/use-cases/**`)
