export type MediaType = 'movie' | 'tv';

export type Status = 'watching' | 'done' | 'watchlist';

export type EpisodeRef = { seasonNumber: number; episodeNumber: number };

export type Episode = EpisodeRef & { name: string; airDate: string | null };

export type SeasonSummary = {
  seasonNumber: number;
  name: string;
  episodeCount: number;
};

export type TrackedTitle = {
  id: number;
  tmdbId: number;
  mediaType: MediaType;
  name: string;
  posterPath: string | null;
  totalEpisodes: number;
  watchedCount: number;
  status: Status;
  addedAt: number;
  lastWatchedAt: number | null;
};

export type SearchResult = {
  tmdbId: number;
  mediaType: MediaType;
  name: string;
  year: string | null;
  posterPath: string | null;
};

export type NextEpisode = EpisodeRef & { airDate: string };

export type TvDetails = {
  tmdbId: number;
  name: string;
  posterPath: string | null;
  overview: string;
  seasons: SeasonSummary[];
  totalEpisodes: number;
  nextEpisode: NextEpisode | null;
};

export type LoadedDetails =
  | { mediaType: 'tv'; details: TvDetails }
  | { mediaType: 'movie'; details: MovieDetails };

export type Badge =
  | { kind: 'check' }
  | { kind: 'percent'; value: number }
  | { kind: 'none' };

export type MovieDetails = {
  tmdbId: number;
  name: string;
  posterPath: string | null;
  overview: string;
  runtimeMinutes: number | null;
  releaseDate: string | null;
};

export type NewTitle = Pick<
  TrackedTitle,
  'tmdbId' | 'mediaType' | 'name' | 'posterPath' | 'totalEpisodes' | 'status'
>;
