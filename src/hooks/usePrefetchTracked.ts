import { useEffect } from 'react';
import type { TrackedTitle } from '../domain/types';
import { nextToWatch } from '../domain/progress';
import { getAppDb } from '../db/appDb';
import { listTitlesByStatus } from '../db/titles';
import { listWatched } from '../db/episodes';
import { getSeason, loadDetails } from '../tmdb/api';

const PARALLEL_REQUESTS = 3;

// Runs `work` for every item, at most `limit` at the same time.
// A failed item is skipped, the rest continue.
async function runLimited<T>(
  items: readonly T[],
  limit: number,
  work: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;

  async function worker(): Promise<void> {
    while (next < items.length) {
      const item = items[next];
      next++;
      if (item === undefined) {
        continue;
      }
      try {
        await work(item);
      } catch {
        // Preloading is only a bonus: ignore errors.
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    worker(),
  );
  await Promise.all(workers);
}

async function prefetchWatching(title: TrackedTitle): Promise<void> {
  const loaded = await loadDetails(title.mediaType, title.tmdbId);
  if (loaded.mediaType !== 'tv') {
    return;
  }

  const db = await getAppDb();
  const watched = await listWatched(db, title.id);
  const seasons = loaded.details.seasons;
  const start =
    nextToWatch(seasons, watched)?.seasonNumber ??
    seasons[seasons.length - 1]?.seasonNumber;
  if (start === undefined) {
    return;
  }

  for (const seasonNumber of [start - 1, start, start + 1]) {
    if (seasons.some(s => s.seasonNumber === seasonNumber)) {
      await getSeason(title.tmdbId, seasonNumber);
    }
  }
}

async function prefetchWatchlist(title: TrackedTitle): Promise<void> {
  await loadDetails(title.mediaType, title.tmdbId);
}

async function prefetchTracked(): Promise<void> {
  const db = await getAppDb();
  const [watching, watchlist] = await Promise.all([
    listTitlesByStatus(db, 'watching'),
    listTitlesByStatus(db, 'watchlist'),
  ]);

  await runLimited(watching, PARALLEL_REQUESTS, prefetchWatching);
  await runLimited(watchlist, PARALLEL_REQUESTS, prefetchWatchlist);
}

// Fills the TMDB cache in the background, once, when the app starts.
export function usePrefetchTracked(): void {
  useEffect(() => {
    prefetchTracked().catch(() => {
      // Ignore: the screens load normally if the cache is empty.
    });
  }, []);
}
