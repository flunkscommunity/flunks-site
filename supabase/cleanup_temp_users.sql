-- Clean up temporary/auto-generated users so the new system can work properly
-- This removes users with auto-generated usernames like "user_84335f1"

DELETE FROM user_profiles 
WHERE username LIKE 'user_%' 
  AND length(username) = 12; -- Auto-generated usernames are exactly 12 characters: user_ + 8 chars

-- Show remaining users
SELECT 
  wallet_address,
  username,
  locker_number,
  created_at
FROM user_profiles
ORDER BY created_at DESC;
