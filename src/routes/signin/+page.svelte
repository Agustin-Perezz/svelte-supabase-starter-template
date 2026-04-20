<script lang="ts">
  import { User } from '@lucide/svelte';
  import { Card } from '$components/ui/card';

  import MagicLinkForm from './components/MagicLinkForm.svelte';
  import OAuthButtons from './components/OAuthButtons.svelte';

  export let data;
</script>

<div
  class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4"
>
  <div class="w-full max-w-md">
    <div class="mb-8 text-center">
      <div
        class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black shadow-lg"
      >
        <User class="h-7 w-7 text-white" />
      </div>
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">
        Bienvenido
      </h1>
      <p class="mt-2 text-sm text-gray-500">Iniciá sesión para continuar</p>
    </div>

    <Card class="shadow-md">
      <div class="space-y-6 p-8">
        <MagicLinkForm form={data.form} />

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-white px-3 tracking-wider text-gray-400"
              >O continuá con</span
            >
          </div>
        </div>

        <OAuthButtons />
      </div>
    </Card>

    <p class="mt-6 text-center text-xs text-gray-400">
      Al continuar, aceptás nuestros términos y política de privacidad.
    </p>
  </div>
</div>
