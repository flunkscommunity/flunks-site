-- Fixed User Profiles Schema for Locker System
-- This creates the proper schema for automatic locker assignment

-- Create the user_profiles table (run this if you don't have it yet)
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(64) UNIQUE NOT NULL,
  username VARCHAR(32) UNIQUE, -- Removed NOT NULL so users can get lockers first
  discord_id VARCHAR(64),
  email VARCHAR(255),
  locker_number INTEGER UNIQUE, -- Added directly here
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_discord ON user_profiles(discord_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_locker_number ON user_profiles(locker_number);

-- Add constraints (with proper error handling)
DO $$ 
BEGIN
    -- Add username length constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'username_length' 
        AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT username_length CHECK (username IS NULL OR (length(username) >= 3 AND length(username) <= 32));
    END IF;
    
    -- Add username format constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'username_format' 
        AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT username_format CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_-]+$');
    END IF;
END $$;

-- Create sequence for auto-incrementing locker numbers
CREATE SEQUENCE IF NOT EXISTS locker_number_seq START 1;

-- Create function to auto-assign locker numbers
CREATE OR REPLACE FUNCTION assign_locker_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only assign locker number if it's not already set and user has a wallet
    IF NEW.locker_number IS NULL AND NEW.wallet_address IS NOT NULL THEN
        NEW.locker_number = nextval('locker_number_seq');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-assignment
DROP TRIGGER IF EXISTS auto_assign_locker_number ON user_profiles;
CREATE TRIGGER auto_assign_locker_number
    BEFORE INSERT ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION assign_locker_number();

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating timestamps
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for locker assignments
CREATE OR REPLACE VIEW locker_assignments AS
SELECT 
    locker_number,
    username,
    wallet_address,
    discord_id,
    created_at as signup_date,
    CASE 
        WHEN username IS NOT NULL THEN 'Active'
        ELSE 'Reserved'
    END as locker_status
FROM user_profiles 
WHERE locker_number IS NOT NULL
ORDER BY locker_number;

-- Create function to get locker statistics
CREATE OR REPLACE FUNCTION get_locker_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_assigned', COUNT(*),
        'active_lockers', COUNT(*) FILTER (WHERE username IS NOT NULL),
        'reserved_lockers', COUNT(*) FILTER (WHERE username IS NULL),
        'highest_locker_number', COALESCE(MAX(locker_number), 0),
        'next_locker_number', CASE 
            WHEN COUNT(*) = 0 THEN 1 
            ELSE MAX(locker_number) + 1 
        END
    ) INTO result
    FROM user_profiles 
    WHERE locker_number IS NOT NULL;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (optional but recommended)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read any profile
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Allow public read access' 
        AND tablename = 'user_profiles'
    ) THEN
        CREATE POLICY "Allow public read access" ON user_profiles
        FOR SELECT USING (true);
    END IF;
END $$;

-- Policy to allow profile management
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Allow profile management' 
        AND tablename = 'user_profiles'
    ) THEN
        CREATE POLICY "Allow profile management" ON user_profiles
        FOR ALL USING (true);
    END IF;
END $$;

-- Add helpful comments
COMMENT ON COLUMN user_profiles.locker_number IS 'Unique sequential locker number assigned automatically';
COMMENT ON SEQUENCE locker_number_seq IS 'Auto-incrementing sequence for locker numbers';
COMMENT ON FUNCTION assign_locker_number() IS 'Automatically assigns next locker number on insert';
