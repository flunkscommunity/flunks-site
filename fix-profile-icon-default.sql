-- Fix profile icon default issue
-- Remove the DEFAULT constraint so user-selected icons are preserved

-- Remove the DEFAULT constraint from profile_icon column
ALTER TABLE user_profiles 
ALTER COLUMN profile_icon DROP DEFAULT;

-- Show current table structure
\d user_profiles;
