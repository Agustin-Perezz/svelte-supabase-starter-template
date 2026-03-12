interface PokemonListResult {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  results: PokemonListResult[];
}

export interface PokemonListItem {
  id: number;
  name: string;
  spriteUrl: string;
}

export function isPokemonListResponse(
  data: unknown
): data is PokemonListResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.count === 'number' &&
    Array.isArray(obj.results) &&
    obj.results.every(
      (r: unknown) =>
        typeof r === 'object' &&
        r !== null &&
        typeof (r as Record<string, unknown>).name === 'string' &&
        typeof (r as Record<string, unknown>).url === 'string'
    )
  );
}
