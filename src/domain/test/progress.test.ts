import {
  episodesUpTo,
  formatNextEpisode,
  isAired,
  isoDate,
  latestEpisode,
  nextToWatch,
  progressBadge,
  progressLabel,
  progressPercent,
  shortDate,
  statusAfterMark,
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

describe('episodesUpTo', () => {
  const seasons = [
    { seasonNumber: 1, name: 'Season 1', episodeCount: 3 },
    { seasonNumber: 2, name: 'Season 2', episodeCount: 4 },
    { seasonNumber: 3, name: 'Season 3', episodeCount: 5 },
  ];

  test('includes all earlier seasons and the target season up to the episode', () => {
    const refs = episodesUpTo(seasons, { seasonNumber: 2, episodeNumber: 2 });

    expect(refs).toEqual([
      { seasonNumber: 1, episodeNumber: 1 },
      { seasonNumber: 1, episodeNumber: 2 },
      { seasonNumber: 1, episodeNumber: 3 },
      { seasonNumber: 2, episodeNumber: 1 },
      { seasonNumber: 2, episodeNumber: 2 },
    ]);
  });

  test('the first episode gives only itself', () => {
    expect(
      episodesUpTo(seasons, { seasonNumber: 1, episodeNumber: 1 }),
    ).toEqual([{ seasonNumber: 1, episodeNumber: 1 }]);
  });
});

describe('statusAfterMark', () => {
  test('watchlist becomes watching', () => {
    expect(statusAfterMark('watchlist')).toBe('watching');
  });

  test('watching stays watching', () => {
    expect(statusAfterMark('watching')).toBe('watching');
  });

  test('done stays done', () => {
    expect(statusAfterMark('done')).toBe('done');
  });
});

describe('nextToWatch', () => {
  const seasons = [
    { seasonNumber: 1, name: 'Season 1', episodeCount: 3 },
    { seasonNumber: 2, name: 'Season 2', episodeCount: 4 },
  ];

  test('nothing watched gives S1 E1', () => {
    expect(nextToWatch(seasons, [])).toEqual({
      seasonNumber: 1,
      episodeNumber: 1,
    });
  });

  test('in the middle of a season gives the next episode', () => {
    expect(
      nextToWatch(seasons, [{ seasonNumber: 1, episodeNumber: 2 }]),
    ).toEqual({ seasonNumber: 1, episodeNumber: 3 });
  });

  test('after the last episode of a season gives the next season', () => {
    expect(
      nextToWatch(seasons, [{ seasonNumber: 1, episodeNumber: 3 }]),
    ).toEqual({ seasonNumber: 2, episodeNumber: 1 });
  });

  test('after the very last episode gives null', () => {
    expect(
      nextToWatch(seasons, [{ seasonNumber: 2, episodeNumber: 4 }]),
    ).toBeNull();
  });
});

describe('formatNextEpisode', () => {
  const next = { seasonNumber: 3, episodeNumber: 4, airDate: '2026-10-18' };

  test('a future date is shown', () => {
    expect(formatNextEpisode(next, '2026-10-12')).toBe('Next: S3 E4 · 18 Oct');
  });

  test('a past date gives null', () => {
    expect(
      formatNextEpisode({ ...next, airDate: '2026-10-01' }, '2026-10-12'),
    ).toBeNull();
  });

  test('today is still shown', () => {
    expect(
      formatNextEpisode({ ...next, airDate: '2026-10-12' }, '2026-10-12'),
    ).toBe('Next: S3 E4 · 12 Oct');
  });

  test('no next episode gives null', () => {
    expect(formatNextEpisode(null, '2026-10-12')).toBeNull();
  });

  test('the day has no leading zero', () => {
    expect(
      formatNextEpisode({ ...next, airDate: '2026-11-05' }, '2026-10-12'),
    ).toBe('Next: S3 E4 · 5 Nov');
  });
});

describe('isoDate', () => {
  test('pads month and day', () => {
    expect(isoDate(new Date(2026, 0, 7))).toBe('2026-01-07');
  });
});

describe('isAired', () => {
  test('a date before today has aired', () => {
    expect(isAired('2026-10-07', '2026-10-14')).toBe(true);
  });

  test('today has not aired yet', () => {
    expect(isAired('2026-10-14', '2026-10-14')).toBe(false);
  });

  test('a future date has not aired', () => {
    expect(isAired('2026-10-21', '2026-10-14')).toBe(false);
  });

  test('no date has not aired', () => {
    expect(isAired(null, '2026-10-14')).toBe(false);
  });
});

describe('shortDate', () => {
  test('formats day and month', () => {
    expect(shortDate('2026-10-07')).toBe('7 Oct');
  });
});
