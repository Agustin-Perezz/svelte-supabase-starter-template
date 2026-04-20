<script lang="ts">
  import { CircleCheck, Loader2 } from '@lucide/svelte';
  import { Button } from '$components/ui/button';
  import { FormField } from '$components/ui/form-field';
  import { magicLinkSchema } from '$modules/auth/domain/AuthSchemas';
  import { superForm } from 'sveltekit-superforms';
  import { zod4Client as zodClient } from 'sveltekit-superforms/adapters';

  export let form;

  const {
    form: formData,
    enhance,
    message,
    submitting,
    errors
  } = superForm(form, {
    validators: zodClient(magicLinkSchema)
  });
</script>

<form method="POST" action="?/magic" use:enhance class="space-y-4">
  {#if $message}
    <div
      class="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
    >
      <CircleCheck class="mt-0.5 h-4 w-4 shrink-0" />
      {$message}
    </div>
  {/if}

  <FormField
    label="Correo electrónico"
    name="email"
    placeholder="vos@ejemplo.com"
    type="email"
    data-testid="email-input"
    bind:value={$formData.email}
    error={$errors.email ? String($errors.email) : undefined}
  />

  <Button
    type="submit"
    disabled={$submitting}
    class="w-full gap-2"
    data-testid="magic-link-submit"
  >
    {#if $submitting}
      <Loader2 class="h-4 w-4 animate-spin" />
      Enviando...
    {:else}
      Enviar Magic Link
    {/if}
  </Button>
</form>
