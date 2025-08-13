-- Function to assign next available locker to an existing user
CREATE OR REPLACE FUNCTION assign_next_locker(user_wallet TEXT)
RETURNS INTEGER AS $$
DECLARE
    next_locker INTEGER;
BEGIN
    -- Get the next locker number from sequence
    SELECT nextval('locker_number_seq') INTO next_locker;
    
    -- Update the user with the new locker number
    UPDATE user_profiles 
    SET 
        locker_number = next_locker,
        updated_at = NOW()
    WHERE wallet_address = user_wallet;
    
    -- Return the assigned locker number
    RETURN next_locker;
END;
$$ LANGUAGE plpgsql;
