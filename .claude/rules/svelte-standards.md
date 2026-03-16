---
globs:
  - 'src/**/*.svelte'
  - 'src/**/*.svelte.ts'
---

# Svelte 5 & SvelteKit Standards

## Runes API

- Use `$state()` for reactive data and `$derived()` for computed values. Abandon Svelte 4's `let` and `$:`.
- Use `$effect` only for side effects (DOM manipulation, third-party libs). Never use it to sync state.
- Use `let { prop } = $props()`. Use `$bindable()` only when two-way binding is strictly necessary.
- Extract logic into `.svelte.ts` files using runes to keep components lean and testable.

## SvelteKit Patterns

- **Server-First:** Use `+page.server.ts` for data fetching and Form Actions for mutations.
- **Progressive Enhancement:** Always use `use:enhance` on forms.
- **Event Handling:** Use Svelte 5 attribute pattern (`onclick={...}`) instead of `on:click`.
- **Error Handling:** Use SvelteKit's `error()` and `redirect()` helpers within load functions.

## Reactivity with `$props()` — CRITICAL

NEVER destructure `$props()` or pass values directly into constructors at the top level. Always wrap in `$derived`.

```ts
// BAD — loses reactivity
const { books } = data;
const detail = new MyClass(data.foo);

// GOOD
const books = $derived(data.books);
const detail = $derived(new MyClass(data.foo));
```

---

# SOLID Principles (Adapted for Svelte)

## S — Single Responsibility

Every new SvelteKit page MUST be decomposed into three layers:

**Layer 1 — `.svelte.ts` class (all logic)**

- State, constants, helper functions, derived values
- Nothing from this list belongs in `+page.svelte`

**Layer 2 — Small, focused sub-components (one concern each)**

- Sub-components MUST live in a `components/` folder inside the route directory (e.g., `src/routes/dashboard/components/UserAvatar.svelte`).
- Each distinct visual section (header, form, list, card, empty state, etc.) MUST be its own `.svelte` file — no exceptions.
- A sub-component MUST NOT exceed **~50 lines of template markup**. If it does, split it. Aim for 10–20 lines per component.
- NEVER combine unrelated UI sections into a single sub-component (e.g., a `UserInfo.svelte` that also renders a stats table).
- Sub-components receive only the specific primitive props or slices they need — never the full page data object.
- Name sub-components after the UI concern they own (e.g., `BookList.svelte`, `BookCreateForm.svelte`), not generic names like `Section.svelte`.
- If a sub-component contains conditional rendering for multiple states (loading, error, empty, populated), extract each state into its own sub-component.

**Layer 3 — `+page.svelte` (pure orchestration)**

- Instantiates the `.svelte.ts` class via `$derived(new MyClass(data.x))`
- Imports and composes sub-components
- Contains zero inline logic, constants, or helper functions

```ts
// userDashboard.svelte.ts — owns ALL state & logic
export class UserDashboardState {
  user = $state<User | null>(null);
  activities = $derived(this.user?.activities ?? []);

  get formattedJoinDate() {
    return new Intl.DateTimeFormat('en').format(this.user?.joinedAt);
  }
}
```

```svelte
<!-- +page.svelte — orchestrates, owns no logic -->
<script lang="ts">
  import UserAvatar from './components/UserAvatar.svelte';
  import UserStats from './components/UserStats.svelte';
  import { UserDashboardState } from './userDashboard.svelte';

  const { data } = $props();
  const dashboard = $derived(new UserDashboardState(data.userId));
</script>
```

## O — Open/Closed

Use Svelte 5 **Snippets** (`{#snippet ...}`) to let consumers extend component UI without modifying the component's source.

## L — Liskov Substitution

Wrapper components (e.g. a custom `Button`) must accept and spread all standard HTML attributes of the element they wrap (`HTMLButtonAttributes`).

## I — Interface Segregation

Pass only the specific props a component needs. Never pass a large object when only one field is used.

## D — Dependency Inversion

Use `getContext`/`setContext` (wrapped in type-safe helpers) to inject dependencies instead of hard-coding imports to specific instances.
