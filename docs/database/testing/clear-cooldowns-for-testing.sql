-- Clear cooldown for testing Chapter 3 Overachiever
-- This allows you to test the achievement again

-- Clear the cooldown record for your wallet
DELETE FROM user_gum_cooldowns 
WHERE wallet_address = '0x50b39b127236f46a' 
AND source_name = 'chapter3_overachiever';

-- Also clear Paradise Motel cooldown if it exists
DELETE FROM user_gum_cooldowns 
WHERE wallet_address = '0x50b39b127236f46a' 
AND source_name = 'chapter4_paradise_motel_code';

-- Show what was deleted
SELECT 'Cooldowns cleared for wallet 0x50b39b127236f46a' as message;