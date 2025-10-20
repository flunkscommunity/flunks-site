-- Chapter 3: Overachiever Achievement Setup
-- Copy and paste this into the Supabase SQL Editor

-- Insert the GUM source for Chapter 3 Overachiever (required for awardGum function to work)
INSERT INTO gum_sources (
  source_name,
  base_reward,
  cooldown_minutes,
  daily_limit,
  description,
  is_active
)
VALUES (
  'chapter3_overachiever',
  100,
  525600, -- 1 year in minutes (365 * 24 * 60 = 525600)
  NULL, -- No daily limit needed since cooldown prevents duplicates
  'Chapter 3 Overachiever - Profile navigation achievement (ONE-TIME ONLY)',
  true
)
ON CONFLICT (source_name) DO UPDATE SET
  base_reward = EXCLUDED.base_reward,
  cooldown_minutes = EXCLUDED.cooldown_minutes,
  daily_limit = EXCLUDED.daily_limit,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Show confirmation that the source was added
SELECT 
  source_name,
  base_reward,
  description,
  is_active,
  created_at
FROM gum_sources 
WHERE source_name = 'chapter3_overachiever';