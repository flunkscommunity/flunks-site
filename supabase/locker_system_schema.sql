-- Enhanced User Profiles with Locker Numbers
-- This extends the existing user_profiles table with locker functionality

-- Add locker_number column to existing user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN locker_number INTEGER UNIQUE;

-- Create a sequence for auto-incrementing locker numbers starting from 1
CREATE SEQUENCE locker_number_seq START 1;

-- Create a function to assign the next available locker number
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

-- Create trigger to automatically assign locker numbers on insert
CREATE TRIGGER auto_assign_locker_number
    BEFORE INSERT ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION assign_locker_number();

-- Create indexes for locker number lookups
CREATE INDEX idx_user_profiles_locker_number ON user_profiles(locker_number);

-- Create a view for locker assignments with useful info
CREATE VIEW locker_assignments AS
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

-- Create a function to get the next locker number that will be assigned
CREATE OR REPLACE FUNCTION get_next_locker_number()
RETURNS INTEGER AS $$
BEGIN
    RETURN currval('locker_number_seq') + 1;
EXCEPTION
    WHEN OBJECT_NOT_IN_PREREQUISITE_STATE THEN
        RETURN 1; -- If sequence hasn't been used yet, return 1
END;
$$ LANGUAGE plpgsql;

-- Create a function to get locker statistics
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

-- Add some useful comments
COMMENT ON COLUMN user_profiles.locker_number IS 'Unique sequential locker number assigned to each user';
COMMENT ON SEQUENCE locker_number_seq IS 'Auto-incrementing sequence for locker number assignment';
COMMENT ON VIEW locker_assignments IS 'View showing all locker assignments with status';
COMMENT ON FUNCTION assign_locker_number() IS 'Automatically assigns next available locker number to new users';
COMMENT ON FUNCTION get_locker_stats() IS 'Returns JSON with locker assignment statistics';

-- Insert some example data if needed (remove this in production)
-- INSERT INTO user_profiles (wallet_address, username) VALUES 
-- ('0x1234...', 'alice'),
-- ('0x5678...', 'bob'),
-- ('0x9abc...', 'charlie');
