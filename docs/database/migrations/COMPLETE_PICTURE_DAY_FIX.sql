-- 🔧 COMPREHENSIVE PICTURE DAY VOTING GUM FIX
-- Run this SQL to fix the Picture Day voting rewards system

-- Step 1: Add the missing gum source
INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description, is_active) VALUES
('picture_day_voting', 50, 0, 1, 'Reward for completing Picture Day voting objective - The Slacker (Chapter 3)', true)
ON CONFLICT (source_name) DO UPDATE SET
  base_reward = EXCLUDED.base_reward,
  cooldown_minutes = EXCLUDED.cooldown_minutes,
  daily_limit = EXCLUDED.daily_limit,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

-- Step 2: Get stats on who voted and who got rewards
SELECT 
  'Picture Day Voters' as category,
  COUNT(DISTINCT user_wallet) as count
FROM picture_day_votes

UNION ALL

SELECT 
  'Already Rewarded' as category,
  COUNT(DISTINCT wallet_address) as count
FROM gum_transactions 
WHERE source = 'picture_day_voting'

UNION ALL

SELECT 
  'Needs Reward' as category,
  COUNT(*) as count
FROM (
  SELECT DISTINCT user_wallet 
  FROM picture_day_votes 
  WHERE user_wallet NOT IN (
    SELECT DISTINCT wallet_address 
    FROM gum_transactions 
    WHERE source = 'picture_day_voting'
  )
) as needs_reward;

-- Step 3: Show who needs retroactive rewards (for manual processing)
SELECT 
  user_wallet,
  MIN(created_at) as first_vote_time,
  COUNT(*) as total_votes
FROM picture_day_votes 
WHERE user_wallet NOT IN (
  SELECT DISTINCT wallet_address 
  FROM gum_transactions 
  WHERE source = 'picture_day_voting'
)
GROUP BY user_wallet
ORDER BY first_vote_time;

-- Step 4: If you want to manually award GUM to existing voters, use this template:
-- SELECT award_gum('WALLET_ADDRESS_HERE', 'picture_day_voting', '{"retroactive": true, "objective": "slacker_chapter3"}');

-- Verification: Check that the source exists
SELECT * FROM gum_sources WHERE source_name = 'picture_day_voting';