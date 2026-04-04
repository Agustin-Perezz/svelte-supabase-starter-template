# Architecture Overview

### Layered Architecture

```mermaid
graph TB
    subgraph Routes["Routes (src/routes/)"]
        Page["+page.server.ts — Load functions & Form Actions"]
    end

    subgraph Services["Services (src/lib/server/services/)"]
        Svc["Business logic, orchestration, DTO validation"]
    end

    subgraph Repos["Repositories (src/lib/server/repositories/)"]
        Repo["Data access — wraps Supabase query builder"]
    end

    subgraph Mappers["Mappers (src/lib/domain/mappers/)"]
        Map["Shape transformations (DTO ↔ Entity ↔ Domain)"]
    end

    subgraph Domain["Domain (src/lib/domain/)"]
        Types["Type definitions, models derived from DB types"]
    end

    subgraph DB["Supabase (Postgres + RLS)"]
    end

    Page --> Svc
    Svc --> Repo
    Repo --> Map
    Map --> Types
    Repo --> DB
    Map --> DB
```

### Layer Responsibilities

| Layer          | Location                       | Responsibility                                                |
| -------------- | ------------------------------ | ------------------------------------------------------------- |
| **Domain**     | `src/lib/domain/`              | Type definitions, models, mappers — no framework dependencies |
| **Schemas**    | `src/lib/schemas/`             | Zod validation schemas for form input                         |
| **Repository** | `src/lib/server/repositories/` | Data access — ONLY layer that touches SupabaseClient          |
| **Service**    | `src/lib/server/services/`     | Business logic and orchestration                              |
| **Route**      | `src/routes/`                  | SvelteKit load functions and form actions                     |
| **Components** | `src/lib/components/ui/`       | Reusable UI primitives (shadcn-svelte pattern)                |

### Dependency Flow

```mermaid
flowchart LR
    A["+page.server.ts"] --> B["Service"]
    B --> C["Repository"]
    C --> D["Supabase"]
    B -.->|"uses"| E["Mapper"]
    C -.->|"uses"| E
    E -.->|"transforms"| F["Domain Types"]
    D -.->|"returns"| E
```

**Rules:**

- Services NEVER import `@supabase/supabase-js` or `@supabase/ssr`
- Repositories are the ONLY layer allowed to call Supabase methods
- Mappers are the ONLY place where DB row types and domain model types coexist
- Routes NEVER instantiate clients, repositories, or services directly

## Dependency Injection

All dependencies are instantiated **per-request** in `hooks.server.ts` and injected through `event.locals`:

```
hooks.server.ts
  └─ createServerClient()          → event.locals.supabase
      └─ new BooksRepository(supabase)  → event.locals.booksRepository
          └─ new BooksService(repository)  → event.locals.booksService
```

Route handlers access services directly from `locals`:

```ts
// +page.server.ts
export const load: PageServerLoad = async ({ locals }) => {
  const books = await locals.booksRepository.getAll();
  return { books };
};
```

## Request Flow Example: Create a Book

```mermaid
sequenceDiagram
    participant Browser
    participant Route as +page.server.ts
    participant Service as BooksService
    participant Mapper as BookMapper
    participant Repo as BooksRepository
    participant Supabase

    Browser->>Route: POST /books?/create
    Route->>Route: Validate with Zod schema
    Route->>Service: createBook(dto)
    Service->>Mapper: fromDtoToInsertEntity(dto)
    Mapper-->>Service: Insert entity
    Service->>Repo: create(entity)
    Repo->>Supabase: INSERT via query builder
    Supabase-->>Repo: Return row
    Repo->>Mapper: fromEntityToBook(row)
    Mapper-->>Repo: Book domain model
    Repo-->>Service: Book
    Service-->>Route: Book
    Route-->>Browser: Updated page
```

## Page Decomposition Pattern

Every page follows a three-layer decomposition. See [Routing & Pages](./03_ROUTING-PAGES.md#page-component-pattern) for the full pattern with code examples.
