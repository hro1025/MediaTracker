import type { Db } from '../database';
import { createTestDb } from '../testDb';
import { migrate } from '../schema';
import { deleteSetting, getSetting, setSetting } from '../settings';

let db: Db;

beforeEach(async () => {
  db = createTestDb();
  await migrate(db);
});

describe('settings', () => {
  test('a missing key gives null', async () => {
    expect(await getSetting(db, 'tmdbToken')).toBeNull();
  });

  test('a saved value can be read back', async () => {
    await setSetting(db, 'tmdbToken', 'abc');

    expect(await getSetting(db, 'tmdbToken')).toBe('abc');
  });

  test('saving again replaces the value', async () => {
    await setSetting(db, 'tmdbToken', 'abc');
    await setSetting(db, 'tmdbToken', 'xyz');

    expect(await getSetting(db, 'tmdbToken')).toBe('xyz');
  });

  test('a deleted value is gone', async () => {
    await setSetting(db, 'tmdbToken', 'abc');
    await deleteSetting(db, 'tmdbToken');

    expect(await getSetting(db, 'tmdbToken')).toBeNull();
  });
});
