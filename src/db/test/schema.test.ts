import { createTestDb } from '../testDb';
import { migrate } from '../schema';

describe('migrate', () => {
  test('sets user_version to 1, even when run twice', async () => {
    const db = createTestDb();
    await migrate(db);
    await migrate(db);
    const result = await db.execute('PRAGMA user_version');
    expect(result.rows[0]?.user_version).toBe(1);
  });

  test('creates exactly the two tables', async () => {
    const db = createTestDb();
    await migrate(db);
    const result = await db.execute(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    );
    expect(result.rows.map(row => row.name)).toEqual([
      'titles',
      'watched_episodes',
    ]);
  });

  test('rejects a status that is not allowed', async () => {
    const db = createTestDb();
    await migrate(db);
    await expect(
      db.execute(
        `INSERT INTO titles (tmdb_id, media_type, name, status, added_at)
         VALUES (1, 'tv', 'Test', 'paused', 0)`,
      ),
    ).rejects.toThrow();
  });
});
