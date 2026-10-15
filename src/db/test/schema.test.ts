import { createTestDb } from '../testDb';
import { migrate } from '../schema';

describe('migrate', () => {
  test('sets user_version to 2, even when run twice', async () => {
    const db = createTestDb();
    await migrate(db);
    await migrate(db);
    const result = await db.execute('PRAGMA user_version');
    expect(result.rows[0]?.user_version).toBe(2);
  });

  test('creates exactly the three tables', async () => {
    const db = createTestDb();
    await migrate(db);
    const result = await db.execute(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    );
    expect(result.rows.map(row => row.name)).toEqual([
      'settings',
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

  test('upgrades a version 1 database and keeps its titles', async () => {
    const db = createTestDb();
    await migrate(db);

    // Turn it back into a version 1 database with one title in it,
    // like the database already on the phone.
    await db.execute('DROP TABLE settings');
    await db.execute('PRAGMA user_version = 1');
    await db.execute(
      `INSERT INTO titles (tmdb_id, media_type, name, status, added_at)
       VALUES (1396, 'tv', 'Breaking Bad', 'watching', 0)`,
    );

    await migrate(db);

    const version = await db.execute('PRAGMA user_version');
    expect(version.rows[0]?.user_version).toBe(2);
    const titles = await db.execute('SELECT name FROM titles');
    expect(titles.rows.map(row => row.name)).toEqual(['Breaking Bad']);
    const settings = await db.execute('SELECT COUNT(*) AS n FROM settings');
    expect(settings.rows[0]?.n).toBe(0);
  });
});
