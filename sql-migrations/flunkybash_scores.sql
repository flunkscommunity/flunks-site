-- Flunky Bash Scores Table
-- Run this in Supabase SQL Editor to create the leaderboard table

CREATE TABLE IF NOT EXISTS flunkybash_scores (
  id SERIAL PRIMARY KEY,
  wallet TEXT NOT NULL,
  score INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_flunkybash_wallet ON flunkybash_scores(wallet);
CREATE INDEX IF NOT EXISTS idx_flunkybash_score ON flunkybash_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_flunkybash_timestamp ON flunkybash_scores(timestamp DESC);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE flunkybash_scores ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert scores
CREATE POLICY "Allow insert for all" ON flunkybash_scores
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read scores
CREATE POLICY "Allow read for all" ON flunkybash_scores
  FOR SELECT USING (true);

-- Comment the table
COMMENT ON TABLE flunkybash_scores IS 'Stores high scores for the Flunky Bash launcher game';
