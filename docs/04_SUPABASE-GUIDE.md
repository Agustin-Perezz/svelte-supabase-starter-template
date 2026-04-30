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

Outputs to `src/lib/shared/domain/database.types.ts`. Use the `Database` type as the source of truth for all DB shapes:

```ts
type BookRow = Database['public']['Tables']['books']['Row'];
```

## Clean Architecture Structure

### 1. Domain Layer (`src/domain/entities/`)

Pure TypeScript — no framework or DB dependencies.

```ts
// src/domain/entities/book.entity.ts
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

### 2. Application Layer (`src/application/use-cases/`)

Each use case does **one** thing and exposes a single `execute` method. Typical structure:

```
src/application/use-cases/books/create-book/
├── create-book.repository.interface.ts   # Interface for the repository
├── create-book.request.dto.ts           # Zod schema for request validation
├── create-book.response.dto.ts           # Response type and mapper
└── create-book.use-case.ts              # Use case implementation
```

**Example files:**

```ts
// create-book.repository.interface.ts
// create-book.use-case.ts
import { Book, type Book } from '$domain/entities/book.entity';
// create-book.request.dto.ts
import { z } from 'zod';

import type { ICreateBookRepository } from './create-book.repository.interface';
import type { CreateBookRequestDto } from './create-book.request.dto';
import {
  toCreateBookResponseDto,
  type CreateBookResponseDto
} from './create-book.response.dto';

export interface ICreateBookRepository {
  create(book: Book): Promise<Book>;
}

export const createBookRequestSchema = z.object({
  title: z.string().trim().min(1),
  author: z.string().trim().min(1)
});
export type CreateBookRequestDto = z.infer<typeof createBookRequestSchema>;

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

### 3. Infrastructure Layer (`src/infrastructure/`)

**Entities** — DB row type derived from the generated `Database` type:

```ts
// src/infrastructure/database/postgres/entities/book.entity.ts
import type { Database } from '$lib/shared/domain/database.types';

export type BookEntity = Database['public']['Tables']['books']['Row'];
```

**Repositories** — Only layer that calls Supabase. Uses a private `toDomain` mapper:

```ts
// src/infrastructure/database/postgres/repositories/books/supabase-create-book.repository.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ICreateBookRepository } from '$application/use-cases/books/create-book/create-book.repository.interface';
import { Book } from '$domain/entities/book.entity';

import type { Database } from '$lib/shared/domain/database.types';
import type { BookEntity } from '../../entities/book.entity';

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

### 4. DI Container (`src/lib/containers/`)

Wires use cases with concrete repositories:

```ts
// src/lib/containers/books.container.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { CreateBookUseCase } from '$application/use-cases/books/create-book/create-book.use-case';
import { SupabaseCreateBookRepository } from '$infrastructure/database/postgres/repositories/books/supabase-create-book.repository';

import type { Database } from '$lib/shared/domain/database.types';

export interface BooksContainer {
  create: CreateBookUseCase;
}

export function createBooksContainer(
  supabase: SupabaseClient<Database>
): BooksContainer {
  return {
    create: new CreateBookUseCase(new SupabaseCreateBookRepository(supabase))
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
// src/domain/entities/author.entity.ts
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
// src/application/use-cases/authors/create-author/create-author.use-case.ts
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
// src/infrastructure/database/postgres/entities/author.entity.ts
export type AuthorEntity = Database['public']['Tables']['authors']['Row'];

// src/infrastructure/database/postgres/repositories/authors/supabase-create-author.repository.ts
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

### 6. Container + Route

```ts
// src/lib/containers/authors.container.ts
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
