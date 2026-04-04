# Routing & Pages

SvelteKit's file-based routing powers the application. This document covers routing conventions, page structure, and patterns used in this project.

## Route Structure

```
src/routes/
├── +layout.svelte          # Root layout — wraps all pages
├── +page.svelte            # Home page (/)
├── protected/
│   ├── +page.server.ts     # Server config (no prerender)
│   └── +page.svelte        # Authenticated page (/protected)
└── books/
    ├── +page.server.ts     # Load functions & form actions
    ├── +page.svelte        # Page component (/books)
    ├── booksPage.svelte.ts # Reactive state class
    └── components/         # Route-specific components
        ├── BookCreateForm.svelte
        ├── BookList.svelte
        ├── BookListItem.svelte
        └── BookEmptyState.svelte
```

## Routes

| Route                     | Path         | Description                                           |
| ------------------------- | ------------ | ----------------------------------------------------- |
| `src/routes/+page.svelte` | `/`          | Home page — simple landing page                       |
| `src/routes/protected/`   | `/protected` | Authenticated-only page, guarded by `hooks.server.ts` |
| `src/routes/books/`       | `/books`     | Books CRUD interface with form actions                |

## Layout

The root layout (`+layout.svelte`) wraps all pages:

```svelte
<script lang="ts">
  import { Toaster } from 'svelte-french-toast';

  import type { LayoutData } from './$types';

  interface Props {
    children: import('svelte').Snippet;
    data: LayoutData;
  }

  let { children }: Props = $props();
</script>

<Toaster />
{@render children()}
```

**Key points:**

- Imports global CSS via `src/app.css`
- Renders `<Toaster />` for toast notifications
- Uses Svelte 5 `{@render children()}` for slot rendering
- No nested layouts exist — all pages share this single layout

## Page Server Functions

### Load Functions

Load functions fetch data before the page renders. Repositories and use cases are instantiated per-request:

```ts
// src/routes/books/+page.server.ts
import { bookCreateSchema } from '$modules/books/domain/BookSchemas';
import { SupabaseBookRepository } from '$modules/books/infrastructure/SupabaseBookRepository.server';
import { GetAllBooks } from '$modules/books/useCases/GetAllBooks';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const repository = new SupabaseBookRepository(locals.supabase);
  const getAllBooks = new GetAllBooks(repository);
  const books = await getAllBooks.execute();
  const createForm = await superValidate(zod(bookCreateSchema));
  return { books, createForm };
};
```

### Form Actions

Form actions handle mutations via POST requests:

```ts
import { fail } from '@sveltejs/kit';
import { bookCreateSchema } from '$modules/books/domain/BookSchemas';
import { SupabaseBookRepository } from '$modules/books/infrastructure/SupabaseBookRepository.server';
import { CreateBook } from '$modules/books/useCases/CreateBook';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import type { Actions } from './$types';

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const form = await superValidate(request, zod(bookCreateSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const repository = new SupabaseBookRepository(locals.supabase);
      const createBook = new CreateBook(repository);
      await createBook.execute(form.data);
      return message(form, 'Book created successfully');
    } catch {
      return message(form, 'Failed to create book', { status: 500 });
    }
  }
};
```

**Named actions** are invoked via the form's `action` attribute:

- `?/create` — Creates a book
- `?/update` — Updates a book
- `?/delete` — Deletes a book

## Page Component Pattern

Pages follow a three-layer decomposition:

### 1. State Class (`.svelte.ts`)

```ts
// booksPage.svelte.ts
import type { Book } from '$modules/books/domain/Book';

export class BooksPageState {
  books = $state<Book[]>([]);
  hasBooks = $derived(this.books.length > 0);

  constructor(books: Book[]) {
    this.books = books;
  }
}
```

### 2. Sub-Components (`components/`)

Small, focused components (~50 lines max):

```svelte
<!-- BookEmptyState.svelte -->
<p class="text-gray-500">No books yet. Add one above.</p>
```

### 3. Page Orchestration (`+page.svelte`)

Pure composition — no inline logic:

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { BooksPageState } from './booksPage.svelte';
  import { BookCreateForm } from './components/BookCreateForm.svelte';
  import { BookEmptyState } from './components/BookEmptyState.svelte';
  import { BookList } from './components/BookList.svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const state = $derived(new BooksPageState(data.books));
</script>

<svelte:head>
  <title>Books</title>
</svelte:head>

<h1>Books</h1>
<BookCreateForm createForm={data.createForm} />

{#if state.hasBooks}
  <BookList books={data.books} />
{:else}
  <BookEmptyState />
{/if}
```

## Authentication Guard

The `/protected` route is guarded at the server hook level:

```ts
// hooks.server.ts
const authHandle: Handle = async ({ event, resolve }) => {
  event.locals.user = authenticateUser(event);

  if (!event.locals.user && event.url.pathname.startsWith('/protected')) {
    throw redirect(303, '/');
  }

  return resolve(event);
};
```

Unauthenticated users are redirected to `/` before the page renders.

## Progressive Enhancement

Forms use SvelteKit's `enhance` action for JavaScript-enhanced submissions:

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
</script>

<form method="POST" action="?/create" use:enhance>
  <!-- form fields -->
</form>
```

**Benefits:**

- No full page reload when JavaScript is enabled
- Graceful degradation — forms work without JavaScript via standard POST

## Superforms Integration

Forms use `sveltekit-superforms` with Zod schemas:

```svelte
<script lang="ts">
  import { bookCreateSchema } from '$modules/books/domain/BookSchemas';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  let { createForm }: Props = $props();
  const form = superForm(createForm, {
    validators: zodClient(bookCreateSchema),
    resetForm: true,
    dataType: 'json'
  });

  const { form: formData, errors, message, submitting } = form;
</script>
```

**Features:**

- Client-side Zod validation
- Auto-reset on successful submit
- Server error message propagation via `$message`
- Reactive `submitting` state

## Server Configuration

Pages can override SvelteKit defaults:

```ts
// protected/+page.server.ts
export const prerender = false;
```

This ensures the protected page is never statically prerendered, requiring dynamic auth checks at request time.

## No API Routes

This project uses **no** `+server.ts` files. All server-side logic goes through:

- Page server load functions (`load` in `+page.server.ts`)
- Form actions (`actions` in `+page.server.ts`)

This follows SvelteKit's preferred patterns over REST API endpoints.

## No Error Pages

There are no `+error.svelte` files. Error handling is done through:

- Form action error messages (via `message()` from superforms)
- Sentry integration in `hooks.client.ts` and `hooks.server.ts`
- SvelteKit's built-in error handling
