import { Row } from './database';

export function readNumber(row: Row, column: string): number {
  const value = row[column];
  if (typeof value !== 'number') {
    throw new Error(`Column ${column} is not a number`);
  }
  return value;
}

export function readString(row: Row, column: string): string {
  const value = row[column];
  if (typeof value !== 'string') {
    throw new Error(`Column ${column} is not text`);
  }
  return value;
}

export function readNullableNumber(row: Row, column: string): number | null {
  const value = row[column];
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'number') {
    throw new Error(`Column ${column} is not a number`);
  }
  return value;
}

export function readNullableString(row: Row, column: string): string | null {
  const value = row[column];
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new Error(`Column ${column} is not text`);
  }
  return value;
}
