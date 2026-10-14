import searchMatrixJson from '../__fixtures__/search-matrix.json';
import tv1396Json from '../__fixtures__/tv-1396.json';
import tv1396Season1Json from '../__fixtures__/tv-1396-season-1.json';
import movie603Json from '../__fixtures__/movie-603.json';
import {
  TmdbMovieDetails,
  TmdbSearchResponse,
  TmdbSeasonDetails,
  TmdbTvDetails,
} from '../types';
import {
  mapMovieDetails,
  mapSearchResults,
  mapSeason,
  mapTvDetails,
} from '../map';

const searchMatrix = searchMatrixJson as TmdbSearchResponse;
const tv1396 = tv1396Json as TmdbTvDetails;
const tv1396Season1 = tv1396Season1Json as TmdbSeasonDetails;
const movie603 = movie603Json as TmdbMovieDetails;

describe('mapSearchResults', () => {
  test('keeps only movies and series', () => {
    const results = mapSearchResults(searchMatrix);
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      expect(['movie', 'tv']).toContain(result.mediaType);
    }
  });

  test('maps The Matrix with its name and year', () => {
    const results = mapSearchResults(searchMatrix);
    const matrix = results.find(r => r.tmdbId === 603);
    expect(matrix?.mediaType).toBe('movie');
    expect(matrix?.name).toBe('The Matrix');
    expect(matrix?.year).toBe('1999');
  });
});

describe('mapMovieDetails', () => {
  test('maps the name and runtime of The Matrix', () => {
    const movie = mapMovieDetails(movie603);
    expect(movie.name).toBe('The Matrix');
    expect(movie.runtimeMinutes).toBe(136);
  });
});

describe('mapTvDetails', () => {
  test('maps Breaking Bad without the specials season', () => {
    const show = mapTvDetails(tv1396);
    expect(show.name).toBe('Breaking Bad');
    expect(show.seasons).toHaveLength(5);
    expect(show.seasons[0]?.seasonNumber).toBe(1);
    expect(show.seasons[0]?.episodeCount).toBe(7);
  });

  test('counts 62 episodes and has no next episode', () => {
    const show = mapTvDetails(tv1396);
    expect(show.totalEpisodes).toBe(62);
    expect(show.nextEpisode).toBeNull();
  });
});

describe('mapSeason', () => {
  test('maps the 7 episodes of season 1', () => {
    const episodes = mapSeason(tv1396Season1);
    expect(episodes).toHaveLength(7);
    expect(episodes[0]?.episodeNumber).toBe(1);
    expect(episodes[0]?.name).toBe('Pilot');
  });
});
