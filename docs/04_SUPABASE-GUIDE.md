# Supabase Integration Guide

This document covers the Supabase integration patterns used in this project, including database architecture, module-based clean architecture layering, and how to add new entities.

## Database Setup

### Connection

The project uses `@supabase/ssr` for server-side rendering compatible connections. The Supabase client is created per-request in `hooks.server.ts`:

```ts
import { createServerClient } from '@supabase/ssr';

const supabase = createServerClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
  { cookies: { getAll, setAll } }
);
```

**Critical rules:**

- NEVER create a global/singleton Supabase client
- NEVER import `createClient` from `@supabase/supabase-js` in server code
- Credentials come from environment variables — never hardcoded

### Environment Variables

| Variable                   | Scope           | Purpose                |
| -------------------------- | --------------- | ---------------------- |
| `PUBLIC_SUPABASE_URL`      | Client + Server | Supabase project URL   |
| `PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anonymous key |

## Database Migrations

SQL migrations live in `supabase/migrations/`. Filenames follow the pattern `{timestamp}_{description}.sql`.

### Row Level Security (RLS)

All tables have RLS enabled. Policies control access per role:

- `anon` — Unauthenticated users (public access)
- `authenticated` — Logged-in users (when auth is configured)

The current template uses fully permissive `anon` policies for demo purposes. In production, policies should restrict access based on user identity.

## Generated Types

TypeScript types are auto-generated from the Supabase schema:

```bash
pnpm supabase:gen-types
```

This command outputs to `src/lib/modules/shared/domain/database.types.ts` and provides:

- `Database` — Root type representing the entire schema
- `Database['public']['Tables']['books']['Row']` — Row shape for SELECT
- `Database['public']['Tables']['books']['Insert']` — Row shape for INSERT
- `Database['public']['Tables']['books']['Update']` — Row shape for UPDATE

## Module-Based Clean Architecture Layers

Each feature module (`src/lib/modules/{feature}/`) contains three layers:

### 1. Domain Layer (`modules/{feature}/domain/`)

Contains entity types, repository interfaces, and Zod schemas.

**Entity Types** — Clean domain types separate from DB shape:

```ts
// modules/books/domain/Book.ts
import type { Database } from '$modules/shared/domain/database.types';

export type BookEntity = Database['public']['Tables']['books']['Row'];
export type BookEntityInsert = Database['public']['Tables']['books']['Insert'];
export type BookEntityUpdate = Database['public']['Tables']['books']['Update'];

export type Book = {
  id: string;
  title: string;
  author: string;
  createdAt: string;
};

export type BookInsert = Omit<Book, 'id' | 'createdAt'>;
export type BookUpdate = Partial<Omit<BookInsert, 'id'>>;
```

**Repository Interfaces** — Dependency inversion:

```ts
// modules/books/domain/IBookRepository.ts
import type { Book, BookEntityInsert, BookEntityUpdate } from './Book';

export interface IBookRepository {
  getAll(): Promise<Book[]>;
  getById(_id: string): Promise<Book>;
  create(_book: BookEntityInsert): Promise<Book>;
  update(_id: string, _book: BookEntityUpdate): Promise<Book>;
  delete(_id: string): Promise<void>;
}
```

**Zod Schemas** — Validation co-located with domain:

```ts
// modules/books/domain/BookSchemas.ts
import { z } from 'zod';

export const bookCreateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  author: z.string().trim().min(1, 'Author is required')
});

export type CreateBookDTO = z.infer<typeof bookCreateSchema>;
```

### 2. Use Cases Layer (`modules/{feature}/useCases/`)

Application logic — each use case is a class with an `execute` method:

```ts
// modules/books/useCases/CreateBook.ts
import type { Book } from '$modules/books/domain/Book';
import type { CreateBookDTO } from '$modules/books/domain/BookSchemas';
import type { IBookRepository } from '$modules/books/domain/IBookRepository';
import { BookMapper } from '$modules/books/infrastructure/mappers/BookMapper';

export class CreateBook {
  private readonly repository: IBookRepository;

  constructor(repository: IBookRepository) {
    this.repository = repository;
  }

  async execute(dto: CreateBookDTO): Promise<Book> {
    const insert = BookMapper.fromDtoToInsertEntity(dto);
    return this.repository.create(insert);
  }
}
```

**Rules:**

- Accept repository interfaces via constructor injection (not concrete implementations)
- Accept Zod-inferred DTOs, never raw Insert/Update types
- NEVER import `@supabase/supabase-js` or `@supabase/ssr`
- Return domain entity types, not Supabase response wrappers
- One use case per file, one `execute` method per use case

### 3. Infrastructure Layer (`modules/{feature}/infrastructure/`)

Concrete implementations — Supabase repositories and mappers.

**Mappers** — Shape transformations:

```ts
// modules/books/infrastructure/mappers/BookMapper.ts
import type {
  Book,
  BookEntity,
  BookEntityInsert,
  BookEntityUpdate
} from '$modules/books/domain/Book';
import type {
  CreateBookDTO,
  UpdateBookDTO
} from '$modules/books/domain/BookSchemas';

export class BookMapper {
  static fromEntitiesToBooks(rows: BookEntity[]): Book[] {
    return rows.map((row) => BookMapper.fromEntityToBook(row));
  }

  static fromEntityToBook(entity: BookEntity): Book {
    return {
      id: entity.id,
      title: entity.title,
      author: entity.author,
      createdAt: entity.created_at
    } satisfies Book;
  }

  static fromDtoToInsertEntity(dto: CreateBookDTO): BookEntityInsert {
    return {
      title: dto.title,
      author: dto.author
    } satisfies BookEntityInsert;
  }

  static fromDtoToUpdateEntity(dto: UpdateBookDTO): BookEntityUpdate {
    return {
      title: dto.title,
      author: dto.author
    } satisfies BookEntityUpdate;
  }
}
```

**Naming convention:**

- `fromEntityTo{Model}` — DB Row → Domain Entity
- `fromEntitiesTo{Model}s` — Batch version
- `fromDtoToInsertEntity` — Create DTO → Insert shape
- `fromDtoToUpdateEntity` — Update DTO → Update shape

**Repositories** — Data access layer, the ONLY place that calls Supabase:

```ts
// modules/books/infrastructure/SupabaseBookRepository.server.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Book,
  BookEntityInsert,
  BookEntityUpdate
} from '$modules/books/domain/Book';
import type { IBookRepository } from '$modules/books/domain/IBookRepository';
import type { Database } from '$modules/shared/domain/database.types';

import { BookMapper } from './mappers/BookMapper';

export class SupabaseBookRepository implements IBookRepository {
  private readonly supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  async getAll(): Promise<Book[]> {
    const { data, error } = await this.supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return BookMapper.fromEntitiesToBooks(data);
  }

  async create(book: BookEntityInsert): Promise<Book> {
    const { data, error } = await this.supabase
      .from('books')
      .insert(book)
      .select()
      .single();
    if (error) throw error;
    return BookMapper.fromEntityToBook(data);
  }
}
```

**Rules:**

- Accept `SupabaseClient<Database>` via constructor injection
- Implement the repository interface defined in `domain/`
- Always call `.select()` after `.insert()` or `.update()`
- Always check `{ data, error }` and throw on error
- Map results through the mapper before returning

## Hooks Wiring

Only the Supabase client is wired in `hooks.server.ts`:

```ts
const supabaseHandle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(/* ... */);
  return resolve(event, {
    /* ... */
  });
};
```

Repositories and use cases are instantiated in `+page.server.ts` where needed.

## Type Declarations

Update `src/app.d.ts` to expose the Supabase client on `App.Locals`:

```ts
declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user: User | null;
    }
  }
}
```

## Adding a New Entity

Follow this checklist to add a new Supabase-backed entity (e.g., `authors`):

### 1. Create Migration

```sql
-- supabase/migrations/{timestamp}_create_authors_table.sql
CREATE TABLE IF NOT EXISTS public.authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
-- Add RLS policies...
```

### 2. Regenerate Types

```bash
pnpm supabase:gen-types
```

### 3. Create Domain Layer

Create `modules/authors/domain/` with three files:

```ts
// modules/authors/domain/Author.ts
import type { Database } from '$modules/shared/domain/database.types';

export type AuthorEntity = Database['public']['Tables']['authors']['Row'];
export type AuthorEntityInsert =
  Database['public']['Tables']['authors']['Insert'];
export type AuthorEntityUpdate =
  Database['public']['Tables']['authors']['Update'];

export type Author = {
  id: string;
  name: string;
  bio: string | null;
  createdAt: string;
};

export type AuthorInsert = Omit<Author, 'id' | 'createdAt'>;
export type AuthorUpdate = Partial<Omit<AuthorInsert, 'id'>>;
```

```ts
// modules/authors/domain/IAuthorRepository.ts
import type { Author, AuthorEntityInsert, AuthorEntityUpdate } from './Author';

export interface IAuthorRepository {
  getAll(): Promise<Author[]>;
  getById(_id: string): Promise<Author>;
  create(_author: AuthorEntityInsert): Promise<Author>;
  update(_id: string, _author: AuthorEntityUpdate): Promise<Author>;
  delete(_id: string): Promise<void>;
}
```

```ts
// modules/authors/domain/AuthorSchemas.ts
import { z } from 'zod';

export const authorCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  bio: z.string().trim().optional()
});

export type CreateAuthorDTO = z.infer<typeof authorCreateSchema>;
```

### 4. Create Infrastructure Layer

Create `modules/authors/infrastructure/` with mapper and repository:

```ts
// modules/authors/infrastructure/mappers/AuthorMapper.ts
import type {
  Author,
  AuthorEntity,
  AuthorEntityInsert,
  AuthorEntityUpdate
} from '$modules/authors/domain/Author';
import type { CreateAuthorDTO } from '$modules/authors/domain/AuthorSchemas';

export class AuthorMapper {
  static fromEntitiesToAuthors(rows: AuthorEntity[]): Author[] {
    return rows.map((row) => AuthorMapper.fromEntityToAuthor(row));
  }

  static fromEntityToAuthor(entity: AuthorEntity): Author {
    return {
      id: entity.id,
      name: entity.name,
      bio: entity.bio,
      createdAt: entity.created_at
    } satisfies Author;
  }

  static fromDtoToInsertEntity(dto: CreateAuthorDTO): AuthorEntityInsert {
    return { name: dto.name, bio: dto.bio } satisfies AuthorEntityInsert;
  }
}
```

```ts
// modules/authors/infrastructure/SupabaseAuthorRepository.server.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Author,
  AuthorEntityInsert,
  AuthorEntityUpdate
} from '$modules/authors/domain/Author';
import type { IAuthorRepository } from '$modules/authors/domain/IAuthorRepository';
import type { Database } from '$modules/shared/domain/database.types';

import { AuthorMapper } from './mappers/AuthorMapper';

export class SupabaseAuthorRepository implements IAuthorRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll(): Promise<Author[]> {
    const { data, error } = await this.supabase.from('authors').select('*');
    if (error) throw error;
    return AuthorMapper.fromEntitiesToAuthors(data);
  }

  async create(author: AuthorEntityInsert): Promise<Author> {
    const { data, error } = await this.supabase
      .from('authors')
      .insert(author)
      .select()
      .single();
    if (error) throw error;
    return AuthorMapper.fromEntityToAuthor(data);
  }
}
```

### 5. Create Use Cases

Create `modules/authors/useCases/` with use case classes:

```ts
// modules/authors/useCases/GetAllAuthors.ts
import type { Author } from '$modules/authors/domain/Author';
import type { IAuthorRepository } from '$modules/authors/domain/IAuthorRepository';

export class GetAllAuthors {
  constructor(private readonly repository: IAuthorRepository) {}

  async execute(): Promise<Author[]> {
    return this.repository.getAll();
  }
}
```

```ts
// modules/authors/useCases/CreateAuthor.ts
import type { Author } from '$modules/authors/domain/Author';
import type { CreateAuthorDTO } from '$modules/authors/domain/AuthorSchemas';
import type { IAuthorRepository } from '$modules/authors/domain/IAuthorRepository';
import { AuthorMapper } from '$modules/authors/infrastructure/mappers/AuthorMapper';

export class CreateAuthor {
  constructor(private readonly repository: IAuthorRepository) {}

  async execute(dto: CreateAuthorDTO): Promise<Author> {
    const entity = AuthorMapper.fromDtoToInsertEntity(dto);
    return this.repository.create(entity);
  }
}
```

### 6. Create Route

Create `src/routes/authors/` with `+page.server.ts`, `+page.svelte`, and components. Instantiate repositories and use cases in the server file:

```ts
// src/routes/authors/+page.server.ts
import { authorCreateSchema } from '$modules/authors/domain/AuthorSchemas';
import { SupabaseAuthorRepository } from '$modules/authors/infrastructure/SupabaseAuthorRepository.server';
import { GetAllAuthors } from '$modules/authors/useCases/GetAllAuthors';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const repository = new SupabaseAuthorRepository(locals.supabase);
  const getAllAuthors = new GetAllAuthors(repository);
  const authors = await getAllAuthors.execute();
  const createForm = await superValidate(zod(authorCreateSchema));
  return { authors, createForm };
};
```
