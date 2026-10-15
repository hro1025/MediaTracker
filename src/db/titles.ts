import { MediaType, NewTitle, Status, TrackedTitle } from '../domain/types';
import { Db, Row } from './database';
import {
  readNullableNumber,
  readNullableString,
  readNumber,
  readString,
} from './rows';

const TITLE_COLUMNS = `
  titles.id, titles.tmdb_id, titles.media_type, titles.name,
  titles.poster_path, titles.total_episodes, titles.status,
  titles.added_at, titles.last_watched_at`;

function isStatus(value: unknown): value is Status {
  return value === 'watching' || value === 'done' || value === 'watchlist';
}

function isMediaType(value: unknown): value is MediaType {
  return value === 'movie' || value === 'tv';
}

function rowToTitle(row: Row): TrackedTitle {
  const mediaType = row.media_type;
  if (!isMediaType(mediaType)) {
    throw new Error('Column media_type has an unexpected value');
  }
  const status = row.status;
  if (!isStatus(status)) {
    throw new Error('Column status has an unexpected value');
  }
  return {
    id: readNumber(row, 'id'),
    tmdbId: readNumber(row, 'tmdb_id'),
    mediaType,
    name: readString(row, 'name'),
    posterPath: readNullableString(row, 'poster_path'),
    totalEpisodes: readNumber(row, 'total_episodes'),
    watchedCount: readNumber(row, 'watched_count'),
    status,
    addedAt: readNumber(row, 'added_at'),
    lastWatchedAt: readNullableNumber(row, 'last_watched_at'),
  };
}

export async function addTitle(
  db: Db,
  input: NewTitle,
  now: number,
): Promise<number> {
  await db.execute(
    `INSERT INTO titles
       (tmdb_id, media_type, name, poster_path, total_episodes, status, added_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (tmdb_id, media_type) DO NOTHING`,
    [
      input.tmdbId,
      input.mediaType,
      input.name,
      input.posterPath,
      input.totalEpisodes,
      input.status,
      now,
    ],
  );
  const result = await db.execute(
    'SELECT id FROM titles WHERE tmdb_id = ? AND media_type = ?',
    [input.tmdbId, input.mediaType],
  );
  const row = result.rows[0];
  if (row === undefined) {
    throw new Error('Title was not saved');
  }
  return readNumber(row, 'id');
}

export async function getTitle(
  db: Db,
  mediaType: MediaType,
  tmdbId: number,
): Promise<TrackedTitle | null> {
  const result = await db.execute(
    `SELECT ${TITLE_COLUMNS},
       (SELECT COUNT(*) FROM watched_episodes
        WHERE watched_episodes.title_id = titles.id) AS watched_count
     FROM titles
     WHERE titles.tmdb_id = ? AND titles.media_type = ?`,
    [tmdbId, mediaType],
  );
  const row = result.rows[0];
  return row === undefined ? null : rowToTitle(row);
}

export async function listTitlesByStatus(
  db: Db,
  status: Status,
): Promise<TrackedTitle[]> {
  const result = await db.execute(
    `SELECT ${TITLE_COLUMNS},
       COUNT(watched_episodes.title_id) AS watched_count
     FROM titles
     LEFT JOIN watched_episodes ON watched_episodes.title_id = titles.id
     WHERE titles.status = ?
     GROUP BY titles.id
     ORDER BY COALESCE(titles.last_watched_at, titles.added_at) DESC`,
    [status],
  );
  return result.rows.map(rowToTitle);
}

export async function setStatus(
  db: Db,
  id: number,
  status: Status,
): Promise<void> {
  await db.execute('UPDATE titles SET status = ? WHERE id = ?', [status, id]);
}

export async function updateTotalEpisodes(
  db: Db,
  id: number,
  totalEpisodes: number,
): Promise<void> {
  await db.execute('UPDATE titles SET total_episodes = ? WHERE id = ?', [
    totalEpisodes,
    id,
  ]);
}

export async function removeTitle(db: Db, id: number): Promise<void> {
  await db.execute('DELETE FROM titles WHERE id = ?', [id]);
}

export async function markMovieWatched(
  db: Db,
  id: number,
  now: number,
): Promise<void> {
  await db.execute(
    "UPDATE titles SET status = 'done', last_watched_at = ? WHERE id = ?",
    [now, id],
  );
}
