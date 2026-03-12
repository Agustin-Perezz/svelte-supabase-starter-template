<script lang="ts">
  import PokemonCard from './PokemonCard.svelte';
  import type { PokemonListItem } from '../types/pokemon.js';

  let {
    pokemons,
    formatPokemonId
  }: { pokemons: PokemonListItem[]; formatPokemonId: (id: number) => string } =
    $props();
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {#each pokemons as pokemon (pokemon.id)}
    <PokemonCard
      id={formatPokemonId(pokemon.id)}
      name={pokemon.name}
      spriteUrl={pokemon.spriteUrl}
    />
  {/each}
</div>
