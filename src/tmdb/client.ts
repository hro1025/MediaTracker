import { TMDB_READ_TOKEN } from '../config/secrets';

export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export class TmdbError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`TMDB request failed with status ${status}`);
    this.name = 'TmdbError';
    this.status = status;
    // Keeps `instanceof TmdbError` working after Babel compiles the class.
    Object.setPrototypeOf(this, TmdbError.prototype);
  }
}

export async function tmdbGet(
  path: string,
  params: Record<string, string> = {},
): Promise<unknown> {
  const query = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&');
  const url =
    query === ''
      ? `${TMDB_BASE_URL}${path}`
      : `${TMDB_BASE_URL}${path}?${query}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TMDB_READ_TOKEN}`,
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new TmdbError(response.status);
  }

  return await response.json();
}
