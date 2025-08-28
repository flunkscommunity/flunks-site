-- Combined migration for cafeteria gum source and profile icon updates
-- Run this to apply both the cafeteria button gum rewards and profile icon migration

BEGIN;

-- 1. Add cafeteria gum source
INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description, is_active) 
VALUES ('cafeteria_visit', 50, 0, 1, 'One-time gum reward from discovering the high school cafeteria button', true)
ON CONFLICT (source_name) DO UPDATE SET
  base_reward = EXCLUDED.base_reward,
  cooldown_minutes = EXCLUDED.cooldown_minutes,
  daily_limit = EXCLUDED.daily_limit,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- 2. Add profile_icon column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'profile_icon'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN profile_icon VARCHAR(10) DEFAULT '🤓';
        RAISE NOTICE 'Added profile_icon column to user_profiles table';
    ELSE
        RAISE NOTICE 'profile_icon column already exists';
    END IF;
END $$;

-- 3. Update all users to use new default emoji icon
UPDATE user_profiles 
SET profile_icon = '🤓',
    updated_at = CURRENT_TIMESTAMP
WHERE profile_icon IS NULL 
   OR profile_icon = '' 
   OR profile_icon = '🎭'  -- Old default
   OR profile_icon LIKE '%FlunkBot%'  -- Old image-based icons
   OR profile_icon LIKE '%/images/%'; -- Any old image paths

COMMIT;

-- Show results
SELECT 
    'Migration completed!' as status,
    (SELECT COUNT(*) FROM gum_sources WHERE source_name = 'cafeteria_visit') as cafeteria_source_created,
    (SELECT COUNT(*) FROM user_profiles WHERE profile_icon = '🤓') as users_with_new_icons;
