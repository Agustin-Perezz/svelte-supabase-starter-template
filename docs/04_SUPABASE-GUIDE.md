# Supabase Integration Guide

This document covers the Supabase integration patterns used in this project, including database architecture, clean architecture layering, and how to add new entities.

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

````

### Row Level Security (RLS)

All tables have RLS enabled. Policies control access per role:

- `anon` — Unauthenticated users (public access)
- `authenticated` — Logged-in users (when auth is configured)

The current template uses fully permissive `anon` policies for demo purposes. In production, policies should restrict access based on user identity.

## Generated Types

TypeScript types are auto-generated from the Supabase schema:

```bash
pnpm supabase:gen-types
````

This command outputs to `src/lib/domain/types/database.types.ts` and provides:

- `Database` — Root type representing the entire schema
- `Database['public']['Tables']['books']['Row']` — Row shape for SELECT
- `Database['public']['Tables']['books']['Insert']` — Row shape for INSERT
- `Database['public']['Tables']['books']['Update']` — Row shape for UPDATE

## Clean Architecture Layers

### 1. Domain Models (`src/lib/domain/models/`)

Thin type aliases derived from generated types:

```ts
import type { Database } from '$domain/types/database.types';

export type Book = Database['public']['Tables']['books']['Row'];
export type BookInsert = Database['public']['Tables']['books']['Insert'];
export type BookUpdate = Database['public']['Tables']['books']['Update'];
```

### 2. Mappers (`src/lib/domain/mappers/`)

Static classes for shape transformations:

```ts
export class BookMapper {
  static fromEntityToBook(
    row: Database['public']['Tables']['books']['Row']
  ): Book {
    return {
      id: row.id,
      title: row.title,
      author: row.author,
      created_at: row.created_at
    } satisfies Book;
  }

  static fromDtoToInsertEntity(dto: CreateDTO): BookInsert {
    return { title: dto.title, author: dto.author } satisfies BookInsert;
  }
}
```

**Naming convention:**

- `fromEntityTo{Model}` — DB Row → Domain Model
- `fromEntitiesTo{Model}s` — Batch version
- `fromDtoToInsertEntity` — Create DTO → Insert shape
- `fromDtoToUpdateEntity` — Update DTO → Update shape

### 3. Repositories (`src/lib/server/repositories/`)

Data access layer — the ONLY place that calls Supabase:

```ts
export class BooksRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll(): Promise<Book[]> {
    const { data, error } = await this.supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return BookMapper.fromEntitiesToBooks(data);
  }

  async create(book: BookInsert): Promise<Book> {
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
- Always call `.select()` after `.insert()` or `.update()`
- Always check `{ data, error }` and throw on error
- Map results through the mapper before returning

### 4. Services (`src/lib/server/services/`)

Business logic layer:

```ts
export class BooksService {
  constructor(private repository: BooksRepository) {}

  async createBook(dto: CreateDTO): Promise<Book> {
    const entity = BookMapper.fromDtoToInsertEntity(dto);
    return this.repository.create(entity);
  }
}
```

**Rules:**

- Accept repositories via constructor injection
- Accept Zod-inferred DTOs, never raw Insert/Update types
- NEVER import `@supabase/supabase-js` or `@supabase/ssr`
- Return domain types, not Supabase response wrappers

### 5. Zod Schemas (`src/lib/schemas/`)

Validation schemas for form input:

```ts
import { z } from 'zod';

export const bookCreateSchema = z.object({
  title: z.string().trim().min(1),
  author: z.string().trim().min(1)
});

export type CreateDTO = z.infer<typeof bookCreateSchema>;
```

## Hooks Wiring

Dependencies are wired in `hooks.server.ts`:

```ts
const supabaseHandle: Handle = async ({ event, resolve }) => {
  const supabase = createServerClient(/* ... */);
  const booksRepository = new BooksRepository(supabase);
  const booksService = new BooksService(booksRepository);

  event.locals.supabase = supabase;
  event.locals.booksRepository = booksRepository;
  event.locals.booksService = booksService;

  return resolve(event, {
    filterSerializedResponseHeaders: (name) =>
      name === 'content-range' || name === 'x-supabase-api-version'
  });
};
```

## Type Declarations

Update `src/app.d.ts` to expose types on `App.Locals`:

```ts
declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      booksRepository: BooksRepository;
      booksService: BooksService;
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

### 3. Create Domain Model

```ts
// src/lib/domain/models/author.ts
import type { Database } from '$domain/types/database.types';

export type Author = Database['public']['Tables']['authors']['Row'];
export type AuthorInsert = Database['public']['Tables']['authors']['Insert'];
export type AuthorUpdate = Database['public']['Tables']['authors']['Update'];
```

### 4. Create Mapper

```ts
// src/lib/domain/mappers/author.mapper.ts
import type { Author, AuthorInsert, AuthorUpdate } from '$domain/models/author';
import type { Database } from '$domain/types/database.types';

export class AuthorMapper {
  static fromEntityToAuthor(
    row: Database['public']['Tables']['authors']['Row']
  ): Author {
    return {
      id: row.id,
      name: row.name,
      bio: row.bio,
      created_at: row.created_at
    } satisfies Author;
  }

  static fromDtoToInsertEntity(dto: CreateAuthorDTO): AuthorInsert {
    return { name: dto.name, bio: dto.bio } satisfies AuthorInsert;
  }
}
```

### 5. Create Repository

```ts
// src/lib/server/repositories/authors.repository.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { AuthorMapper } from '$domain/mappers/author.mapper';
import type { Author, AuthorInsert } from '$domain/models/author';
import type { Database } from '$domain/types/database.types';

export class AuthorsRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll(): Promise<Author[]> {
    const { data, error } = await this.supabase.from('authors').select('*');
    if (error) throw error;
    return data.map(AuthorMapper.fromEntityToAuthor);
  }

  async create(author: AuthorInsert): Promise<Author> {
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

### 6. Create Service

```ts
// src/lib/server/services/authors.service.ts
import { AuthorMapper } from '$domain/mappers/author.mapper';
import type { Author } from '$domain/models/author';
import type { CreateAuthorDTO } from '$schemas/author.schema';
import { AuthorsRepository } from '$server/repositories/authors.repository';

export class AuthorsService {
  constructor(private repository: AuthorsRepository) {}

  async getAllAuthors(): Promise<Author[]> {
    return this.repository.getAll();
  }

  async createAuthor(dto: CreateAuthorDTO): Promise<Author> {
    const entity = AuthorMapper.fromDtoToInsertEntity(dto);
    return this.repository.create(entity);
  }
}
```

### 7. Create Zod Schema

```ts
// src/lib/schemas/author.schema.ts
import { z } from 'zod';

export const authorCreateSchema = z.object({
  name: z.string().trim().min(1),
  bio: z.string().trim().optional()
});

export type CreateAuthorDTO = z.infer<typeof authorCreateSchema>;
```

### 8. Wire in hooks.server.ts

```ts
import { AuthorsRepository } from '$server/repositories/authors.repository';
import { AuthorsService } from '$server/services/authors.service';

// Inside supabaseHandle:
const authorsRepository = new AuthorsRepository(supabase);
const authorsService = new AuthorsService(authorsRepository);

event.locals.authorsRepository = authorsRepository;
event.locals.authorsService = authorsService;
```

### 9. Update app.d.ts

```ts
interface Locals {
  // ... existing
  authorsRepository: AuthorsRepository;
  authorsService: AuthorsService;
}
```

### 10. Create Route

Create `src/routes/authors/` with `+page.server.ts`, `+page.svelte`, and components following the three-layer decomposition pattern (see [Routing & Pages](./03_ROUTING-PAGES.md#page-component-pattern)).
