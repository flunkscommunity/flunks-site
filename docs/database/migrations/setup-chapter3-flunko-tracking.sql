-- Chapter 3 Overachiever: Flunko Click Achievement Setup
-- This sets up proper tracking for clicking Flunko friends to complete Chapter 3 Overachiever

-- First, ensure the gum_sources table has the correct entry for Chapter 3
INSERT INTO gum_sources (source_name, gum_amount, cooldown_minutes, description) 
VALUES ('chapter3_overachiever', 100, 525600, 'Chapter 3 Overachiever - Click on Flunko from any clique profile')
ON CONFLICT (source_name) DO UPDATE SET
  gum_amount = EXCLUDED.gum_amount,
  cooldown_minutes = EXCLUDED.cooldown_minutes,
  description = EXCLUDED.description;

-- Create a specific tracking table for Flunko clicks if it doesn't exist
CREATE TABLE IF NOT EXISTS flunko_clicks (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(50) NOT NULL,
  clicked_from_clique VARCHAR(50) NOT NULL,
  target_clique VARCHAR(50) NOT NULL,
  clicked_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  UNIQUE(wallet_address) -- Only one click per user for achievement
);

-- Enable Row Level Security
ALTER TABLE flunko_clicks ENABLE ROW LEVEL SECURITY;

-- Create policy for reading flunko clicks
CREATE POLICY "Allow read flunko clicks" ON flunko_clicks FOR SELECT USING (true);

-- Create policy for inserting flunko clicks
CREATE POLICY "Allow insert flunko clicks" ON flunko_clicks FOR INSERT WITH CHECK (true);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_flunko_clicks_wallet ON flunko_clicks(wallet_address);

-- Insert a test record to verify the table structure
INSERT INTO flunko_clicks (wallet_address, clicked_from_clique, target_clique, metadata)
VALUES ('0x50b39b127236f46a', 'the-freaks', 'flunko', '{"test": true, "description": "Test Flunko click for Chapter 3"}')
ON CONFLICT (wallet_address) DO NOTHING;

SELECT 'Chapter 3 Flunko Click tracking setup complete!' as message;