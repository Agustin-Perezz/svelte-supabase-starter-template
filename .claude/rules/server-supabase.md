---
globs:
  - 'src/lib/server/**/*.ts'
  - 'src/routes/**/+page.server.ts'
  - 'src/routes/**/+layout.server.ts'
  - 'src/hooks.server.ts'
---

# Server & Supabase — Clean Architecture

## Layered Architecture

All server-side code follows a strict three-layer dependency flow:

```
+page.server.ts → Service → Repository → Supabase
```

- **Repository** (`$server/repositories/`): The ONLY layer that touches `SupabaseClient`. One repository per database table/resource.
- **Service** (`$server/services/`): Business logic and validation. Depends on repositories via constructor injection — never imports `SupabaseClient` directly.
- **`+page.server.ts`**: Orchestrates services/repositories from `event.locals`. Contains no business logic or direct Supabase queries.

## Repository Rules

- Accept `SupabaseClient<Database>` via constructor — never import a global client.
- Type the client with the generated `Database` type from `$domain/types/database.types`.
- Always call `.select()` after `.insert()` / `.update()` to return the mutated row.
- Always check `{ data, error }` — throw on error, return typed data on success.
- Domain model types (`Book`, `BookInsert`, `BookUpdate`) come from `$domain/models/` — never define row types inline.

## Service Rules

- Accept the repository via constructor injection.
- Contain all business-level validation (e.g., required fields, invariants).
- Never import `@supabase/supabase-js` or `@supabase/ssr`.
- Return domain types, not Supabase response wrappers.

## `+page.server.ts` Rules

- Access repositories and services through `event.locals` (wired in `hooks.server.ts`).
- Use `superValidate` + Zod schemas (from `$schemas/`) for form validation.
- Return `fail()` for validation errors, `message()` for operational errors.
- Never instantiate `SupabaseClient`, repositories, or services — they are pre-built in hooks.

## Hooks Wiring (`hooks.server.ts`)

- Create the Supabase server client via `createServerClient` from `@supabase/ssr` using `event.cookies`.
- Instantiate repositories with the per-request Supabase client, then services with those repositories.
- Attach all instances to `event.locals` so load functions and actions can use them.
- Filter serialized response headers to include `content-range` and `x-supabase-api-version`.

## Supabase Client — CRITICAL

- NEVER create a global/singleton Supabase client. Each request gets its own client via hooks (cookie-scoped auth).
- NEVER import `createClient` from `@supabase/supabase-js` in server code — use `createServerClient` from `@supabase/ssr`.
- Supabase URL and anon key come from `$env/dynamic/public` — never hardcode.

## Adding a New Resource

When adding a new server-side resource (e.g., `authors`):

1. Add generated types to `$domain/types/database.types` (via `supabase gen types`).
2. Create model type aliases in `$domain/models/author.ts`.
3. Create `$server/repositories/authors.repository.ts` — inject `SupabaseClient<Database>`.
4. Create `$server/services/authors.service.ts` — inject the repository.
5. Create Zod schema in `$schemas/author.schema.ts`.
6. Wire repository → service → `event.locals` in `hooks.server.ts`.
7. Update `app.d.ts` to add the new locals types.
