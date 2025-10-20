-- Verify Chapter 4 Slacker (Homecoming Dance) setup
-- This file contains queries to check if the homecoming dance system is properly configured

-- 1. Check if user_gum_transactions table exists and has the right structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_gum_transactions'
ORDER BY ordinal_position;

-- 2. Check for any existing Chapter 4 Slacker transactions
SELECT 
    wallet_address,
    amount,
    source,
    description,
    created_at
FROM user_gum_transactions
WHERE source = 'chapter4_homecoming_dance'
ORDER BY created_at DESC
LIMIT 10;

-- 3. Count total Chapter 4 Slacker participants
SELECT 
    COUNT(DISTINCT wallet_address) as unique_participants,
    SUM(amount) as total_gum_awarded,
    COUNT(*) as total_transactions
FROM user_gum_transactions
WHERE source = 'chapter4_homecoming_dance';

-- 4. Check recent homecoming dance activity (last 24 hours)
SELECT 
    wallet_address,
    amount,
    description,
    created_at,
    user_agent
FROM user_gum_transactions
WHERE source = 'chapter4_homecoming_dance'
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 5. Verify Saturday 5 PM timing is working (check if any transactions happened today)
SELECT 
    wallet_address,
    amount,
    created_at,
    EXTRACT(DOW FROM created_at) as day_of_week, -- 6 = Saturday, 0 = Sunday
    EXTRACT(HOUR FROM created_at) as hour_of_day
FROM user_gum_transactions
WHERE source = 'chapter4_homecoming_dance'
  AND DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- Expected results:
-- - Day of week should be 6 (Saturday) with hour >= 17 (5 PM) OR day 0 (Sunday) with hour < 12
-- - Amount should be 50 GUM for each transaction
-- - Source should be 'chapter4_homecoming_dance'
-- - Description should be 'Chapter 4 Slacker - Homecoming Dance attendance'