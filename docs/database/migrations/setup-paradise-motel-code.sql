-- Chapter 4: Paradise Motel Terminal Code Setup
-- Copy and paste this into the Supabase SQL Editor

-- Insert the paradise motel terminal code into valid_terminal_codes table
-- First, let's check if the table exists and create it if needed
CREATE TABLE IF NOT EXISTS valid_terminal_codes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  reward_source TEXT, -- Links to gum_transactions source field
  reward_amount INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_valid_terminal_codes_code ON valid_terminal_codes(code);
CREATE INDEX IF NOT EXISTS idx_valid_terminal_codes_active ON valid_terminal_codes(active);

-- Insert the GUM source for Paradise Motel (required for awardGum function to work)
INSERT INTO gum_sources (
  source_name,
  base_reward,
  cooldown_minutes,
  daily_limit,
  description,
  is_active
)
VALUES (
  'chapter4_paradise_motel_code',
  100,
  525600, -- 1 year in minutes (365 * 24 * 60 = 525600)
  NULL, -- No daily limit needed since cooldown prevents duplicates
  'Chapter 4 Overachiever - Paradise Motel terminal code discovery (ONE-TIME ONLY)',
  true
)
ON CONFLICT (source_name) DO UPDATE SET
  base_reward = EXCLUDED.base_reward,
  cooldown_minutes = EXCLUDED.cooldown_minutes,
  daily_limit = EXCLUDED.daily_limit,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Insert the paradise motel code
INSERT INTO valid_terminal_codes (
  code, 
  description, 
  reward_source, 
  reward_amount, 
  active
) 
VALUES (
  'paradise motel',
  'Chapter 4 Overachiever - First location to search for Flunko',
  'chapter4_paradise_motel_code',
  100,
  true
) 
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  reward_source = EXCLUDED.reward_source,
  reward_amount = EXCLUDED.reward_amount,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Create a function to handle the paradise motel terminal code validation
CREATE OR REPLACE FUNCTION validate_paradise_motel_code(input_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the code matches (case insensitive)
  RETURN LOWER(TRIM(input_code)) = 'paradise motel';
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON TABLE valid_terminal_codes IS 'Stores valid terminal codes that users can enter to unlock rewards and achievements';
COMMENT ON FUNCTION validate_paradise_motel_code IS 'Validates if the entered terminal code is the paradise motel code for Chapter 4';

-- Show confirmation that the code was added
SELECT 
  code, 
  description, 
  reward_source, 
  reward_amount, 
  active, 
  created_at
FROM valid_terminal_codes 
WHERE code = 'paradise motel';