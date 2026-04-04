## Architecture

### Key Directories

- `src/routes/` — File-based routing; `+page.svelte` for pages, `+layout.svelte` for layouts
- `src/lib/modules/` — Module-based clean architecture (domain, useCases, infrastructure per feature)
- `src/lib/modules/shared/` — Cross-cutting concerns (database types, auth)
- `src/lib/components/ui/` — Reusable UI components following shadcn-svelte patterns
- `src/hooks.client.ts` / `src/hooks.server.ts` — SvelteKit lifecycle hooks with Sentry integration
- `e2e/` — Playwright E2E tests with V8 code coverage

### Forms

Uses **sveltekit-superforms** with **Zod** schemas for validation. Form components in `$components/ui/form-field/` handle error display automatically.

**Always use shadcn-svelte UI components** (from `$components/ui/`) instead of native HTML form elements. For example, use `<Input>` over `<input>`, `<Button>` over `<button>`, `<Select>` over `<select>`, etc. Never use raw HTML form elements when a shadcn equivalent exists.

---

## Coding Standards

Svelte 5, SOLID principles, and TypeScript standards are enforced via scoped rules in `.claude/rules/`:

- `svelte-standards.md` — Runes API, SvelteKit patterns, SOLID principles (activates on `*.svelte`, `*.svelte.ts`)
- `typescript-standards.md` — `satisfies`, type guards, strict rules (activates on `*.ts`, `*.svelte.ts`)
- `server-supabase.md` — Supabase clean architecture: module-based structure, use cases, repository interfaces (activates on `src/lib/modules/**`, `src/routes/**/+page.server.ts`, `src/hooks.server.ts`)
