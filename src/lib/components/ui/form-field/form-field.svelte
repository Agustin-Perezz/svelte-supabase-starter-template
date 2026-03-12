<script lang="ts" module>
  import type {
    HTMLInputAttributes,
    HTMLInputTypeAttribute
  } from 'svelte/elements';

  import type { WithElementRef } from '$lib/utils.js';

  type InputType = Exclude<HTMLInputTypeAttribute, 'file'>;

  export type FormFieldProps = WithElementRef<
    Omit<HTMLInputAttributes, 'type' | 'files'>
  > & {
    label: string;
    name: string;
    type?: InputType;
    error?: string | string[] | null;
  };
</script>

<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { cn } from '$lib/utils.js';

  let {
    ref = $bindable(null),
    value = $bindable(),
    label,
    name,
    type = 'text',
    error,
    class: className,
    ...restProps
  }: FormFieldProps = $props();

  const errorMessage = $derived(Array.isArray(error) ? error[0] : error);
  const hasError = $derived(!!errorMessage);
</script>

<div class={cn('grid gap-2', className)}>
  <Label for={name}>{label}</Label>
  <Input
    bind:ref
    bind:value
    {type}
    id={name}
    {name}
    aria-invalid={hasError}
    aria-describedby={hasError ? `${name}-error` : undefined}
    {...restProps}
  />
  {#if hasError}
    <p id="{name}-error" class="text-destructive text-sm">{errorMessage}</p>
  {/if}
</div>
