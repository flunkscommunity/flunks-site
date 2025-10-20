-- 🎯 RETROACTIVE GUM AWARDS FOR EXISTING PICTURE DAY VOTERS
-- This will award 50 GUM to everyone who voted but hasn't received their reward yet

-- First, ensure the gum source exists
INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description, is_active) VALUES
('picture_day_voting', 50, 0, 1, 'Reward for completing Picture Day voting objective - The Slacker (Chapter 3)', true)
ON CONFLICT (source_name) DO UPDATE SET
  base_reward = EXCLUDED.base_reward,
  updated_at = CURRENT_TIMESTAMP;

-- Award GUM to all voters who haven't received it yet
-- This finds everyone who voted but has no picture_day_voting transaction
WITH first_time_voters AS (
  SELECT DISTINCT user_wallet
  FROM picture_day_votes 
  WHERE user_wallet NOT IN (
    SELECT DISTINCT wallet_address 
    FROM gum_transactions 
    WHERE source = 'picture_day_voting'
  )
)
SELECT 
  user_wallet,
  'Run this: SELECT award_gum(''' || user_wallet || ''', ''picture_day_voting'', ''{"retroactive": true, "objective": "slacker_chapter3"}'');' as command
FROM first_time_voters;