---
globs:
  - 'src/**/*.ts'
  - 'src/**/*.svelte.ts'
  - 'src/**/*.svelte'
---

# Coding Conventions

## No Inline Returns in `if` Statements

Always use braces for `if` statements — never place `return` on the same line as the condition.

```ts
// BAD — inline return
if (!query) return this.books;

// GOOD — explicit block
if (!query) {
  return this.books;
}
```

## No Duplicated Utility Functions

Never duplicate helper/utility functions across files. If a function is used in more than one place, extract it into a shared utility module in `$lib/utils/` and import it where needed.

```ts
// BAD — same buildHref function in multiple files
// file-a.svelte.ts
function buildHref(params: Record<string, string>) { ... }
// file-b.svelte.ts
function buildHref(params: Record<string, string>) { ... }

// GOOD — single source of truth
// $lib/utils/url.ts
export function buildHref(params: Record<string, string>) { ... }
```
