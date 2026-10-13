import { Badge, EpisodeRef, TrackedTitle } from './types';

export function progressPercent(watched: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  const percent = (watched / total) * 100;
  const rounded = Math.round(percent);
  const capped = Math.min(rounded, 100);
  return capped;
}

export function latestEpisode(
  watched: readonly EpisodeRef[],
): EpisodeRef | null {
  const firstElement = watched[0];
  if (firstElement === undefined) {
    return null;
  }
  let best = firstElement;
  for (const ep of watched) {
    const isLaterSeason = ep.seasonNumber > best.seasonNumber;
    const isSameSeason = ep.seasonNumber === best.seasonNumber;
    const isLaterEpisode = ep.episodeNumber > best.episodeNumber;

    if (isLaterSeason || (isSameSeason && isLaterEpisode)) {
      best = ep;
    }
  }
  return best;
}

export function progressLabel(latest: EpisodeRef | null): string {
  if (latest === null) {
    return 'Not started';
  }
  return `S${latest.seasonNumber} E${latest.episodeNumber}`;
}

export function progressBadge(title: TrackedTitle): Badge {
  if (title.status === 'done') {
    return { kind: 'check' };
  }
  if (title.mediaType === 'movie') {
    return { kind: 'none' };
  }
  if (title.status === 'watchlist') {
    return { kind: 'none' };
  }
  return {
    kind: 'percent',
    value: progressPercent(title.watchedCount, title.totalEpisodes),
  };
}
