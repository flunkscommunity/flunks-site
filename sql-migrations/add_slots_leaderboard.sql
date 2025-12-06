-- Add slots leaderboard table
CREATE TABLE IF NOT EXISTS slots_leaderboard (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  game_id INTEGER NOT NULL,
  game_name TEXT NOT NULL,
  bet_amount NUMERIC NOT NULL,
  win_amount NUMERIC NOT NULL,
  multiplier NUMERIC NOT NULL,
  spin_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for leaderboard queries
CREATE INDEX idx_slots_leaderboard_multiplier ON slots_leaderboard(multiplier DESC);
CREATE INDEX idx_slots_leaderboard_user ON slots_leaderboard(user_id);
CREATE INDEX idx_slots_leaderboard_game ON slots_leaderboard(game_id);

-- Add daily/weekly/all-time views
CREATE INDEX idx_slots_leaderboard_date ON slots_leaderboard(created_at DESC);

-- Function to get top wins
CREATE OR REPLACE FUNCTION get_slots_leaderboard(
  time_period TEXT DEFAULT 'all_time',
  game_filter INTEGER DEFAULT NULL,
  limit_count INTEGER DEFAULT 100
)
RETURNS TABLE (
  rank BIGINT,
  username TEXT,
  game_name TEXT,
  bet_amount NUMERIC,
  win_amount NUMERIC,
  multiplier NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY s.multiplier DESC) as rank,
    p.username,
    s.game_name,
    s.bet_amount,
    s.win_amount,
    s.multiplier,
    s.created_at
  FROM slots_leaderboard s
  JOIN profiles p ON s.user_id = p.id
  WHERE 
    (game_filter IS NULL OR s.game_id = game_filter)
    AND (
      time_period = 'all_time' OR
      (time_period = 'daily' AND s.created_at > NOW() - INTERVAL '1 day') OR
      (time_period = 'weekly' AND s.created_at > NOW() - INTERVAL '7 days') OR
      (time_period = 'monthly' AND s.created_at > NOW() - INTERVAL '30 days')
    )
  ORDER BY s.multiplier DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Add slots stats to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_slots_played INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_slots_won NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS biggest_slots_multiplier NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS favorite_slot_game TEXT;

COMMENT ON TABLE slots_leaderboard IS 'Tracks all slot machine spins for leaderboards and competitions';
