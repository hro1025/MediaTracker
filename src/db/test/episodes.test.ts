import { NewTitle } from '../../domain/types';
import { Db } from '../database';
import { listWatched, markEpisode, unmarkEpisode } from '../episodes';
import { migrate } from '../schema';
import { createTestDb } from '../testDb';
import { addTitle, getTitle, listTitlesByStatus } from '../titles';

const breakingBad: NewTitle = {
  tmdbId: 1396,
  mediaType: 'tv',
  name: 'Breaking Bad',
  posterPath: null,
  totalEpisodes: 62,
  status: 'watching',
};

let db: Db;

beforeEach(async () => {
  db = createTestDb();
  await migrate(db);
});

describe('markEpisode, unmarkEpisode and listWatched', () => {
  test('marks, ignores duplicates and unmarks', async () => {
    const id = await addTitle(db, breakingBad, 100);

    await markEpisode(db, id, { seasonNumber: 1, episodeNumber: 1 }, 200);
    await markEpisode(db, id, { seasonNumber: 1, episodeNumber: 2 }, 200);
    expect(await listWatched(db, id)).toHaveLength(2);

    await markEpisode(db, id, { seasonNumber: 1, episodeNumber: 2 }, 200);
    expect(await listWatched(db, id)).toHaveLength(2);

    await unmarkEpisode(db, id, { seasonNumber: 1, episodeNumber: 1 });
    expect(await listWatched(db, id)).toEqual([
      { seasonNumber: 1, episodeNumber: 2 },
    ]);

    const title = await getTitle(db, 'tv', 1396);
    expect(title?.watchedCount).toBe(1);
    expect(title?.lastWatchedAt).toBe(200);
  });

  test('marking an episode moves the title to the front', async () => {
    const idA = await addTitle(
      db,
      { ...breakingBad, tmdbId: 1, name: 'A' },
      100,
    );
    await addTitle(db, { ...breakingBad, tmdbId: 2, name: 'B' }, 200);

    await markEpisode(db, idA, { seasonNumber: 1, episodeNumber: 1 }, 300);

    const watching = await listTitlesByStatus(db, 'watching');
    expect(watching.map(t => t.name)).toEqual(['A', 'B']);
  });
});
