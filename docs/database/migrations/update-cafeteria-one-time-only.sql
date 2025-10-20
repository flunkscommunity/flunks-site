-- Update cafeteria gum source to be one-time only (no daily limit)
-- Setting daily_limit to 0 means it can only be claimed once ever per user

UPDATE gum_sources 
SET 
  daily_limit = 0,
  description = 'One-time only gum reward from discovering the high school cafeteria button',
  updated_at = CURRENT_TIMESTAMP
WHERE source_name = 'cafeteria_visit';

-- Show the updated result
SELECT 
  source_name,
  base_reward,
  cooldown_minutes,
  daily_limit,
  description,
  updated_at
FROM gum_sources 
WHERE source_name = 'cafeteria_visit';
