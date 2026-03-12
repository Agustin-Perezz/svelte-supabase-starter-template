<script lang="ts">
  let { hasSearchQuery }: { hasSearchQuery: boolean } = $props();
</script>

<div
  class="text-muted-foreground flex flex-col items-center gap-2 py-16 text-center"
>
  {#if hasSearchQuery}
    <p class="text-lg font-medium">No Pokémon found</p>
    <p class="text-sm">Try a different search term.</p>
  {:else}
    <p class="text-lg font-medium">No Pokémon available</p>
    <p class="text-sm">Something went wrong loading the Pokémon list.</p>
  {/if}
</div>
