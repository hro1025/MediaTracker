import { EpisodeRef } from '../domain/types';
import { Db } from './database';
import { readNumber } from './rows';

export async function markEpisode(
  db: Db,
  titleId: number,
  ref: EpisodeRef,
  now: number,
): Promise<void> {
  await db.execute(
    `INSERT OR IGNORE INTO watched_episodes
       (title_id, season_number, episode_number, watched_at)
     VALUES (?, ?, ?, ?)`,
    [titleId, ref.seasonNumber, ref.episodeNumber, now],
  );
  await db.execute('UPDATE titles SET last_watched_at = ? WHERE id = ?', [
    now,
    titleId,
  ]);
}

export async function unmarkEpisode(
  db: Db,
  titleId: number,
  ref: EpisodeRef,
): Promise<void> {
  await db.execute(
    `DELETE FROM watched_episodes
     WHERE title_id = ? AND season_number = ? AND episode_number = ?`,
    [titleId, ref.seasonNumber, ref.episodeNumber],
  );
}

export async function listWatched(
  db: Db,
  titleId: number,
): Promise<EpisodeRef[]> {
  const result = await db.execute(
    `SELECT season_number, episode_number FROM watched_episodes
     WHERE title_id = ?
     ORDER BY season_number, episode_number`,
    [titleId],
  );
  return result.rows.map(row => ({
    seasonNumber: readNumber(row, 'season_number'),
    episodeNumber: readNumber(row, 'episode_number'),
  }));
}
export async function resetProgress(db: Db, titleId: number): Promise<void> {
  await db.execute('DELETE FROM watched_episodes WHERE title_id = ?', [
    titleId,
  ]);
  await db.execute('UPDATE titles SET last_watched_at = NULL WHERE id = ?', [
    titleId,
  ]);
}

export async function markEpisodes(
  db: Db,
  titleId: number,
  refs: readonly EpisodeRef[],
  now: number,
): Promise<void> {
  await db.execute('BEGIN');
  try {
    for (const ref of refs) {
      await markEpisode(db, titleId, ref, now);
    }
    await db.execute('COMMIT');
  } catch (e) {
    await db.execute('ROLLBACK');
    throw e;
  }
}
