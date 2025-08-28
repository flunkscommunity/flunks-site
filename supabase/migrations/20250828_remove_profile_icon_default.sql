-- Migration: Remove DEFAULT constraint from profile_icon column
-- This ensures user-selected icons are preserved instead of reverting to default

BEGIN;

-- Remove the DEFAULT constraint from profile_icon column
ALTER TABLE user_profiles 
ALTER COLUMN profile_icon DROP DEFAULT;

-- Add comment to document why we removed the default
COMMENT ON COLUMN user_profiles.profile_icon IS 'User selected emoji icon - no default to preserve user choice';

COMMIT;
