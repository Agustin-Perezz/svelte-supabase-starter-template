import { POKEAPI_URL, SPRITE_BASE_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types.js';
import {
  isPokemonListResponse,
  type PokemonListItem
} from './types/pokemon.js';

export const prerender = false;

function extractIdFromUrl(url: string): number {
  const segments = url.replace(/\/$/, '').split('/');
  return Number(segments[segments.length - 1]);
}

export const load: PageServerLoad = async ({ fetch }) => {
  const response = await fetch(POKEAPI_URL);

  if (!response.ok) {
    error(502, 'Failed to fetch Pokemon data from PokéAPI');
  }

  const data: unknown = await response.json();

  if (!isPokemonListResponse(data)) {
    error(502, 'Invalid response from PokéAPI');
  }

  const pokemons: PokemonListItem[] = data.results.map((result) => {
    const id = extractIdFromUrl(result.url);
    return {
      id,
      name: result.name,
      spriteUrl: `${SPRITE_BASE_URL}/${id}.png`
    };
  });

  return { pokemons };
};
