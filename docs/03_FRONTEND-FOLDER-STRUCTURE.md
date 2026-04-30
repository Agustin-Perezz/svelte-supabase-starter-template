# Frontend Folder Structure

## Route Folder Pattern

Every route follows this structure:

```
src/routes/{feature}/
├── +page.svelte                  # Composition only — imports + arranges components
├── +page.server.ts               # Load functions & form actions
└── components/
    ├── {Feature}Header.svelte    # Page title, description, action buttons
    ├── {Feature}List.svelte      # Iterates items, delegates to card
    ├── {Feature}EmptyState.svelte # Empty list message/CTA
    ├── {Feature}Card.svelte       # Single item display
    ├── {Feature}CreateForm.svelte # Superform wiring + enhance
    └── {Feature}FormFields.svelte # Input fields only, no <form> tag
```

## Rules

- `+page.svelte` is composition-only: imports and arranges components, nothing else. No logic, no inline styles, no conditionals beyond prop-passing.
- `+page.server.ts` handles all server logic: load functions and form actions. See [Architecture](./01_ARCHITECTURE.md) for container and use-case wiring.
- `components/` holds every sub-component for that route. Component files are named with the feature prefix (e.g. `ProductCard`, not `Card`).

## Example

```
src/routes/productos/
├── +page.svelte
├── +page.server.ts
└── components/
    ├── ProductHeader.svelte
    ├── ProductList.svelte
    ├── ProductEmptyState.svelte
    ├── ProductCard.svelte
    ├── ProductCreateForm.svelte
    └── ProductFormFields.svelte
```

## Root Layout

The root layout renders `<Toaster />` and `{@render children()}`. No nested layouts.

## Component Limits

Each component file has a 50-line hard limit. Split proactively at 40 lines. See [Component Patterns](./02_COMPONENT-PATTERNS.md) for details.
