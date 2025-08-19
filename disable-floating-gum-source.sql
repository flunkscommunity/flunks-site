-- Update gum sources to disable floating_button and modify others
-- This script disables the floating gum button and updates the system

-- Disable floating button
UPDATE gum_sources 
SET is_active = false, 
    description = 'Floating gum button clicks (DISABLED)',
    updated_at = CURRENT_TIMESTAMP
WHERE source_name = 'floating_button';

-- Update daily_login to be more generous since it's automatic
UPDATE gum_sources 
SET base_reward = 15,
    description = 'Automatic daily login bonus',
    updated_at = CURRENT_TIMESTAMP
WHERE source_name = 'daily_login';

-- Update special_event to be more generous
UPDATE gum_sources 
SET base_reward = 100,
    description = 'Special event and promotional rewards',
    updated_at = CURRENT_TIMESTAMP
WHERE source_name = 'special_event';

-- Keep locker_jacket as is since it's interactive
-- UPDATE gum_sources 
-- SET description = 'Gum earned from locker customization interactions'
-- WHERE source_name = 'locker_jacket';

-- Show updated sources
SELECT source_name, base_reward, cooldown_minutes, daily_limit, description, is_active
FROM gum_sources 
ORDER BY source_name;
