import type { Db } from '../database';
import { createTestDb } from '../testDb';
import { migrate } from '../schema';
import {
  addTitle,
  getTitle,
  listTitlesByStatus,
  markMovieWatched,
  removeTitle,
  setStatus,
  updateTotalEpisodes,
} from '../titles';
import { listWatched, markEpisode, resetProgress } from '../episodes';
import type { NewTitle } from '../../domain/types';

function newTitle(overrides: Partial<NewTitle> = {}): NewTitle {
  return {
    tmdbId: 1396,
    mediaType: 'tv',
    name: 'Breaking Bad',
    posterPath: null,
    totalEpisodes: 62,
    status: 'watching',
    ...overrides,
  };
}

let db: Db;

beforeEach(async () => {
  db = createTestDb();
  await migrate(db);
});

describe('addTitle and getTitle', () => {
  test('adding the same title twice gives the same id and one row', async () => {
    const first = await addTitle(db, newTitle(), 1000);
    const second = await addTitle(db, newTitle(), 2000);

    expect(first).toBe(1);
    expect(second).toBe(1);

    const result = await db.execute('SELECT COUNT(*) AS n FROM titles');
    expect(result.rows[0]?.n).toBe(1);
  });

  test('getTitle returns the stored title', async () => {
    await addTitle(db, newTitle(), 1000);

    const title = await getTitle(db, 'tv', 1396);

    expect(title?.name).toBe('Breaking Bad');
    expect(title?.watchedCount).toBe(0);
    expect(title?.addedAt).toBe(1000);
    expect(title?.lastWatchedAt).toBeNull();
  });

  test('getTitle with the wrong media type returns null', async () => {
    await addTitle(db, newTitle(), 1000);

    expect(await getTitle(db, 'movie', 1396)).toBeNull();
  });
});

describe('listTitlesByStatus and setStatus', () => {
  beforeEach(async () => {
    await addTitle(db, newTitle({ tmdbId: 1, name: 'A' }), 100);
    await addTitle(db, newTitle({ tmdbId: 2, name: 'B' }), 200);
    await addTitle(
      db,
      newTitle({
        tmdbId: 3,
        mediaType: 'movie',
        name: 'C',
        status: 'watchlist',
      }),
      300,
    );
  });

  test('lists newest first', async () => {
    const watching = await listTitlesByStatus(db, 'watching');

    expect(watching.map(t => t.name)).toEqual(['B', 'A']);
  });

  test('setStatus moves a title to another tab', async () => {
    const a = await getTitle(db, 'tv', 1);
    if (a === null) {
      throw new Error('A was not added');
    }

    await setStatus(db, a.id, 'done');

    expect((await listTitlesByStatus(db, 'watching')).map(t => t.name)).toEqual(
      ['B'],
    );
    expect((await listTitlesByStatus(db, 'done')).map(t => t.name)).toEqual([
      'A',
    ]);
    expect(
      (await listTitlesByStatus(db, 'watchlist')).map(t => t.name),
    ).toEqual(['C']);
  });

  test('setStatus with an unknown id changes nothing', async () => {
    await setStatus(db, 999, 'done');

    expect(await listTitlesByStatus(db, 'done')).toHaveLength(0);
  });
});

describe('updateTotalEpisodes', () => {
  test('changes the stored total', async () => {
    const id = await addTitle(db, newTitle(), 1000);

    await updateTotalEpisodes(db, id, 70);

    const title = await getTitle(db, 'tv', 1396);
    expect(title?.totalEpisodes).toBe(70);
  });
});

describe('removeTitle', () => {
  test('removes the title and its watched episodes', async () => {
    const id = await addTitle(db, newTitle(), 1000);
    await markEpisode(db, id, { seasonNumber: 1, episodeNumber: 1 }, 2000);

    await removeTitle(db, id);

    expect(await getTitle(db, 'tv', 1396)).toBeNull();
    const result = await db.execute(
      'SELECT COUNT(*) AS n FROM watched_episodes',
    );
    expect(result.rows[0]?.n).toBe(0);
  });
});

describe('resetProgress', () => {
  test('unmarks everything but keeps the title', async () => {
    const id = await addTitle(db, newTitle(), 1000);
    await markEpisode(db, id, { seasonNumber: 1, episodeNumber: 1 }, 2000);
    await markEpisode(db, id, { seasonNumber: 1, episodeNumber: 2 }, 2000);

    await resetProgress(db, id);

    expect(await listWatched(db, id)).toEqual([]);
    const title = await getTitle(db, 'tv', 1396);
    expect(title?.watchedCount).toBe(0);
    expect(title?.lastWatchedAt).toBeNull();
    expect(title?.status).toBe('watching');
  });
});

describe('markMovieWatched', () => {
  test('sets the movie to done and records the time', async () => {
    const id = await addTitle(
      db,
      newTitle({
        tmdbId: 603,
        mediaType: 'movie',
        name: 'The Matrix',
        totalEpisodes: 1,
        status: 'watchlist',
      }),
      100,
    );

    await markMovieWatched(db, id, 500);

    const movie = await getTitle(db, 'movie', 603);
    expect(movie?.status).toBe('done');
    expect(movie?.lastWatchedAt).toBe(500);
  });
});
