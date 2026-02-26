-- ============================================
-- Pool Game Matchbook Special Item
-- Awarded when a player defeats The Wizard
-- ============================================

-- Table to track matchbook obtainment
CREATE TABLE IF NOT EXISTS pool_game_matchbook (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opponent_defeated TEXT DEFAULT 'medium',
  user_agent TEXT,
  ip_address TEXT,
  UNIQUE(wallet_address)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_pool_matchbook_wallet ON pool_game_matchbook(wallet_address);

-- Create a view for the locker system to query (bypasses RLS)
CREATE OR REPLACE VIEW wallet_pool_matchbook AS
SELECT DISTINCT wallet_address
FROM pool_game_matchbook;

-- Grant access
GRANT SELECT ON wallet_pool_matchbook TO authenticated;
GRANT SELECT ON wallet_pool_matchbook TO anon;

-- Documentation
COMMENT ON TABLE pool_game_matchbook IS 'Tracks which wallets have earned the Four Thieves Matchbook by defeating The Wizard in pool';
