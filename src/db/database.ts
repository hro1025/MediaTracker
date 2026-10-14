export type SqlValue = string | number | null;
export type Row = Record<string, SqlValue>;
export type QueryResult = {
  rows: Row[];
  rowsAffected: number;
  insertId: number | undefined;
};
export interface Db {
  execute(sql: string, params?: SqlValue[]): Promise<QueryResult>;
}
