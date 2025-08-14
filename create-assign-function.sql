-- Function to manually assign next available locker to an existing user
-- This is needed for the assign-locker API endpoint
CREATE OR REPLACE FUNCTION assign_next_locker(user_wallet TEXT)
RETURNS INTEGER AS $$
DECLARE
    next_locker INTEGER;
    user_exists BOOLEAN;
BEGIN
    -- Check if user exists
    SELECT EXISTS(
        SELECT 1 FROM user_profiles 
        WHERE wallet_address = user_wallet
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        RAISE EXCEPTION 'User with wallet % not found', user_wallet;
    END IF;
    
    -- Get the next locker number from sequence
    SELECT nextval('locker_number_seq') INTO next_locker;
    
    -- Update the user with the new locker number
    UPDATE user_profiles 
    SET 
        locker_number = next_locker,
        updated_at = NOW()
    WHERE wallet_address = user_wallet;
    
    -- Check if update was successful
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Failed to update user with wallet %', user_wallet;
    END IF;
    
    -- Return the assigned locker number
    RETURN next_locker;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to anon role (needed for API calls)
GRANT EXECUTE ON FUNCTION assign_next_locker(TEXT) TO anon;
