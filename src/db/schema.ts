import { Db } from './database';

const CREATE_TITLES = `
  CREATE TABLE titles (
    id INTEGER PRIMARY KEY,
    tmdb_id INTEGER NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
    name TEXT NOT NULL,
    poster_path TEXT,
    total_episodes INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('watching', 'done', 'watchlist')),
    added_at INTEGER NOT NULL,
    last_watched_at INTEGER,
    UNIQUE (tmdb_id, media_type)
  )
`;

const CREATE_WATCHED_EPISODES = `
  CREATE TABLE watched_episodes (
    title_id INTEGER NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
    season_number INTEGER NOT NULL,
    episode_number INTEGER NOT NULL,
    watched_at INTEGER NOT NULL,
    PRIMARY KEY (title_id, season_number, episode_number)
  )
`;

async function readUserVersion(db: Db): Promise<number> {
  const result = await db.execute('PRAGMA user_version');
  const version = result.rows[0]?.user_version;
  return typeof version === 'number' ? version : 0;
}

export async function migrate(db: Db): Promise<void> {
  const version = await readUserVersion(db);

  if (version < 1) {
    await db.execute(CREATE_TITLES);
    await db.execute(CREATE_WATCHED_EPISODES);
    await db.execute('PRAGMA user_version = 1');
  }
}
