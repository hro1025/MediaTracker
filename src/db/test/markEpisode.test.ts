import type { Db } from '../database';
import { createTestDb } from '../testDb';
import { migrate } from '../schema';
import { addTitle, getTitle } from '../titles';
import { listWatched, markEpisodes } from '../episodes';

let db: Db;
let titleId: number;

beforeEach(async () => {
  db = createTestDb();
  await migrate(db);
  titleId = await addTitle(
    db,
    {
      tmdbId: 1396,
      mediaType: 'tv',
      name: 'Breaking Bad',
      posterPath: null,
      totalEpisodes: 62,
      status: 'watching',
    },
    1000,
  );
});

describe('markEpisodes', () => {
  test('marks all given episodes', async () => {
    await markEpisodes(
      db,
      titleId,
      [
        { seasonNumber: 1, episodeNumber: 1 },
        { seasonNumber: 1, episodeNumber: 2 },
        { seasonNumber: 1, episodeNumber: 3 },
      ],
      2000,
    );

    expect(await listWatched(db, titleId)).toHaveLength(3);
    const title = await getTitle(db, 'tv', 1396);
    expect(title?.watchedCount).toBe(3);
    expect(title?.lastWatchedAt).toBe(2000);
  });

  test('already watched episodes are skipped, not duplicated', async () => {
    const refs = [
      { seasonNumber: 1, episodeNumber: 1 },
      { seasonNumber: 1, episodeNumber: 2 },
    ];
    await markEpisodes(db, titleId, refs, 2000);
    await markEpisodes(db, titleId, refs, 3000);

    expect(await listWatched(db, titleId)).toHaveLength(2);
  });

  test('a failure rolls everything back', async () => {
    await expect(
      markEpisodes(db, 999, [{ seasonNumber: 1, episodeNumber: 1 }], 2000),
    ).rejects.toThrow();

    const result = await db.execute(
      'SELECT COUNT(*) AS n FROM watched_episodes',
    );
    expect(result.rows[0]?.n).toBe(0);
  });
});
