export type PosterSize = 'w185' | 'w342' | 'w500';

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function posterUrl(
  posterPath: string | null,
  size: PosterSize,
): string | null {
  if (posterPath === null) {
    return null;
  }
  return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}
