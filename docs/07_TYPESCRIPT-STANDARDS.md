# TypeScript Standards

This document covers TypeScript conventions enforced in this project.

## `satisfies` Operator

Use `satisfies` to validate an object matches a type while retaining the most specific inferred type:

```ts
const config = {
  width: 100,
  height: 200
} satisfies Dimensions;
```

## Type Guards

Use type predicates for runtime type narrowing:

```ts
function isAdmin(user: User): user is Admin {
  return user.role === 'admin';
}

function assertString(val: unknown): asserts val is string {
  if (typeof val !== 'string') {
    throw new Error('Expected string');
  }
}
```

## Utility Types

Prefer built-in utilities to keep types DRY:

```ts
type BookSummary = Pick<Book, 'id' | 'title'>;
type BookWithoutAuthor = Omit<Book, 'author'>;
type ButtonHandler = ReturnType<typeof createHandler>;
type InputProps = ComponentProps<typeof Input>;
```

## Strict Rules

- **`any` is forbidden** — Use `unknown` with type guards when the type is truly uncertain
- **Use `satisfies`** instead of explicit type annotations when you need both validation and inference
- **No magic strings** — Never inline raw string literals for finite named sets; always use an `enum`

## Coding Conventions

### No Inline Returns in `if` Statements

```ts
// BAD
if (!query) return this.books;

// GOOD
if (!query) {
  return this.books;
}
```

### No Duplicated Utility Functions

If a helper function exists in more than one file, extract it into `$lib/utils/` and import it. There must be a single source of truth for every utility.
