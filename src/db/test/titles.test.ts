import { NewTitle } from '../../domain/types';
import { Db } from '../database';
import { migrate } from '../schema';
import { createTestDb } from '../testDb';
import { addTitle, getTitle, listTitlesByStatus, setStatus } from '../titles';

const breakingBad: NewTitle = {
  tmdbId: 1396,
  mediaType: 'tv',
  name: 'Breaking Bad',
  posterPath: null,
  totalEpisodes: 62,
  status: 'watching',
};

function makeNewTitle(overrides: Partial<NewTitle>): NewTitle {
  return { ...breakingBad, ...overrides };
}

let db: Db;

beforeEach(async () => {
  db = createTestDb();
  await migrate(db);
});

describe('addTitle and getTitle', () => {
  test('adding the same title twice keeps one row', async () => {
    expect(await addTitle(db, breakingBad, 1000)).toBe(1);
    expect(await addTitle(db, breakingBad, 1000)).toBe(1);
    const count = await db.execute('SELECT COUNT(*) AS n FROM titles');
    expect(count.rows[0]?.n).toBe(1);
  });

  test('reads a title back with its fields', async () => {
    await addTitle(db, breakingBad, 1000);
    const title = await getTitle(db, 'tv', 1396);
    expect(title?.name).toBe('Breaking Bad');
    expect(title?.watchedCount).toBe(0);
    expect(title?.addedAt).toBe(1000);
    expect(title?.lastWatchedAt).toBeNull();
  });

  test('returns null for a title that is not there', async () => {
    await addTitle(db, breakingBad, 1000);
    expect(await getTitle(db, 'movie', 1396)).toBeNull();
  });
});

describe('listTitlesByStatus and setStatus', () => {
  test('lists newest first and moves titles between statuses', async () => {
    const idA = await addTitle(db, makeNewTitle({ tmdbId: 1, name: 'A' }), 100);
    await addTitle(db, makeNewTitle({ tmdbId: 2, name: 'B' }), 200);
    await addTitle(
      db,
      makeNewTitle({
        tmdbId: 3,
        name: 'C',
        mediaType: 'movie',
        status: 'watchlist',
      }),
      300,
    );

    const watching = await listTitlesByStatus(db, 'watching');
    expect(watching.map(t => t.name)).toEqual(['B', 'A']);

    await setStatus(db, idA, 'done');
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
});
