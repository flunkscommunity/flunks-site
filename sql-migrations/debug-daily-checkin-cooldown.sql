-- Debug script to check and fix daily_checkin cooldown issues
-- Run this in Supabase SQL Editor

-- Step 1: Check the gum_sources configuration for daily_checkin
SELECT 
  source_name,
  base_reward,
  cooldown_minutes,
  daily_limit,
  is_active,
  description
FROM gum_sources 
WHERE source_name IN ('daily_checkin', 'daily_login');

-- Step 2: Check YOUR specific cooldown record (replace with your wallet)
-- Find records that might be stuck
SELECT 
  wallet_address,
  source_name,
  daily_earned_amount,
  daily_reset_date,
  last_earned_at,
  CURRENT_DATE as db_current_date,
  CURRENT_TIMESTAMP as db_current_timestamp,
  (daily_reset_date < CURRENT_DATE) as should_be_reset,
  (daily_reset_date = CURRENT_DATE AND daily_earned_amount > 0) as already_claimed_today
FROM user_gum_cooldowns
WHERE source_name IN ('daily_checkin', 'daily_login')
ORDER BY last_earned_at DESC
LIMIT 20;

-- Step 3: OPTIONAL - Reset a specific wallet's daily_checkin cooldown for testing
-- Uncomment and replace YOUR_WALLET_ADDRESS with your actual wallet
/*
UPDATE user_gum_cooldowns 
SET 
  daily_earned_amount = 0,
  daily_reset_date = CURRENT_DATE - INTERVAL '1 day'  -- Set to yesterday so it triggers reset
WHERE wallet_address = 'YOUR_WALLET_ADDRESS'
  AND source_name = 'daily_checkin';
*/

-- Step 4: Verify the gum_sources has correct settings
-- daily_checkin should have cooldown_minutes = 0 (we use calendar day logic, not rolling cooldown)
UPDATE gum_sources 
SET cooldown_minutes = 0,
    description = 'Daily check-in bonus (resets at midnight UTC)'
WHERE source_name = 'daily_checkin'
  AND cooldown_minutes != 0;

-- Also fix daily_login if needed
UPDATE gum_sources 
SET cooldown_minutes = 0,
    description = 'Daily login bonus (resets at midnight UTC)'
WHERE source_name = 'daily_login'
  AND cooldown_minutes != 0;

-- Step 5: Show the database timezone setting
SHOW timezone;
SELECT NOW(), CURRENT_DATE, CURRENT_TIMESTAMP;
