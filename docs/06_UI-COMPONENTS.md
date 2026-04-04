# UI Components

This project uses a shadcn-svelte component architecture built on Bits UI (headless primitives), Tailwind CSS v4, and Tailwind Variants for variant composition.

## Component Structure

All UI components follow the shadcn-svelte pattern:

```
src/lib/components/ui/
├── button/
│   ├── button.svelte    # Implementation
│   └── index.ts         # Barrel export
├── card/
│   ├── card.svelte
│   ├── card-action.svelte
│   ├── card-content.svelte
│   ├── card-description.svelte
│   ├── card-footer.svelte
│   ├── card-header.svelte
│   ├── card-title.svelte
│   └── index.ts
├── form-field/
│   ├── form-field.svelte
│   └── index.ts
├── input/
│   ├── input.svelte
│   └── index.ts
└── label/
    ├── label.svelte
    └── index.ts
```

### Barrel Export Convention

Each `index.ts` exports both `Root` and a named alias:

```ts
export { default as Root } from './button.svelte';
export { default as Button } from './button.svelte';
```

This supports both import styles:

```ts
import { Button, Root } from '$components/ui/button';
```

## Available Components

### Button

Variants and sizes powered by `tailwind-variants`:

| Variant       | Use Case                               |
| ------------- | -------------------------------------- |
| `default`     | Primary actions                        |
| `destructive` | Danger actions (delete, remove)        |
| `outline`     | Secondary actions with border          |
| `secondary`   | Less prominent actions                 |
| `ghost`       | Minimal styling, hover-only background |
| `link`        | Text-only, looks like a link           |

| Size      | Use Case                   |
| --------- | -------------------------- |
| `default` | Standard buttons           |
| `sm`      | Compact buttons            |
| `lg`      | Large, prominent buttons   |
| `icon`    | Icon-only buttons (square) |
| `icon-sm` | Small icon buttons         |
| `icon-lg` | Large icon buttons         |

**Props:**

- `variant` — Button variant (default: `default`)
- `size` — Button size (default: `default`)
- `href` — If provided, renders as `<a>` instead of `<button>`
- `ref` — Element reference for direct DOM access

### Card

Composable card components:

| Component         | Purpose                                   |
| ----------------- | ----------------------------------------- |
| `Card`            | Root container with border and background |
| `CardHeader`      | Header section with grid layout           |
| `CardTitle`       | Card heading (larger, semibold)           |
| `CardDescription` | Subtitle text (muted, smaller)            |
| `CardContent`     | Main content area                         |
| `CardFooter`      | Bottom section with flex layout           |
| `CardAction`      | Action area in header (right-aligned)     |

### Input

Wraps native `<input>` with Tailwind styling:

- Supports all native input types including `file`
- Two-way binding via `$bindable()` for `value` and `ref`
- Handles `bind:files` specially for file inputs

### Label

Wraps Bits UI `LabelPrimitive.Root`:

- Disabled and peer-disabled state styling
- Accessible label association with form controls

### Form Field

Custom composite component (not from shadcn-svelte):

**Props:**

- `label` — Display label text
- `name` — Input name attribute
- `type` — Input type (default: `text`)
- `value` — Input value (two-way bindable)
- `error` — Error string or string array

**Features:**

- Combines Label + Input + error display
- Automatically derives `hasError` from error prop
- Shows first error message in red text
- Sets `aria-invalid` and `aria-describedby` for accessibility
- Designed to work with `sveltekit-superforms` validation errors

```svelte
<FormField
  label="Title"
  name="title"
  type="text"
  value={$formData.title}
  error={$errors.title}
/>
```

## Styling System

### Tailwind CSS v4

Uses the Vite plugin for Tailwind v4:

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()]
});
```

### Design Tokens

CSS custom properties in `src/app.css` define the shadcn-svelte theme using OKLCH color space:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... more tokens */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... maps to Tailwind utilities */
}
```

## Svelte 5 Patterns

All components use Svelte 5 Runes:

### Props

```ts
interface Props {
  variant?: ButtonVariants;
  size?: ButtonSizes;
  ref?: HTMLButtonElement | null;
}

let { variant, size, ref, children }: Props = $props();
```

### Two-Way Binding

```ts
interface Props {
  value?: string;
  ref?: HTMLInputElement | null;
}

let { value = $bindable(), ref }: Props = $props();
```

### Snippets (Slot Replacement)

```svelte
{@render children?.()}
```

## Toast Notifications

Toast notifications use `svelte-french-toast`:

```ts
// src/lib/alerts/toast.ts
import toast from 'svelte-french-toast';

export function successToast(message: string) {
  return toast.success(message, { duration: 3000, position: 'bottom-right' });
}

export function errorToast(message: string) {
  return toast.error(message, { duration: 3000, position: 'bottom-right' });
}
```

The `<Toaster />` component is rendered in the root layout.

## Adding New Components

When adding a new UI component:

1. Create directory under `src/lib/components/ui/{component-name}/`
2. Create `{component-name}.svelte` with implementation
3. Create `index.ts` with barrel exports (`Root` and named alias)
4. Use `tailwind-variants` for variant styling if needed
5. Use `cn()` for class merging
6. Support `ref` prop via `WithElementRef` utility type
7. Follow Svelte 5 patterns (`$props()`, `$bindable()`, `{@render}`)

Always prefer shadcn-svelte UI components over native HTML elements. Never use raw HTML form elements when a shadcn equivalent exists.
