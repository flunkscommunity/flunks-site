-- Add cafeteria gum source for High School semester zero location
-- This allows users to earn GUM by clicking the cafeteria button

INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description, is_active) 
VALUES ('cafeteria_visit', 50, 0, 1, 'One-time gum reward from discovering the high school cafeteria button', true)
ON CONFLICT (source_name) DO UPDATE SET
  base_reward = EXCLUDED.base_reward,
  cooldown_minutes = EXCLUDED.cooldown_minutes,
  daily_limit = EXCLUDED.daily_limit,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- Show the result
SELECT 
  source_name,
  base_reward,
  cooldown_minutes,
  daily_limit,
  description
FROM gum_sources 
WHERE source_name = 'cafeteria_visit';
