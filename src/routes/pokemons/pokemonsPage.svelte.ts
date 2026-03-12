import type { PokemonListItem } from './types/pokemon.js';

export class PokemonsPageState {
  searchQuery = $state('');
  private pokemons: PokemonListItem[];

  filteredPokemons = $derived.by(() => {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      return this.pokemons;
    }
    return this.pokemons.filter((p) => p.name.includes(query));
  });

  isEmpty = $derived(this.filteredPokemons.length === 0);
  hasSearchQuery = $derived(this.searchQuery.trim().length > 0);

  constructor(pokemons: PokemonListItem[]) {
    this.pokemons = pokemons;
  }

  formatPokemonId(id: number): string {
    return `#${String(id).padStart(3, '0')}`;
  }
}
