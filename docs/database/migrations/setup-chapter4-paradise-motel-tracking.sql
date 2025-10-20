-- Chapter 4 Overachiever: Paradise Motel Terminal Achievement Setup
-- This sets up proper tracking for entering "paradise motel" terminal command to complete Chapter 4 Overachiever

-- First, ensure the gum_sources table has the correct entry for Chapter 4
INSERT INTO gum_sources (source_name, gum_amount, cooldown_minutes, description) 
VALUES ('chapter4_paradise_motel_code', 100, 525600, 'Chapter 4 Overachiever - Enter paradise motel terminal command')
ON CONFLICT (source_name) DO UPDATE SET
  gum_amount = EXCLUDED.gum_amount,
  cooldown_minutes = EXCLUDED.cooldown_minutes,
  description = EXCLUDED.description;

-- Create a specific tracking table for paradise motel entries if it doesn't exist
CREATE TABLE IF NOT EXISTS paradise_motel_entries (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(50) NOT NULL,
  command_entered VARCHAR(100) NOT NULL DEFAULT 'paradise motel',
  entered_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  username VARCHAR(50),
  metadata JSONB,
  UNIQUE(wallet_address) -- Only one entry per user for achievement
);

-- Enable Row Level Security
ALTER TABLE paradise_motel_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for reading paradise motel entries
CREATE POLICY "Allow read paradise motel entries" ON paradise_motel_entries FOR SELECT USING (true);

-- Create policy for inserting paradise motel entries
CREATE POLICY "Allow insert paradise motel entries" ON paradise_motel_entries FOR INSERT WITH CHECK (true);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_paradise_motel_wallet ON paradise_motel_entries(wallet_address);

-- Insert a test record to verify the table structure
INSERT INTO paradise_motel_entries (wallet_address, command_entered, metadata)
VALUES ('0x50b39b127236f46a', 'paradise motel', '{"test": true, "description": "Test Paradise Motel entry for Chapter 4"}')
ON CONFLICT (wallet_address) DO NOTHING;

SELECT 'Chapter 4 Paradise Motel tracking setup complete!' as message;