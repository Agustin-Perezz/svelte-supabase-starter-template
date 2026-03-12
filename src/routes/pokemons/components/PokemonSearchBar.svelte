<script lang="ts">
  import { Input } from '$lib/components/ui/input/index.js';

  let { value = $bindable() }: { value: string } = $props();
</script>

<div class="w-full max-w-md">
  <Input type="search" placeholder="Search Pokémon by name…" bind:value />
</div>
