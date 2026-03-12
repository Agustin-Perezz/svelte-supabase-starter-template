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
if (!query) return this.pokemons;

// GOOD — explicit block
if (!query) {
  return this.pokemons;
}
```
