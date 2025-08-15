-- ⚠️ ADMIN ONLY: Run this script in Supabase SQL Editor with elevated privileges
-- This adds the missing 'locker_jacket' gum source that's needed for the locker system

-- Add the locker_jacket gum source
INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description, is_active) 
VALUES ('locker_jacket', 3, 300, 15, 'Gum earned from clicking button in locker jacket section', true)
ON CONFLICT (source_name) DO UPDATE SET
  base_reward = EXCLUDED.base_reward,
  cooldown_minutes = EXCLUDED.cooldown_minutes,
  daily_limit = EXCLUDED.daily_limit,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

-- Verify the source was added
SELECT source_name, base_reward, cooldown_minutes, daily_limit, description, is_active
FROM gum_sources 
WHERE source_name = 'locker_jacket';

-- Show all gum sources for verification
SELECT source_name, base_reward, cooldown_minutes, daily_limit, description, is_active
FROM gum_sources 
ORDER BY source_name;
