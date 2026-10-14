import {
  Episode,
  MovieDetails,
  SearchResult,
  SeasonSummary,
  TvDetails,
} from '../domain/types';
import {
  TmdbMovieDetails,
  TmdbSearchResponse,
  TmdbSeasonDetails,
  TmdbTvDetails,
} from './types';

function dateHelper(date: string | undefined): string | null {
  if (!date) {
    return null;
  }
  return date.slice(0, 4);
}
export function mapSearchResults(raw: TmdbSearchResponse): SearchResult[] {
  const results: SearchResult[] = [];
  for (const item of raw.results) {
    if (item.media_type === 'person') {
      continue;
    }
    if (item.media_type === 'movie') {
      results.push({
        tmdbId: item.id,
        mediaType: 'movie',
        name: item.title,
        year: dateHelper(item.release_date),
        posterPath: item.poster_path,
      });
      continue;
    }
    if (item.media_type === 'tv') {
      results.push({
        tmdbId: item.id,
        mediaType: 'tv',
        name: item.name,
        year: dateHelper(item.first_air_date),
        posterPath: item.poster_path,
      });
    }
  }
  return results;
}
export function mapMovieDetails(raw: TmdbMovieDetails): MovieDetails {
  return {
    tmdbId: raw.id,
    name: raw.title,
    posterPath: raw.poster_path,
    overview: raw.overview,
    runtimeMinutes: raw.runtime,
    releaseDate: raw.release_date,
  };
}
export function mapTvDetails(raw: TmdbTvDetails): TvDetails {
  const seasons: SeasonSummary[] = [];
  let totalEpisodes = 0;

  for (const season of raw.seasons) {
    if (season.season_number === 0) {
      continue;
    }
    seasons.push({
      seasonNumber: season.season_number,
      name: season.name,
      episodeCount: season.episode_count,
    });
    totalEpisodes += season.episode_count;
  }

  const next = raw.next_episode_to_air;
  const nextEpisode =
    next === null
      ? null
      : {
          seasonNumber: next.season_number,
          episodeNumber: next.episode_number,
          airDate: next.air_date,
        };

  return {
    tmdbId: raw.id,
    name: raw.name,
    posterPath: raw.poster_path,
    overview: raw.overview,
    seasons,
    totalEpisodes,
    nextEpisode,
  };
}
export function mapSeason(raw: TmdbSeasonDetails): Episode[] {
  const episodes: Episode[] = [];
  for (const episode of raw.episodes) {
    episodes.push({
      seasonNumber: episode.season_number,
      episodeNumber: episode.episode_number,
      name: episode.name,
      airDate: episode.air_date || null,
    });
  }
  return episodes;
}
