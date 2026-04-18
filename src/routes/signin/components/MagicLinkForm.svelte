<script lang="ts">
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
      <svg
        class="mt-0.5 h-4 w-4 shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
      </svg>
      {$message}
    </div>
  {/if}

  <FormField
    label="Correo electrónico"
    name="email"
    placeholder="vos@ejemplo.com"
    type="email"
    bind:value={$formData.email}
    error={$errors.email ? String($errors.email) : undefined}
  />

  <Button type="submit" disabled={$submitting} class="w-full gap-2">
    {#if $submitting}
      <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        ></path>
      </svg>
      Enviando...
    {:else}
      Enviar Magic Link
    {/if}
  </Button>
</form>
