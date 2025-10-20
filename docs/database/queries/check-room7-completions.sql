-- ============================================
-- Paradise Motel Room 7 - Chapter 5 Slacker Objective Tracking
-- ============================================
-- This uses the EXISTING gum_transactions table
-- No new tables needed!

-- ============================================
-- 1. Check who has completed Room 7 at night
-- ============================================
SELECT 
  wallet_address,
  amount,
  created_at,
  description
FROM gum_transactions
WHERE source = 'paradise_motel_room7_night'
ORDER BY created_at DESC;

-- ============================================
-- 2. Count total completions
-- ============================================
SELECT COUNT(DISTINCT wallet_address) as total_users_completed
FROM gum_transactions
WHERE source = 'paradise_motel_room7_night';

-- ============================================
-- 3. Check if specific wallet has completed
-- ============================================
-- Replace 'WALLET_ADDRESS_HERE' with actual wallet address
SELECT 
  wallet_address,
  amount,
  created_at,
  description
FROM gum_transactions
WHERE source = 'paradise_motel_room7_night'
  AND wallet_address = 'WALLET_ADDRESS_HERE'
LIMIT 1;

-- ============================================
-- 4. Recent completions (last 24 hours)
-- ============================================
SELECT 
  wallet_address,
  amount,
  created_at
FROM gum_transactions
WHERE source = 'paradise_motel_room7_night'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- ============================================
-- 5. OPTIONAL: Manually award GUM if needed (for testing)
-- ============================================
-- Replace 'WALLET_ADDRESS_HERE' with actual wallet address
/*
INSERT INTO gum_transactions (
  wallet_address,
  transaction_type,
  amount,
  source,
  description,
  created_at
) VALUES (
  'WALLET_ADDRESS_HERE',
  'earned',
  50,
  'paradise_motel_room7_night',
  'Chapter 5 Slacker: shhhh, don''t tell anyone',
  NOW()
);

-- Also update their balance
INSERT INTO user_gum_balances (wallet_address, total_gum)
VALUES ('WALLET_ADDRESS_HERE', 50)
ON CONFLICT (wallet_address) 
DO UPDATE SET total_gum = user_gum_balances.total_gum + 50;
*/

-- ============================================
-- 6. View all Chapter 5 related GUM transactions
-- ============================================
SELECT 
  wallet_address,
  transaction_type,
  amount,
  source,
  description,
  created_at
FROM gum_transactions
WHERE source LIKE '%paradise_motel%'
   OR source LIKE '%chapter5%'
ORDER BY created_at DESC;

-- ============================================
-- NOTES:
-- ============================================
-- - No new tables needed - uses existing gum_transactions table
-- - The tracking happens automatically when user visits Room 7 at night
-- - The source 'paradise_motel_room7_night' is unique to this objective
-- - GUM is awarded through /api/award-gum endpoint automatically
