# TypeScript Standards

## `satisfies` Operator

Use `satisfies` to validate an object matches a type while retaining the most specific inferred type:

```ts
const config = { width: 100, height: 200 } satisfies Dimensions;
```

## Type Guards

```ts
function isAdmin(user: User): user is Admin {
  return user.role === 'admin';
}

function assertString(val: unknown): asserts val is string {
  if (typeof val !== 'string') throw new Error('Expected string');
}
```

## Utility Types

Prefer built-in utilities to keep types DRY:

```ts
type BookSummary = Pick<Book, 'id' | 'title'>;
type BookWithoutAuthor = Omit<Book, 'author'>;
type ButtonHandler = ReturnType<typeof createHandler>;
```

## Strict Rules

- **`any` is forbidden** — use `unknown` with type guards
- **Use `satisfies`** instead of explicit annotations when you need both validation and inference
- **No magic strings** — model finite named sets as a TypeScript `enum` in `src/lib/modules/shared/constants/`. Prefer `enum` over `as const` object maps; pair with derived `readonly` arrays for subsets:

  ```ts
  export enum OrderStatus {
    Pending = 'pending',
    Preparing = 'preparing',
    OutForDelivery = 'out_for_delivery',
    Delivered = 'delivered'
  }

  export const ACTIVE_ORDER_STATUSES: readonly OrderStatus[] = [
    OrderStatus.Pending,
    OrderStatus.Preparing,
    OrderStatus.OutForDelivery
  ];
  ```

## Coding Conventions

Always use braces for `if` statements:

```ts
// BAD
if (!query) return this.books;

// GOOD
if (!query) {
  return this.books;
}
```

If a utility function exists in more than one file, extract it to `$lib/utils/` and import from there.
