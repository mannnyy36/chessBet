-- ChessBet schema
--
-- Fresh setup:
--   psql chessbet < schema.sql
--
-- If you already have data and just need to add the new columns,
-- skip the CREATE statements and run the ALTER block at the bottom.

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    TEXT UNIQUE NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    balance     NUMERIC(12, 2) NOT NULL DEFAULT 1000,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bets (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id     TEXT NOT NULL,
    round_id    TEXT NOT NULL,
    tour_slug   TEXT NOT NULL,
    round_slug  TEXT NOT NULL,
    player      TEXT NOT NULL,
    opponent    TEXT NOT NULL,
    selection   TEXT NOT NULL CHECK (selection IN ('win', 'draw', 'loss')),
    amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    odds        NUMERIC(8, 2) NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost')),
    payout      NUMERIC(12, 2),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    settled_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS bets_user_id_idx  ON bets(user_id);
CREATE INDEX IF NOT EXISTS bets_status_idx   ON bets(status);
CREATE INDEX IF NOT EXISTS bets_round_id_idx ON bets(round_id);


-- ---------------------------------------------------------------
-- Migration block (only needed if you already had old tables)
-- ---------------------------------------------------------------
-- ALTER TABLE users ALTER COLUMN balance SET DEFAULT 1000;
-- UPDATE users SET balance = 1000 WHERE balance IS NULL OR balance = 0;
--
-- ALTER TABLE bets ADD COLUMN IF NOT EXISTS opponent   TEXT;
-- ALTER TABLE bets ADD COLUMN IF NOT EXISTS tour_slug  TEXT;
-- ALTER TABLE bets ADD COLUMN IF NOT EXISTS round_slug TEXT;
-- ALTER TABLE bets ADD COLUMN IF NOT EXISTS payout     NUMERIC(12, 2);
-- ALTER TABLE bets ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ;
