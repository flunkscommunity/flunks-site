-- Manual fix: Create GUM transaction records for homecoming dance attendees
-- This ensures their Chapter 4 Slacker achievements light up

-- Insert GUM transactions for all homecoming dance attendees who don't already have them
INSERT INTO gum_transactions (wallet_address, transaction_type, amount, source, description, metadata, created_at)
SELECT 
    hd.wallet_address,
    'earned' as transaction_type,
    50 as amount,
    'chapter4_homecoming_dance' as source,
    'Chapter 4 Slacker - Homecoming Dance attendance (retroactive)' as description,
    jsonb_build_object('retroactive', true, 'original_attendance_date', hd.created_at) as metadata,
    hd.created_at
FROM homecoming_dance_attendance hd
WHERE NOT EXISTS (
    SELECT 1 FROM gum_transactions gt 
    WHERE gt.wallet_address = hd.wallet_address 
    AND gt.source = 'chapter4_homecoming_dance'
);

-- Verify the records were created
SELECT 
    gt.wallet_address,
    gt.amount,
    gt.source,
    gt.description,
    gt.created_at,
    hd.username
FROM gum_transactions gt
LEFT JOIN homecoming_dance_attendance hd ON hd.wallet_address = gt.wallet_address
WHERE gt.source = 'chapter4_homecoming_dance'
ORDER BY gt.created_at DESC;