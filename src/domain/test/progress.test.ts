import {
  latestEpisode,
  progressBadge,
  progressLabel,
  progressPercent,
} from '../progress';
import { TrackedTitle } from '../types';

function makeTitle(overrides: Partial<TrackedTitle>): TrackedTitle {
  const defaults: TrackedTitle = {
    id: 1,
    tmdbId: 1396,
    mediaType: 'tv',
    name: 'Test show',
    posterPath: null,
    totalEpisodes: 10,
    watchedCount: 0,
    status: 'watching',
    addedAt: 0,
    lastWatchedAt: null,
  };
  return { ...defaults, ...overrides };
}

describe('progressPercent', () => {
  test('returns 25 for 5 of 20 watched', () => {
    const watched = 5;
    const total = 20;
    expect(progressPercent(watched, total)).toBe(25);
  });

  test('rounds down: 1 of 3 gives 33', () => {
    const watched = 1;
    const total = 3;
    expect(progressPercent(watched, total)).toBe(33);
  });

  test('rounds up: 2 of 3 gives 67', () => {
    const watched = 2;
    const total = 3;
    expect(progressPercent(watched, total)).toBe(67);
  });

  test('returns 0 when total is 0', () => {
    const watched = 0;
    const total = 0;
    expect(progressPercent(watched, total)).toBe(0);
  });

  test('caps at 100 when watched is more than total', () => {
    const watched = 30;
    const total = 24;
    expect(progressPercent(watched, total)).toBe(100);
  });
});

describe('latestEpisode', () => {
  test('finds the latest episode in an unsorted list', () => {
    const watched = [
      { seasonNumber: 1, episodeNumber: 10 },
      { seasonNumber: 2, episodeNumber: 3 },
      { seasonNumber: 2, episodeNumber: 1 },
    ];
    expect(latestEpisode(watched)).toEqual({
      seasonNumber: 2,
      episodeNumber: 3,
    });
  });

  test('returns null for an empty list', () => {
    const watched: { seasonNumber: number; episodeNumber: number }[] = [];
    expect(latestEpisode(watched)).toBeNull();
  });

  test('returns the only episode when the list has one', () => {
    const watched = [{ seasonNumber: 1, episodeNumber: 1 }];
    expect(latestEpisode(watched)).toEqual({
      seasonNumber: 1,
      episodeNumber: 1,
    });
  });
});

describe('progressLabel', () => {
  test('formats an episode as S2 E5', () => {
    expect(progressLabel({ seasonNumber: 2, episodeNumber: 5 })).toBe('S2 E5');
  });

  test('says Not started when there is no episode', () => {
    expect(progressLabel(null)).toBe('Not started');
  });
});

describe('progressBadge', () => {
  test('shows a check for a series that is done', () => {
    expect(progressBadge(makeTitle({ status: 'done' }))).toEqual({
      kind: 'check',
    });
  });

  test('shows a check for a movie that is done', () => {
    expect(
      progressBadge(makeTitle({ mediaType: 'movie', status: 'done' })),
    ).toEqual({ kind: 'check' });
  });

  test('shows nothing for a movie that is not done', () => {
    expect(progressBadge(makeTitle({ mediaType: 'movie' }))).toEqual({
      kind: 'none',
    });
  });

  test('shows the percentage for a series being watched', () => {
    expect(
      progressBadge(
        makeTitle({ status: 'watching', watchedCount: 6, totalEpisodes: 24 }),
      ),
    ).toEqual({ kind: 'percent', value: 25 });
  });

  test('shows nothing for a series on the watchlist', () => {
    expect(progressBadge(makeTitle({ status: 'watchlist' }))).toEqual({
      kind: 'none',
    });
  });
});
