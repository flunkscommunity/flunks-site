-- Remove favorite_flunk_data column from user_profiles table
-- This removes the favorite flunk feature completely from the database

-- Drop the column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'favorite_flunk_data'
    ) THEN
        ALTER TABLE user_profiles DROP COLUMN favorite_flunk_data;
        RAISE NOTICE 'Removed favorite_flunk_data column from user_profiles table';
    ELSE
        RAISE NOTICE 'favorite_flunk_data column does not exist in user_profiles table';
    END IF;
END $$;
