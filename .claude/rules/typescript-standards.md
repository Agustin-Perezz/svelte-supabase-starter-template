---
globs:
  - 'src/**/*.ts'
  - 'src/**/*.svelte.ts'
---

# TypeScript Standards

## `satisfies` Operator

Use `satisfies` to validate an object matches a type while retaining the most specific inferred type.

```ts
const config = {
  endpoint: '/api/v1',
  retries: 3
} satisfies Record<string, string | number>;
```

## Type Guards & Assertion Functions

```ts
function isAdmin(user: User): user is Admin {
  return (user as Admin).role === Role.Admin;
}

function assertIsString(val: unknown): asserts val is string {
  if (typeof val !== 'string') {
    throw new Error('Not a string');
  }
}
```

## Utility Types

Prefer built-in utilities to keep types DRY:

- `Pick<T, K>` / `Omit<T, K>` — narrow down props
- `ReturnType<T>` — capture the output type of a function
- `ComponentProps<T>` — extract props from a Svelte component for wrapping

## Strict Rules

- `any` is forbidden. Use `unknown` with type guards when the type is truly uncertain.
- Use `satisfies` instead of explicit type annotations when you need both validation and inference.
- No magic strings: never inline raw string literals for finite named sets; always use an `enum`.
