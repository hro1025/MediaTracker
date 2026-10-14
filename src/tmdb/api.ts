import {
  Episode,
  MovieDetails,
  SearchResult,
  TvDetails,
} from '../domain/types';
import { tmdbGet } from './client';
import {
  mapMovieDetails,
  mapSearchResults,
  mapSeason,
  mapTvDetails,
} from './map';
import {
  TmdbMovieDetails,
  TmdbSearchResponse,
  TmdbSeasonDetails,
  TmdbTvDetails,
} from './types';

export async function searchTitles(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (trimmed === '') {
    return [];
  }
  const raw = await tmdbGet('/search/multi', { query: trimmed });
  return mapSearchResults(raw as TmdbSearchResponse);
}

export async function getTvDetails(tmdbId: number): Promise<TvDetails> {
  const raw = await tmdbGet(`/tv/${tmdbId}`);
  return mapTvDetails(raw as TmdbTvDetails);
}

export async function getSeason(
  tmdbId: number,
  seasonNumber: number,
): Promise<Episode[]> {
  const raw = await tmdbGet(`/tv/${tmdbId}/season/${seasonNumber}`);
  return mapSeason(raw as TmdbSeasonDetails);
}

export async function getMovieDetails(tmdbId: number): Promise<MovieDetails> {
  const raw = await tmdbGet(`/movie/${tmdbId}`);
  return mapMovieDetails(raw as TmdbMovieDetails);
}
