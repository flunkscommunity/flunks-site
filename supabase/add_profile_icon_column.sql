-- Migration: Add profile_icon column to user_profiles table
-- This adds support for user profile icons that appear next to usernames

-- Add profile_icon column if it doesn't exist (safe migration)
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

-- Set a default icon for existing users who don't have one or have the old default
UPDATE user_profiles 
SET profile_icon = '🤓' 
WHERE profile_icon IS NULL OR profile_icon = '' OR profile_icon = '🎭';

-- Add a comment to document the column
COMMENT ON COLUMN user_profiles.profile_icon IS 'Emoji icon that appears next to username on leaderboards and throughout the site';

-- Show current state to verify
SELECT 
    username, 
    profile_icon,
    updated_at
FROM user_profiles 
ORDER BY updated_at DESC 
LIMIT 5;
