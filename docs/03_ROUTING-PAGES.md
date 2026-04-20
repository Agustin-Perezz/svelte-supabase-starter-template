# Routing & Pages

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
    └── components/         # Route-specific components
        ├── BookCreateForm.svelte
        └── ...
```

## Routes

| Route                     | Path         | Description       |
| ------------------------- | ------------ | ----------------- |
| `src/routes/+page.svelte` | `/`          | Home page         |
| `src/routes/protected/`   | `/protected` | Auth-guarded page |
| `src/routes/books/`       | `/books`     | Books interface   |

## Layout

The root layout renders `<Toaster />` and `{@render children()}`. No nested layouts exist.

## Page Server Functions

### Load Functions

```ts
// src/routes/books/+page.server.ts
import { createBooksContainer } from '$modules/books/books.container';
import { createBookRequestSchema } from '$modules/books/useCases/create-book/create-book.request.dto';
import { superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ locals }) => {
  const createForm = await superValidate(zod(createBookRequestSchema));
  return { createForm };
};
```

### Form Actions

```ts
export const actions: Actions = {
  create: async ({ request, locals }) => {
    const form = await superValidate(request, zod(createBookRequestSchema));
    if (!form.valid) return fail(400, { createForm: form });

    try {
      const { create } = createBooksContainer(locals.supabase);
      await create.execute(form.data);
    } catch (err) {
      return message(form, String(err), { status: 500 });
    }

    return { createForm: form };
  }
};
```

Named actions are invoked via the form's `action` attribute: `?/create`, `?/update`, `?/delete`.

## Page Component Pattern

Pages follow a decomposition:

1. **Sub-components** (`components/`) — Small, focused (~50 lines max)
2. **Page orchestration** (`+page.svelte`) — Pure composition, no inline logic

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import BookCreateForm from './components/BookCreateForm.svelte';

  const { data } = $props();
</script>

<main>
  <h1>Books</h1>
  <BookCreateForm createForm={data.createForm} />
</main>
```

## Authentication Guard

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

## Superforms Integration

```svelte
<script lang="ts">
  import { createBookRequestSchema } from '$modules/books/useCases/create-book/create-book.request.dto';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  let { createForm }: Props = $props();
  const { form, errors, message, enhance } = superForm(createForm, {
    validators: zodClient(createBookRequestSchema),
    resetForm: true
  });
</script>

<form method="POST" action="?/create" use:enhance>
  <!-- fields -->
</form>
```

## Conventions

- **No `+server.ts` files** — all server logic goes through `+page.server.ts` load/actions
- **No `+error.svelte`** — errors handled via superforms messages and Sentry
- **`prerender = false`** on pages that require dynamic auth checks
