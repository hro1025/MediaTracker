import type { Db } from './database';

export async function getSetting(db: Db, key: string): Promise<string | null> {
  const result = await db.execute('SELECT value FROM settings WHERE key = ?', [
    key,
  ]);
  const value = result.rows[0]?.value;
  return typeof value === 'string' ? value : null;
}

export async function setSetting(
  db: Db,
  key: string,
  value: string,
): Promise<void> {
  await db.execute(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
    [key, value],
  );
}

export async function deleteSetting(db: Db, key: string): Promise<void> {
  await db.execute('DELETE FROM settings WHERE key = ?', [key]);
}
