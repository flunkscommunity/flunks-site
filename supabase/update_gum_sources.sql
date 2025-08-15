-- Update Gum Sources Script
-- This will force update the gum source configurations to your new values

-- First, let's see what's currently in the table
SELECT * FROM gum_sources;

-- Update the gum sources with new values (this will work even if the INSERT...ON CONFLICT didn't)
UPDATE gum_sources 
SET 
  base_reward = 5,
  cooldown_minutes = 360,  -- 6 hours
  daily_limit = 20,
  description = 'Floating gum button clicks',
  updated_at = CURRENT_TIMESTAMP
WHERE source_name = 'floating_button';

UPDATE gum_sources 
SET 
  base_reward = 10,
  cooldown_minutes = 1440, -- 24 hours  
  daily_limit = 10,
  description = 'Daily login bonus',
  updated_at = CURRENT_TIMESTAMP
WHERE source_name = 'daily_login';

UPDATE gum_sources 
SET 
  base_reward = 50,
  cooldown_minutes = 0,
  daily_limit = 50,
  description = 'Special event rewards',
  updated_at = CURRENT_TIMESTAMP
WHERE source_name = 'special_event';

-- Remove the feature_usage source if it exists (since you wanted it removed)
DELETE FROM gum_sources WHERE source_name = 'feature_usage';

-- Insert any missing sources (in case they don't exist)
INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description) 
VALUES ('floating_button', 5, 360, 20, 'Floating gum button clicks')
ON CONFLICT (source_name) DO NOTHING;

INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description) 
VALUES ('daily_login', 10, 1440, 10, 'Daily login bonus')
ON CONFLICT (source_name) DO NOTHING;

INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description) 
VALUES ('special_event', 50, 0, 50, 'Special event rewards')
ON CONFLICT (source_name) DO NOTHING;

INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description) 
VALUES ('locker_jacket', 3, 300, 15, 'Gum earned from clicking button in locker jacket section')
ON CONFLICT (source_name) DO NOTHING;

-- Verify the updates
SELECT source_name, base_reward, cooldown_minutes, daily_limit, description, updated_at 
FROM gum_sources 
ORDER BY source_name;
