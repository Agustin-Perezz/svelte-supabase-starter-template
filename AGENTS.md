# Agent Instructions

You are an expert software engineer. Your goal is to write robust, maintainable, and type-safe code using Clean Architecture and SvelteKit + Supabase best practices using TypeScript.

## Core Directives

- **NO COMMENTS:** I prefer code that has few comments. I code by the principle that good code does not require many comments. Every comment represents a failure to make the code self explanatory. Consider comments as a last resort.
- **Clean Code:** Write code that is easy to read, test, and maintain. Follow SOLID principles. Use descriptive variable names and keep functions small and focused on a single responsibility.
- **Clean Architecture:** Maintain strict separation of concerns. Keep Domain and Application logic completely decoupled from external frameworks, databases, and delivery mechanisms (Infrastructure/Presentation layers).
- **SvelteKit + Supabase Best Practices:** Leverage SvelteKit's server functions (`+page.server.ts`, `+server.ts`), load functions, hooks, and form actions. Use Supabase client appropriately with typed queries. Use `sveltekit-superforms` with Zod for form handling.
- **Always Verify:** Before completing a task, review your changes. Check for type safety, unhandled promise rejections, missing dependencies, and potential edge cases.
- **No Magic Strings:** All string literals that represent meaningful values (statuses, sources, types, categories, etc.) MUST be declared as constants/enums in `src/lib/modules/shared/constants/` and exported from there. DO NOT use hardcoded strings like `'in_review'`, `'published'`, `'en_revision'`, `'manual'`, `'portal'`, `'whatsapp'`, etc. anywhere in the codebase. Import from the shared constants module instead. This applies to ALL layers: domain, application, infrastructure, presentation, and frontend.

## Strict Constraints (Do NOT Do These)

- **No Dynamic Imports:** Avoid using dynamic imports (`await import(...)`) wherever possible. Always use static, top-level `import` statements to ensure predictable bundling and module resolution.
- **No Framework Bleed:** Do not leak SvelteKit-specific APIs (like `load`, `actions`, `fetch` from SvelteKit) into the core Domain entities or pure business logic.
- **No Repositories in Domain layer:** Do not use repositories or database access logic in the Domain layer. Repositories belong in the Infrastructure layer and their interfaces in the application layer.
- **No barrel export files (index.ts files exporting other files exports):** Do not create index files that export other files' exports. Instead, import them directly, this confuses LLMs less and keeps code synchronised.
- **No Direct Supabase Queries Outside Repositories:** NEVER call `supabase.from()` or any Supabase query directly in use cases, domain logic, or UI components. All database access must go through repository functions in the Infrastructure layer.
- **No Env Var Fallbacks with Defaults:** NEVER use `process.env.X || 'http://localhost...'` or `process.env.X ?? 'http://localhost...'` patterns. These hide misconfiguration in production—if the env var is missing, the app should crash loudly, not silently fall back to localhost. Use `$env/static/private` (SvelteKit) properly without defaults. If a default is truly needed for local dev, use a `.env.example` and require the variable to be set.
- **No Default Config Fallbacks:** NEVER use fallback patterns like `env.VAR ?? 'default'` for configuration values (URLs, API keys, secrets, etc.). These hide misconfiguration in production. If a config value is required, let the application fail loudly with a clear error message. Example:

  ```typescript
  // ❌ WRONG - hides misconfiguration
  const baseUrl = env.SUPABASE_URL ?? 'https://localhost:54321';

  // ✅ CORRECT - fails fast with clear error
  const baseUrl = env.SUPABASE_URL;
  ```

## Documentation & Deep Context

Your comprehensive architectural guidelines and domain knowledge are located in the `docs/` directory.

- **When to read them:** If you are implementing a new feature, making structural changes, or are unsure about the specific implementation details of a domain, you MUST read the relevant files in `docs/*.md` before writing code.
- **When to skip them:** For minor bug fixes, typos, or localized refactoring within a single file, rely on your general knowledge to save context window.
