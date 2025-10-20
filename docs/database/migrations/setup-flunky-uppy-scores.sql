-- Flunky Uppy Scores Table Setup
-- Run this in your Supabase SQL Editor

-- Create the flunky_uppy_scores table
CREATE TABLE IF NOT EXISTS public.flunky_uppy_scores (
  id BIGSERIAL PRIMARY KEY,
  wallet TEXT NOT NULL,
  score INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flunky_uppy_scores_wallet ON public.flunky_uppy_scores(wallet);
CREATE INDEX IF NOT EXISTS idx_flunky_uppy_scores_score ON public.flunky_uppy_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_flunky_uppy_scores_timestamp ON public.flunky_uppy_scores(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_flunky_uppy_scores_wallet_score ON public.flunky_uppy_scores(wallet, score DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.flunky_uppy_scores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access" ON public.flunky_uppy_scores;
DROP POLICY IF EXISTS "Allow public insert access" ON public.flunky_uppy_scores;

-- Policy to allow anyone to read scores (for leaderboard)
CREATE POLICY "Allow public read access" ON public.flunky_uppy_scores
  FOR SELECT
  TO public
  USING (true);

-- Policy to allow anyone to insert scores (for score submission)
CREATE POLICY "Allow public insert access" ON public.flunky_uppy_scores
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.flunky_uppy_scores TO anon;
GRANT SELECT, INSERT ON public.flunky_uppy_scores TO authenticated;

-- Grant usage on the sequence for auto-incrementing IDs
GRANT USAGE ON SEQUENCE public.flunky_uppy_scores_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.flunky_uppy_scores_id_seq TO authenticated;

-- Optional: Add a comment to the table
COMMENT ON TABLE public.flunky_uppy_scores IS 'Stores high scores for the Flunky Uppy jumping game';

-- Sample data structure (for reference)
/*
Example row:
{
  "id": 1,
  "wallet": "0x1234567890abcdef",
  "score": 150,
  "timestamp": "2025-09-19T12:00:00Z",
  "metadata": {
    "game": "flunky_uppy",
    "username": "PlayerName",
    "submitted_at": "2025-09-19T12:00:00Z",
    "user_agent": "Mozilla/5.0...",
    "ip": "192.168.1.1"
  },
  "created_at": "2025-09-19T12:00:00Z"
}
*/