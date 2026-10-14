import type { LoadedDetails, NewTitle, Status } from './types';

export function toNewTitle(loaded: LoadedDetails, status: Status): NewTitle {
  switch (loaded.mediaType) {
    case 'tv':
      return {
        tmdbId: loaded.details.tmdbId,
        mediaType: 'tv',
        name: loaded.details.name,
        posterPath: loaded.details.posterPath,
        totalEpisodes: loaded.details.totalEpisodes,
        status,
      };
    case 'movie':
      return {
        tmdbId: loaded.details.tmdbId,
        mediaType: 'movie',
        name: loaded.details.name,
        posterPath: loaded.details.posterPath,
        totalEpisodes: 1,
        status,
      };
  }
}
