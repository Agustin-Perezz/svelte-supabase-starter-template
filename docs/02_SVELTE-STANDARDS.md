# Svelte Standards

## Svelte 5 Runes

### State Management

```ts
// $state for reactive data
let count = $state(0);
let books = $state<Book[]>([]);

// $derived for computed values
let doubled = $derived(count * 2);
let hasBooks = $derived(books.length > 0);

// $effect only for side effects (DOM, third-party libs)
$effect(() => {
  const el = document.getElementById('chart');
  if (el) new Chart(el, { data: chartData });
});
```

### Props

```ts
interface Props {
  variant?: 'default' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: import('svelte').Snippet;
}

let { variant = 'default', size = 'md', onClick, children }: Props = $props();
```

**Never destructure `$props()` into plain variables — use `$derived` instead:**

```ts
// BAD
const { books } = data;

// GOOD
const books = $derived(data.books);
```

Use `$bindable()` only when two-way binding is strictly necessary.

### Snippets

```svelte
<!-- Child -->
<script lang="ts">
  interface Props {
    items: Item[];
    child: import('svelte').Snippet<[item: Item]>;
  }
  let { items, child }: Props = $props();
</script>

{#each items as item}
  {@render child(item)}
{/each}

<!-- Parent -->
<List {items}>
  {#snippet child(item)}<span>{item.name}</span>{/snippet}
</List>
```

## SOLID Principles

### Single Responsibility

Each component does one thing. See [Routing & Pages](./03_ROUTING-PAGES.md#page-component-pattern) for page decomposition.

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
// GOOD — only what's needed
interface Props {
  title: string;
  author: string;
  onDelete: (id: string) => void;
}

// BAD — entire object when only 2 fields needed
interface Props {
  book: Book;
}
```

### Dependency Inversion

Use `getContext`/`setContext` to inject dependencies:

```ts
setContext('booksRepository', repository);
const repository = getContext<ICreateBookRepository>('booksRepository');
```

In server code, use the container:

```ts
import { createBooksContainer } from '$modules/books/books.container';

const { create } = createBooksContainer(locals.supabase);
```

## Form Handling

See [Routing & Pages](./03_ROUTING-PAGES.md#superforms-integration) for form patterns and [UI Components](./06_UI-COMPONENTS.md#form-field) for `FormField` usage. Always use shadcn-svelte components over native HTML elements.
