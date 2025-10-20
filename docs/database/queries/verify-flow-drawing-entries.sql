-- Verify Flow Drawing entries system
-- This file contains queries to check if the Flow Drawing entry system is working

-- 1. Check if flow_drawing_entries table exists and has the right structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'flow_drawing_entries'
ORDER BY ordinal_position;

-- 2. Check all Flow Drawing entries
SELECT 
    wallet_address,
    username,
    entry_timestamp,
    created_at,
    ip_address,
    user_agent
FROM flow_drawing_entries
ORDER BY created_at DESC;

-- 3. Count total Flow Drawing participants
SELECT 
    COUNT(*) as total_entries,
    COUNT(DISTINCT wallet_address) as unique_wallets,
    COUNT(DISTINCT ip_address) as unique_ips
FROM flow_drawing_entries;

-- 4. Check recent Flow Drawing activity (last 24 hours)
SELECT 
    wallet_address,
    username,
    entry_timestamp,
    user_agent
FROM flow_drawing_entries
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 5. Find duplicate wallet attempts (should be prevented by unique constraint)
SELECT 
    wallet_address,
    COUNT(*) as entry_count
FROM flow_drawing_entries
GROUP BY wallet_address
HAVING COUNT(*) > 1;

-- 6. Check entries by hour to see activity patterns
SELECT 
    DATE_TRUNC('hour', entry_timestamp) as hour,
    COUNT(*) as entries
FROM flow_drawing_entries
WHERE entry_timestamp >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', entry_timestamp)
ORDER BY hour DESC;

-- Expected results:
-- - Each wallet_address should appear only once (unique constraint)
-- - Username should default to 'Anonymous' if not provided
-- - entry_timestamp should be when user clicked the button
-- - No duplicate entries should exist