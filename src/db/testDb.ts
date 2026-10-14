import Database from 'better-sqlite3';
import { Db, Row, SqlValue } from './database';

export function createTestDb(): Db {
  const sqlite = new Database(':memory:');
  sqlite.pragma('foreign_keys = ON');

  return {
    async execute(sql: string, params: SqlValue[] = []) {
      const statement = sqlite.prepare(sql);
      if (statement.reader === true) {
        const rows = statement.all(...params) as Row[];
        return { rows, rowsAffected: 0, insertId: undefined };
      }
      const info = statement.run(...params);
      return {
        rows: [],
        rowsAffected: info.changes,
        insertId: Number(info.lastInsertRowid),
      };
    },
  };
}
