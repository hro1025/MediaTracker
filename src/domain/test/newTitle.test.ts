import { toNewTitle } from '../newTitle';
import { mapMovieDetails, mapTvDetails } from '../../tmdb/map';
import type { TmdbMovieDetails, TmdbTvDetails } from '../../tmdb/types';
import tvRaw from '../../tmdb/__fixtures__/tv-1396.json';
import movieRaw from '../../tmdb/__fixtures__/movie-603.json';

describe('toNewTitle', () => {
  test('a series uses its total episodes', () => {
    const tv = tvRaw as TmdbTvDetails;
    const details = mapTvDetails(tv);

    expect(toNewTitle({ mediaType: 'tv', details }, 'watching')).toEqual({
      tmdbId: 1396,
      mediaType: 'tv',
      name: 'Breaking Bad',
      posterPath: tv.poster_path,
      totalEpisodes: 62,
      status: 'watching',
    });
  });

  test('a movie counts as one episode', () => {
    const movie = movieRaw as TmdbMovieDetails;
    const details = mapMovieDetails(movie);

    expect(toNewTitle({ mediaType: 'movie', details }, 'watchlist')).toEqual({
      tmdbId: 603,
      mediaType: 'movie',
      name: 'The Matrix',
      posterPath: movie.poster_path,
      totalEpisodes: 1,
      status: 'watchlist',
    });
  });
});
