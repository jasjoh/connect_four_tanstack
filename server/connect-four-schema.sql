CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ai BOOLEAN DEFAULT FALSE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_on TIMESTAMPTZ DEFAULT current_timestamp
);

CREATE TABLE boards (
  id SERIAL PRIMARY KEY,
  width INTEGER,
  height INTEGER,
  full_cols INTEGER[],
  data JSONB[][]
);

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_state INTEGER DEFAULT 0 NOT NULL,
  placed_pieces INTEGER[][],
  board_id INTEGER NOT NULL
    REFERENCES boards ON DELETE CASCADE,
  winning_set INTEGER[][],
  curr_player_id UUID
    REFERENCES players,
  created_on TIMESTAMPTZ DEFAULT current_timestamp
);

CREATE TABLE game_players (
  player_id UUID
    REFERENCES players ON DELETE CASCADE,
  game_id UUID
    REFERENCES games ON DELETE CASCADE,
  play_order INTEGER,
  PRIMARY KEY (player_id, game_id),
  UNIQUE (player_id, game_id),
  UNIQUE (game_id, play_order)
);

-- We don't want to delete the turn when a player is deleted (it still happened)
CREATE TABLE game_turns (
  id SERIAL PRIMARY KEY,
  player_id UUID
    REFERENCES players ON DELETE SET NULL,
  game_id UUID
    REFERENCES games ON DELETE CASCADE,
  location INTEGER[] NOT NULL,
  created_on_epoch BIGINT DEFAULT extract(epoch from current_timestamp),
  created_on_milliseconds BIGINT DEFAULT extract(milliseconds from current_timestamp)
);
