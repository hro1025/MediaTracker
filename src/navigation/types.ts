import { MediaType } from '../domain/types';

export type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  Details: { mediaType: MediaType; tmdbId: number };
  About: undefined;
};
