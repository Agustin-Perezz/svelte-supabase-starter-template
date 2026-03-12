<script lang="ts">
  import PokemonEmptyState from './components/PokemonEmptyState.svelte';
  import PokemonGrid from './components/PokemonGrid.svelte';
  import PokemonSearchBar from './components/PokemonSearchBar.svelte';
  import { PokemonsPageState } from './pokemonsPage.svelte.js';

  const { data } = $props();
  const pageState = $derived(new PokemonsPageState(data.pokemons));
</script>

<div class="container mx-auto flex flex-col items-center gap-8 px-4 py-8">
  <h1 class="text-3xl font-bold">Gen 1 Pokémon</h1>

  <PokemonSearchBar bind:value={pageState.searchQuery} />

  {#if pageState.isEmpty}
    <PokemonEmptyState hasSearchQuery={pageState.hasSearchQuery} />
  {:else}
    <PokemonGrid
      pokemons={pageState.filteredPokemons}
      formatPokemonId={pageState.formatPokemonId.bind(pageState)}
    />
  {/if}
</div>
