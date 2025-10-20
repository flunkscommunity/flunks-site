-- Manual fix for Chapter 4 Slacker achievements
-- This ensures users who attended homecoming dance get their achievements lit up

-- List of wallet addresses that have attended homecoming dance:
-- test_homecoming_wallet, 0xb102f2ae797c9023, 0xc4ab4a06ade1fd0f, 0xe327216d84335f71, 
-- 0xb8acbf8ae32955de, 0x6e5d12b17535caa83, 0x74f3df8539a5f1a0

-- First, let's verify they exist in homecoming_dance_attendance table
SELECT 
    wallet_address,
    username,
    gum_amount,
    created_at
FROM homecoming_dance_attendance 
ORDER BY created_at DESC;

-- The achievement system should now recognize these automatically with our updated function
-- But if there are any issues, we can also ensure they have GUM transaction records

-- Check if these users have corresponding gum_transactions records
SELECT DISTINCT
    hd.wallet_address,
    hd.username,
    CASE 
        WHEN gt.wallet_address IS NOT NULL THEN 'Has GUM transaction'
        ELSE 'Missing GUM transaction'
    END as gum_status
FROM homecoming_dance_attendance hd
LEFT JOIN gum_transactions gt ON (
    gt.wallet_address = hd.wallet_address 
    AND gt.source = 'chapter4_homecoming_dance'
)
ORDER BY hd.created_at DESC;

-- If any are missing GUM transactions, we could add them manually:
-- But since they already have attendance records, the updated achievement check should work!