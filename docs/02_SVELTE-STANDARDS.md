# Svelte Standards

This document covers the Svelte 5 coding standards enforced in this project, including Runes patterns, SOLID principles, and form handling.

## Svelte 5 Runes

### State Management

**Use `$state()` for reactive data:**

```ts
// GOOD
let count = $state(0);
let books = $state<Book[]>([]);

// BAD (Svelte 4 patterns)
let count = 0;
$: doubled = count * 2;
```

**Use `$derived()` for computed values:**

```ts
// GOOD
let count = $state(0);
let doubled = $derived(count * 2);
let hasBooks = $derived(books.length > 0);

// BAD
$: doubled = count * 2;
```

**Use `$effect()` only for side effects:**

```ts
// GOOD — DOM manipulation, third-party libs
$effect(() => {
  const el = document.getElementById('chart');
  if (el) {
    new Chart(el, { data: chartData });
  }
});

// BAD — syncing state
$effect(() => {
  derivedValue = sourceValue * 2; // Use $derived instead
});
```

### Props

**Define an explicit Props interface:**

```ts
interface Props {
  variant?: 'default' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: import('svelte').Snippet;
}

let { variant = 'default', size = 'md', onClick, children }: Props = $props();
```

**NEVER destructure `$props()` directly into reactive expressions:**

```ts
// BAD
const { books } = data;
const detail = new MyClass(data.foo);

// GOOD
const books = $derived(data.books);
const detail = $derived(new MyClass(data.foo));
```

**Use `$bindable()` only when two-way binding is strictly necessary:**

```ts
interface Props {
  value?: string;
}

let { value = $bindable() }: Props = $props();
```

### Snippets (Slot Replacement)

```svelte
<!-- Child component -->
<script lang="ts">
  interface Props {
    items: Item[];
    child: import('svelte').Snippet<[item: Item]>;
  }
  let { items, child }: Props = $props();
</script>

<!-- Parent -->
<List items={data}>
  {#snippet child(item)}
    <span>{item.name}</span>
  {/snippet}
</List>

{#each items as item}
  {@render child(item)}
{/each}
```

## Page Decomposition (SOLID)

Every page must follow the three-layer decomposition. See [Routing & Pages](./03_ROUTING-PAGES.md#page-component-pattern) for the full pattern with code examples. The SOLID principles applied to this pattern are:

### Single Responsibility

See [Routing & Pages](./03_ROUTING-PAGES.md#page-component-pattern) for the three-layer decomposition details.

### Open/Closed

Use snippets to let consumers extend component UI without modifying source:

```ts
interface Props {
  header?: import('svelte').Snippet;
  footer?: import('svelte').Snippet;
}
```

### Liskov Substitution

Wrapper components must accept and spread all standard HTML attributes:

```ts
import type { HTMLButtonAttributes } from 'svelte/elements';

interface Props extends HTMLButtonAttributes {
  variant?: ButtonVariant;
}
```

### Interface Segregation

Pass only the specific props a component needs:

```ts
// GOOD
interface Props {
  title: string;
  author: string;
  onDelete: (id: string) => void;
}

// BAD
interface Props {
  book: Book; // Passes entire object when only 2 fields needed
}
```

### Dependency Inversion

Use `getContext`/`setContext` (wrapped in type-safe helpers) to inject dependencies:

```ts
// Provider
// Consumer
import { getContext, setContext } from 'svelte';

setContext('booksService', service);

const service = getContext<BooksService>('booksService');
```

## Form Handling

See [Routing & Pages](./03_ROUTING-PAGES.md#progressive-enhancement) for form patterns and progressive enhancement, and [UI Components](./06_UI-COMPONENTS.md#form-field) for FormField usage. Always use shadcn-svelte components over native HTML elements.
