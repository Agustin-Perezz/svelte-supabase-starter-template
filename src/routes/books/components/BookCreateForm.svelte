<script lang="ts">
  import { FormField } from '$components/ui/form-field';
  import { bookCreateSchema } from '$schemas/book.schema';
  import {
    superForm,
    type Infer,
    type SuperValidated
  } from 'sveltekit-superforms';
  import { zod4Client as zodClient } from 'sveltekit-superforms/adapters';

  let {
    createForm
  }: { createForm: SuperValidated<Infer<typeof bookCreateSchema>> } = $props();

  const { form, errors, message, enhance } = superForm(createForm, {
    validators: zodClient(bookCreateSchema),
    resetForm: true
  });
</script>

<form
  method="POST"
  action="?/create"
  use:enhance
  class="mb-8 flex flex-col gap-4"
>
  {#if $message}
    <p class="rounded bg-red-100 p-3 text-red-700">{$message}</p>
  {/if}

  <div class="flex gap-2">
    <FormField
      label="Title"
      name="title"
      placeholder="Title"
      bind:value={$form.title}
      error={$errors.title}
    />
    <FormField
      label="Author"
      name="author"
      placeholder="Author"
      bind:value={$form.author}
      error={$errors.author}
    />
    <button
      type="submit"
      class="self-end rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      Add
    </button>
  </div>
</form>
