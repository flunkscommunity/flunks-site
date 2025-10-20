-- Query to see all users who have obtained the Room 7 key
-- Use this to get the list of wallets for airdrops

SELECT 
  wallet_address,
  obtained_at,
  obtained_at AT TIME ZONE 'America/New_York' as obtained_at_est,
  user_agent,
  ip_address
FROM paradise_motel_room7_keys
ORDER BY obtained_at DESC;

-- Count total keys obtained
SELECT COUNT(*) as total_keys_obtained
FROM paradise_motel_room7_keys;

-- Get just the wallet addresses for airdrop (comma-separated)
SELECT STRING_AGG(wallet_address, ', ') as wallet_list
FROM paradise_motel_room7_keys;

-- Get keys obtained in last 24 hours
SELECT 
  wallet_address,
  obtained_at
FROM paradise_motel_room7_keys
WHERE obtained_at >= NOW() - INTERVAL '24 hours'
ORDER BY obtained_at DESC;

-- Get keys obtained today
SELECT 
  wallet_address,
  obtained_at
FROM paradise_motel_room7_keys
WHERE DATE(obtained_at) = CURRENT_DATE
ORDER BY obtained_at DESC;

-- Export format for airdrop tools (just addresses, one per line)
SELECT wallet_address
FROM paradise_motel_room7_keys
ORDER BY obtained_at ASC;
