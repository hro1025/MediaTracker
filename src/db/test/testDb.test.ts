import { createTestDb } from '../testDb';

describe('createTestDb', () => {
  test('returns rows for a SELECT', async () => {
    const db = createTestDb();
    const result = await db.execute('SELECT 1 + 1 AS two');
    expect(result.rows[0]?.two).toBe(2);
  });

  test('reports rows affected for an INSERT', async () => {
    const db = createTestDb();
    await db.execute('CREATE TABLE t (x INTEGER)');
    const result = await db.execute('INSERT INTO t (x) VALUES (?)', [5]);
    expect(result.rowsAffected).toBe(1);
  });
});
