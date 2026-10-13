export type TmdbSearchResponse = {
  page: number;
  results: TmdbSearchItem[];
  total_pages: number;
  total_results: number;
};

export type TmdbSearchItem = TmdbSearchMovie | TmdbSearchTv | TmdbSearchPerson;

export type TmdbSearchMovie = {
  id: number;
  title: string;
  release_date?: string;
  poster_path: string | null;
  media_type: 'movie';
};

export type TmdbSearchTv = {
  id: number;
  name: string;
  first_air_date?: string;
  poster_path: string | null;
  media_type: 'tv';
};

export type TmdbSearchPerson = {
  id: number;
  name: string;
  media_type: 'person';
};

export type TmdbSeason = {
  season_number: number;
  name: string;
  episode_count: number;
};

export type TmdbNextEpisode = {
  season_number: number;
  episode_number: number;
  air_date: string;
};

export type TmdbTvDetails = {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  seasons: TmdbSeason[];
  next_episode_to_air: TmdbNextEpisode | null;
};

export type TmdbEpisode = {
  season_number: number;
  episode_number: number;
  name: string;
  air_date: string | null;
};

export type TmdbSeasonDetails = {
  season_number: number;
  episodes: TmdbEpisode[];
};

export type TmdbMovieDetails = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  runtime: number | null;
  release_date: string;
};
