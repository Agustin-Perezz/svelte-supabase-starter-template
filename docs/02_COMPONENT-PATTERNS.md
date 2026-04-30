# Component Patterns

## Size Limits

- **50-line hard limit per component** - no exceptions
- **Proactive split at 40 lines** - do not wait until hitting 50
- One concern per file - a form component does not contain a list, a list does not contain a modal

## Page Components

`+page.svelte` is composition-only: it imports and arranges components, nothing else. No logic, no inline styles, no conditionals beyond prop-passing.

```svelte
<script lang="ts">
  import ProductCreateForm from './components/ProductCreateForm.svelte';
  import ProductHeader from './components/ProductHeader.svelte';
  import ProductList from './components/ProductList.svelte';

  const { data } = $props();
</script>

<main>
  <ProductHeader />
  <ProductCreateForm createForm={data.createForm} />
  <ProductList products={data.products} />
</main>
```

## Svelte 5 Runes

### State Management

```ts
let count = $state(0);
let books = $state<Book[]>([]);

let doubled = $derived(count * 2);
let hasBooks = $derived(books.length > 0);

$effect(() => {
  const el = document.getElementById('chart');
  if (el) new Chart(el, { data: chartData });
});
```

Use `$effect` only for side effects (DOM, third-party libs).

### Props

```ts
enum ButtonVariant {
  Default = 'default',
  Destructive = 'destructive'
}

enum ButtonSize {
  Sm = 'sm',
  Md = 'md',
  Lg = 'lg'
}

interface Props {
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  children: import('svelte').Snippet;
}

let { variant = 'default', size = 'md', onClick, children }: Props = $props();
```

Never destructure `$props()` into plain variables - use `$derived` instead:

```ts
const { books } = data;

const books = $derived(data.books);
```

Use `$bindable()` only when two-way binding is strictly necessary.

## SOLID Principles

### Single Responsibility

Each component does one thing. See [Frontend Folder Structure](./03_FRONTEND-FOLDER-STRUCTURE.md) for page decomposition.

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
interface Props {
  title: string;
  author: string;
  onDelete: (id: string) => void;
}
```

Do not pass entire objects when only a few fields are needed.

### Dependency Inversion

Use `getContext`/`setContext` to inject dependencies in client code. Use the container pattern in server code:

```ts
import { createBooksContainer } from '$modules/books/books.container';

const { create } = createBooksContainer(locals.supabase);
```
