## Project

SvelteKit + Supabase starter with clean architecture, TypeScript strict mode, and shift-left quality.

## Commands

```bash
pnpm dev          # Start dev server
pnpm check        # TypeScript type checking
pnpm lint         # Prettier + ESLint
```

## Key Constraints

Never use magic strings—always use named constants or enums for values that could change or have semantic meaning.

Never declare inline types in function parameters—use interfaces or type aliases instead.

Database queries **must** go through repository functions in the Infrastructure layer. Never call `supabase.from()` directly in use cases or components.

Required env vars must fail loudly—if missing, the app crashes, no defaults.

## Guidelines

If you need to write backend or infrastructure code, see [Architecture](./docs/01_ARCHITECTURE.md) and [Supabase Guide](./docs/04_SUPABASE-GUIDE.md).

If you need to write frontend code, see [Frontend Folder Structure](./docs/03_FRONTEND-FOLDER-STRUCTURE.md) and [Component Patterns](./docs/02_COMPONENT-PATTERNS.md).

If you need to write TypeScript, see [TypeScript Standards](./docs/07_TYPESCRIPT-STANDARDS.md).

If you need to write tests, see [Testing Guide](./docs/05_TESTING.md).
