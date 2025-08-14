-- Fix Gum System to Work Without Required User Profiles
-- This removes the foreign key constraints that are causing the error

-- First, let's remove the foreign key constraints that require user_profiles
ALTER TABLE gum_transactions DROP CONSTRAINT IF EXISTS fk_gum_transactions_wallet;
ALTER TABLE user_gum_balances DROP CONSTRAINT IF EXISTS fk_gum_balances_wallet;
ALTER TABLE user_gum_cooldowns DROP CONSTRAINT IF EXISTS fk_gum_cooldowns_wallet;

-- Now the gum system can work with any wallet address, even without a profile
-- This allows testing the gum button immediately

-- Let's also check what wallet addresses are in user_profiles
SELECT wallet_address FROM user_profiles ORDER BY created_at DESC LIMIT 10;
