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
