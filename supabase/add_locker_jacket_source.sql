-- Add missing locker_jacket gum source
-- This source is used when clicking the gum button in the locker system

INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description) 
VALUES ('locker_jacket', 3, 300, 15, 'Gum earned from clicking button in locker jacket section')
ON CONFLICT (source_name) DO UPDATE SET
  base_reward = EXCLUDED.base_reward,
  cooldown_minutes = EXCLUDED.cooldown_minutes,
  daily_limit = EXCLUDED.daily_limit,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- Verify the source was added
SELECT source_name, base_reward, cooldown_minutes, daily_limit, description 
FROM gum_sources 
WHERE source_name = 'locker_jacket';
