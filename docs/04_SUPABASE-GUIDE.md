# Supabase Integration Guide

## Database Setup

The Supabase client is created per-request in `hooks.server.ts` via `@supabase/ssr`:

```ts
event.locals.supabase = createServerClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
  {
    cookies: { getAll, setAll }
  }
);
```

**Rules:**

- NEVER create a global/singleton Supabase client
- NEVER import `createClient` from `@supabase/supabase-js` in server code
- Credentials come from env vars — never hardcoded

## Environment Variables

| Variable                   | Purpose                |
| -------------------------- | ---------------------- |
| `PUBLIC_SUPABASE_URL`      | Supabase project URL   |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

## Database Migrations

SQL migrations live in `supabase/migrations/` with filenames `{timestamp}_{description}.sql`. All tables must have RLS enabled.

## Generated Types

```bash
pnpm supabase:gen-types        # from remote
pnpm supabase:gen-types:local  # from local instance
```

Outputs to `src/lib/modules/shared/domain/database.types.ts`. Use the `Database` type as the source of truth for all DB shapes:

```ts
type BookRow = Database['public']['Tables']['books']['Row'];
```

## Module Structure

Each feature module contains three layers:

### 1. Domain Layer (`domain/`)

Pure TypeScript — no framework or DB dependencies.

```ts
// domain/Book.ts
export interface CreateBookParams {
  title: string;
  author: string;
}
export interface ReconstructBookParams {
  id: string;
  title: string;
  author: string;
  createdAt: Date;
}

export class Book {
  private constructor(
    private readonly _id: string,
    private _title: string,
    private _author: string,
    private readonly _createdAt: Date
  ) {}

  static create(params: CreateBookParams): Book {
    return new Book('', params.title.trim(), params.author.trim(), new Date());
  }

  static reconstruct(params: ReconstructBookParams): Book {
    return new Book(params.id, params.title, params.author, params.createdAt);
  }

  get id() {
    return this._id;
  }
  get title() {
    return this._title;
  }
  get createdAt() {
    return this._createdAt;
  }
}
```

### 2. Use Cases Layer (`useCases/{use-case}/`)

Each use case does **one** thing and exposes a single `execute` method. If you find yourself adding a second public method (`getInitial` + `applyChange`, `update` + `subscribe`, etc.), split it into a second use case folder. Typical split for read + realtime features:

- `manage-{thing}/` — fetch + apply business rules (filtering, sorting, validation)
- `watch-{thing}/` — subscribe to realtime changes and emit payloads
- `update-{thing}/` — use case for only update
- `get-{thing}/` — use case for only get one thing

Each use case has its own folder with four files:

```ts
// useCases/create-book/create-book.repository.interface.ts
export interface ICreateBookRepository {
  create(book: Book): Promise<Book>;
}

// useCases/create-book/create-book.request.dto.ts
export const createBookRequestSchema = z.object({
  title: z.string().trim().min(1),
  author: z.string().trim().min(1)
});
export type CreateBookRequestDto = z.infer<typeof createBookRequestSchema>;

// useCases/create-book/create-book.use-case.ts
export class CreateBookUseCase {
  constructor(private readonly repository: ICreateBookRepository) {}

  async execute(dto: CreateBookRequestDto): Promise<CreateBookResponseDto> {
    const book = Book.create(dto);
    const saved = await this.repository.create(book);
    return toCreateBookResponseDto(saved);
  }
}
```

**Rules:**

- Accept repository interfaces via constructor (never concrete implementations)
- NEVER import `@supabase/supabase-js` or `@supabase/ssr`
- One use case per folder, one `execute` method per use case

### 3. Infrastructure Layer (`infrastructure/`)

**Entities** — DB row type derived from the generated `Database` type:

```ts
// infrastructure/entities/book.entity.ts
import type { Database } from '$modules/shared/domain/database.types';

export type BookEntity = Database['public']['Tables']['books']['Row'];
```

**Repositories** — Only layer that calls Supabase. Uses a private `toDomain` mapper:

```ts
// infrastructure/repositories/supabase-create-book.repository.ts
export class SupabaseCreateBookRepository implements ICreateBookRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async create(book: Book): Promise<Book> {
    const { data, error } = await this.supabase
      .from('books')
      .insert({ title: book.title, author: book.author })
      .select()
      .single();
    if (error) throw error;
    return this.toDomain(data);
  }

  private toDomain(row: BookEntity): Book {
    return Book.reconstruct({
      id: row.id,
      title: row.title,
      author: row.author,
      createdAt: new Date(row.created_at)
    });
  }
}
```

**Rules:**

- Accept `SupabaseClient<Database>` via constructor
- Always call `.select()` after `.insert()` / `.update()`
- Always check `{ data, error }` and throw on error
- `toDomain` is the only place where DB types and domain types coexist

### 4. Container (`{feature}.container.ts`)

Wires use cases with concrete repositories:

```ts
// books.container.ts
export function createBooksContainer(supabase: SupabaseClient<Database>) {
  return {
    create: new CreateBookUseCase(new SupabaseCreateBookRepository(supabase)),
    update: new UpdateBookUseCase(new SupabaseUpdateBookRepository(supabase))
  };
}
```

Routes import only the container:

```ts
const { create } = createBooksContainer(locals.supabase);
await create.execute(form.data);
```

## Adding a New Entity

### 1. Create migration

```sql
CREATE TABLE IF NOT EXISTS public.authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
```

### 2. Regenerate types

```bash
pnpm supabase:gen-types
```

### 3. Domain layer

```ts
// modules/authors/domain/Author.ts
export class Author {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private readonly _createdAt: Date
  ) {}

  static create(params: { name: string }): Author {
    return new Author('', params.name.trim(), new Date());
  }

  static reconstruct(params: {
    id: string;
    name: string;
    createdAt: Date;
  }): Author {
    return new Author(params.id, params.name, params.createdAt);
  }

  get id() {
    return this._id;
  }
  get name() {
    return this._name;
  }
}
```

### 4. Use case

```ts
// modules/authors/useCases/create-author/create-author.use-case.ts
export class CreateAuthorUseCase {
  constructor(private readonly repository: ICreateAuthorRepository) {}

  async execute(dto: CreateAuthorRequestDto): Promise<void> {
    const author = Author.create(dto);
    await this.repository.create(author);
  }
}
```

### 5. Infrastructure

```ts
// modules/authors/infrastructure/entities/author.entity.ts
export type AuthorEntity = Database['public']['Tables']['authors']['Row'];

// modules/authors/infrastructure/repositories/supabase-create-author.repository.ts
export class SupabaseCreateAuthorRepository implements ICreateAuthorRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async create(author: Author): Promise<Author> {
    const { data, error } = await this.supabase
      .from('authors')
      .insert({ name: author.name })
      .select()
      .single();
    if (error) throw error;
    return this.toDomain(data);
  }

  private toDomain(row: AuthorEntity): Author {
    return Author.reconstruct({
      id: row.id,
      name: row.name,
      createdAt: new Date(row.created_at)
    });
  }
}
```

## Use-Case Responsibility Rule

Each use case does **one** thing and exposes a single `execute` method. If you find yourself adding a second public method (`getInitial` + `applyChange`, `load` + `subscribe`, etc.), split it into a second use case folder. Typical split for read + realtime features:

- `manage-{thing}/` — fetch + apply business rules (filtering, sorting, validation)
- `watch-{thing}/` — subscribe to realtime changes and emit payloads

Both use cases share a single repository interface when appropriate (e.g. `IOrderRepository` exposing both `findActive` and `subscribeToChanges`).

### 6. Container + Route

```ts
// modules/authors/authors.container.ts
export function createAuthorsContainer(supabase: SupabaseClient<Database>) {
  return {
    create: new CreateAuthorUseCase(
      new SupabaseCreateAuthorRepository(supabase)
    )
  };
}

// routes/authors/+page.server.ts
const { create } = createAuthorsContainer(locals.supabase);
await create.execute(form.data);
```
