# Architecture Overview

## Module-Based Clean Architecture

The project uses a **module-based clean architecture** where each feature lives in its own module under `src/lib/modules/`. Each module is organized into three layers:

```
src/lib/modules/
├── books/
│   ├── domain/           # Entities, repository interfaces, Zod schemas
│   ├── useCases/         # Application logic (CreateBook, GetAllBooks, etc.)
│   └── infrastructure/   # Supabase repositories, mappers
└── shared/
    ├── domain/           # Cross-cutting types (database types)
    └── infrastructure/   # Cross-cutting infrastructure (auth)
```

### Layered Architecture

```mermaid
graph TB
    subgraph Routes["Routes (src/routes/)"]
        Page["+page.server.ts — Load functions & Form Actions"]
    end

    subgraph UseCases["Use Cases (modules/{feature}/useCases/)"]
        UC["Application logic, DTO validation, orchestration"]
    end

    subgraph Domain["Domain (modules/{feature}/domain/)"]
        Entities["Entity types (Book, BookInsert, BookUpdate)"]
        Interfaces["Repository interfaces (IBookRepository)"]
        Schemas["Zod schemas (BookSchemas)"]
    end

    subgraph Infra["Infrastructure (modules/{feature}/infrastructure/)"]
        Repo["Supabase repositories"]
        Mapper["Mappers (DTO ↔ Entity ↔ DB Row)"]
    end

    subgraph DB["Supabase (Postgres + RLS)"]
    end

    Page --> UC
    UC --> Entities
    UC --> Interfaces
    UC --> Repo
    Repo --> Interfaces
    Repo --> Mapper
    Repo --> DB
    Mapper --> Entities
```

### Layer Responsibilities

| Layer              | Location                            | Responsibility                                           |
| ------------------ | ----------------------------------- | -------------------------------------------------------- |
| **Domain**         | `modules/{feature}/domain/`         | Entity types, repository interfaces, Zod schemas         |
| **Use Cases**      | `modules/{feature}/useCases/`       | Application logic, orchestrates repositories and mappers |
| **Infrastructure** | `modules/{feature}/infrastructure/` | Supabase repositories, mappers, external integrations    |
| **Shared Domain**  | `modules/shared/domain/`            | Cross-cutting types (database types)                     |
| **Shared Infra**   | `modules/shared/infrastructure/`    | Cross-cutting infrastructure (auth)                      |
| **Route**          | `src/routes/`                       | SvelteKit load functions and form actions                |
| **Components**     | `src/lib/components/ui/`            | Reusable UI primitives (shadcn-svelte pattern)           |

### Dependency Flow

```mermaid
flowchart LR
    A["+page.server.ts"] --> B["Use Case"]
    B --> C["Repository Interface"]
    C -.->|"implemented by"| D["Supabase Repository"]
    D --> E["Supabase"]
    B -.->|"uses"| F["Mapper"]
    D -.->|"uses"| F
    F -.->|"transforms"| G["Domain Entities"]
```

**Rules:**

- Use Cases NEVER import `@supabase/supabase-js` or `@supabase/ssr`
- Repositories are the ONLY layer allowed to call Supabase methods
- Repository interfaces live in `domain/` — concrete implementations in `infrastructure/`
- Mappers are the ONLY place where DB row types and domain entity types coexist
- Routes NEVER instantiate clients, repositories, or use cases directly

## Dependency Injection

The Supabase client is created **per-request** in `hooks.server.ts` and attached to `event.locals`. Repositories and use cases are instantiated where needed (typically in `+page.server.ts`), receiving the Supabase client via constructor:

```
hooks.server.ts
  └─ createServerClient() → event.locals.supabase

+page.server.ts
  └─ new SupabaseBookRepository(locals.supabase)
      └─ new CreateBook(repository)
```

Route handlers instantiate use cases with the repository:

```ts
// +page.server.ts
export const load: PageServerLoad = async ({ locals }) => {
  const repository = new SupabaseBookRepository(locals.supabase);
  const getAllBooks = new GetAllBooks(repository);
  const books = await getAllBooks.execute();
  return { books };
};
```

## Request Flow Example: Create a Book

```mermaid
sequenceDiagram
    participant Browser
    participant Route as +page.server.ts
    participant UC as CreateBook
    participant Mapper as BookMapper
    participant Repo as SupabaseBookRepository
    participant Supabase

    Browser->>Route: POST /books?/create
    Route->>Route: Validate with Zod schema
    Route->>UC: execute(dto)
    UC->>Mapper: fromDtoToInsertEntity(dto)
    Mapper-->>UC: BookEntityInsert
    UC->>Repo: create(entity)
    Repo->>Supabase: INSERT via query builder
    Supabase-->>Repo: Return row
    Repo->>Mapper: fromEntityToBook(row)
    Mapper-->>Repo: Book entity
    Repo-->>UC: Book
    UC-->>Route: Book
    Route-->>Browser: Updated page
```

## Page Decomposition Pattern

Every page follows a three-layer decomposition. See [Routing & Pages](./03_ROUTING-PAGES.md#page-component-pattern) for the full pattern with code examples.
