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

## RTK (Rust Token Killer)

Prefer using `rtk` as a proxy for CLI commands to save tokens (60-90% savings). It hooks transparently—e.g. `rtk git status`, `rtk pnpm check`, etc. See `RTK.md` for full reference.

- Always try `rtk <cmd>` first when running shell commands (git, pnpm, npm, cargo, etc.)
- If `rtk` is unavailable or a command fails, fall back to the raw command
- Use `rtk gain` to check token savings, `rtk discover` to find missed opportunities
