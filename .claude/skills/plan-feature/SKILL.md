---
name: plan-feature
description: Plan a new feature following the engineering checklist
user_invocable: true
---

# /plan-feature

When planning a new feature, follow this engineering checklist strictly.

## Input

$ARGUMENTS

## Planning Checklist

### 1. Requirements Analysis

- Restate the feature in one sentence
- List acceptance criteria (what "done" looks like)
- Identify edge cases and error states

### 2. Route & File Inventory

For each new route, list ALL files that will be created:

- `+page.server.ts` — data loading and form actions
- `<featureName>.svelte.ts` — state class with all logic (Layer 1)
- Sub-components: one `.svelte` file per visual concern (Layer 2)
- `+page.svelte` — pure orchestration, zero logic (Layer 3)
- Zod schemas if forms are involved
- Types/interfaces in a `types.ts` if shared across files

### 3. SOLID Decomposition

- **S**: Identify each responsibility → map to a file
- **O**: Identify extension points → use Snippets
- **L**: Any wrapper components? → must spread HTML attributes
- **I**: List props per component → no over-passing
- **D**: Shared dependencies → use getContext/setContext

### 4. Data Flow

- Where does data come from? (load function, form action, API)
- What state lives in the `.svelte.ts` class?
- What is `$derived` vs `$state`?
- What needs `$effect`? (should be rare)

### 5. Reuse Check

- Search for existing components in `src/lib/components/ui/` before creating new ones
- Search for existing utilities in `src/lib/` before writing helpers
- Check if similar patterns exist in other routes

### 6. TypeScript Contract

- Define interfaces/types FIRST before implementation
- Use `satisfies` for config objects
- No `any` — use `unknown` + type guards
- Use enums for finite named sets

### 7. Verification Plan

- `pnpm svelte-kit sync` (generate types for new routes)
- `pnpm check` (zero errors/warnings)
- `pnpm lint` (formatting + linting)
- Manual testing steps for the feature
- E2E test coverage if applicable
