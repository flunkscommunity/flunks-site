-- Fix Daily Login GUM System
-- Update daily_login configuration to match what the app expects

-- Check current daily_login configuration
SELECT * FROM gum_sources WHERE source_name = 'daily_login';

-- Update daily_login to give 15 GUM as the app expects
UPDATE gum_sources 
SET 
  base_reward = 15,
  cooldown_minutes = 1440, -- 24 hours
  daily_limit = 15, -- Match the base_reward
  description = 'Daily login bonus - 15 GUM per day',
  updated_at = CURRENT_TIMESTAMP,
  is_active = true
WHERE source_name = 'daily_login';

-- Check if we have any stuck cooldown records
SELECT 
  wallet_address,
  source_name,
  last_earned_at,
  daily_earned_amount,
  daily_reset_date,
  CURRENT_DATE as today,
  EXTRACT(EPOCH FROM (NOW() - last_earned_at))/60 as minutes_since_last_earn,
  CASE 
    WHEN daily_reset_date::date < CURRENT_DATE THEN 'NEW DAY - CAN CLAIM'
    WHEN daily_reset_date::date = CURRENT_DATE AND daily_earned_amount >= 15 THEN 'DAILY LIMIT REACHED'
    WHEN EXTRACT(EPOCH FROM (NOW() - last_earned_at))/60 < 1440 THEN 'STILL IN COOLDOWN'
    ELSE 'CAN CLAIM'
  END as status
FROM user_gum_cooldowns 
WHERE source_name = 'daily_login'
ORDER BY last_earned_at DESC
LIMIT 5;

-- Fix any daily_reset_date issues by resetting old records to current date
UPDATE user_gum_cooldowns 
SET 
  daily_reset_date = CURRENT_DATE,
  daily_earned_amount = 0
WHERE source_name = 'daily_login' 
  AND daily_reset_date::date < CURRENT_DATE;

-- For immediate testing: Reset your specific wallet (uncomment if needed)
-- UPDATE user_gum_cooldowns 
-- SET 
--   daily_reset_date = CURRENT_DATE - INTERVAL '1 day',
--   daily_earned_amount = 0
-- WHERE source_name = 'daily_login' 
--   AND wallet_address = '0xe327216d843357f1';

-- Verify the fix
SELECT 
  gs.source_name,
  gs.base_reward,
  gs.cooldown_minutes,
  gs.daily_limit,
  gs.is_active,
  gs.description,
  COUNT(uc.wallet_address) as users_with_cooldowns
FROM gum_sources gs
LEFT JOIN user_gum_cooldowns uc ON gs.source_name = uc.source_name
WHERE gs.source_name = 'daily_login'
GROUP BY gs.id, gs.source_name, gs.base_reward, gs.cooldown_minutes, gs.daily_limit, gs.is_active, gs.description;
