-- Migration: Add profile_icon column to user_profiles table
-- This adds support for user profile icons that appear next to usernames

ALTER TABLE user_profiles 
ADD COLUMN profile_icon VARCHAR(10) DEFAULT '🎭';

-- Set a default icon for existing users who don't have one
UPDATE user_profiles 
SET profile_icon = '🎭' 
WHERE profile_icon IS NULL;

-- Add a comment to document the column
COMMENT ON COLUMN user_profiles.profile_icon IS 'Emoji icon that appears next to username on leaderboards and throughout the site';
