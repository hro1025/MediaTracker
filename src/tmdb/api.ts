import type {
  Episode,
  LoadedDetails,
  MediaType,
  MovieDetails,
  SearchResult,
  TvDetails,
} from '../domain/types';
import type {
  TmdbMovieDetails,
  TmdbSearchResponse,
  TmdbSeasonDetails,
  TmdbTvDetails,
} from './types';
import { tmdbGet } from './client';
import {
  mapMovieDetails,
  mapSearchResults,
  mapSeason,
  mapTvDetails,
} from './map';
import { cached } from './cache';

const HOUR = 60 * 60 * 1000;

// ---- Search (not cached: every query is different) ----

export async function searchTitles(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (trimmed === '') {
    return [];
  }
  const raw = (await tmdbGet('/search/multi', {
    query: trimmed,
  })) as TmdbSearchResponse;
  return mapSearchResults(raw);
}

// ---- Uncached requests (only used through the cached wrappers) ----

async function fetchTvDetails(tmdbId: number): Promise<TvDetails> {
  const raw = (await tmdbGet(`/tv/${tmdbId}`)) as TmdbTvDetails;
  return mapTvDetails(raw);
}

async function fetchSeason(
  tmdbId: number,
  seasonNumber: number,
): Promise<Episode[]> {
  const raw = (await tmdbGet(
    `/tv/${tmdbId}/season/${seasonNumber}`,
  )) as TmdbSeasonDetails;
  return mapSeason(raw);
}

async function fetchMovieDetails(tmdbId: number): Promise<MovieDetails> {
  const raw = (await tmdbGet(`/movie/${tmdbId}`)) as TmdbMovieDetails;
  return mapMovieDetails(raw);
}

// ---- Cached public functions ----

export function getTvDetails(tmdbId: number): Promise<TvDetails> {
  return cached(`tv:${tmdbId}`, 6 * HOUR, () => fetchTvDetails(tmdbId));
}

export function getSeason(
  tmdbId: number,
  seasonNumber: number,
): Promise<Episode[]> {
  return cached(`season:${tmdbId}:${seasonNumber}`, 24 * HOUR, () =>
    fetchSeason(tmdbId, seasonNumber),
  );
}

export function getMovieDetails(tmdbId: number): Promise<MovieDetails> {
  return cached(`movie:${tmdbId}`, 24 * HOUR, () => fetchMovieDetails(tmdbId));
}

export async function loadDetails(
  mediaType: MediaType,
  tmdbId: number,
): Promise<LoadedDetails> {
  if (mediaType === 'tv') {
    return { mediaType: 'tv', details: await getTvDetails(tmdbId) };
  }
  return { mediaType: 'movie', details: await getMovieDetails(tmdbId) };
}
