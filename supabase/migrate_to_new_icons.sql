-- Migration: Update all existing profiles to use new emoji icon system
-- Run this script to upgrade existing users to the new profile icon system

BEGIN;

-- Step 1: Add profile_icon column if it doesn't exist
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

-- Step 2: Update all users to use new default emoji icon
-- This includes users with NULL, empty, or old icon values
UPDATE user_profiles 
SET profile_icon = '🤓',
    updated_at = CURRENT_TIMESTAMP
WHERE profile_icon IS NULL 
   OR profile_icon = '' 
   OR profile_icon = '🎭'  -- Old default
   OR profile_icon LIKE '%FlunkBot%'  -- Old image-based icons
   OR profile_icon LIKE '%/images/%'; -- Any old image paths

-- Step 3: Show users that were updated
SELECT 
    COUNT(*) as users_updated,
    '🤓' as new_default_icon
FROM user_profiles 
WHERE profile_icon = '🤓';

-- Step 4: Show current user distribution by icon
SELECT 
    profile_icon,
    COUNT(*) as user_count
FROM user_profiles 
GROUP BY profile_icon 
ORDER BY user_count DESC;

COMMIT;

-- Final status check
SELECT 
    'Migration completed!' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN profile_icon IS NOT NULL AND profile_icon != '' THEN 1 END) as users_with_icons
FROM user_profiles;
