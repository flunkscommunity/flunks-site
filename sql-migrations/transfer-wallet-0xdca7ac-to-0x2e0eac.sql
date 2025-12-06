-- Transfer wallet address from Dapper wallet to linked Flow wallet
-- Old (Dapper): 0xdca7ac623136e447 (Account #228 with 1280 NFTs)
-- New (Flow Wallet): 0x2e0eac981ef5bd98 (Account #20 - linked to Dapper)
-- Date: 2025-12-06
-- Reason: User wants to use their linked Flow wallet instead of Dapper, consolidate progress

BEGIN;

-- Store old and new addresses for safety
DO $$
DECLARE
  v_old_wallet TEXT := '0xdca7ac623136e447';
  v_new_wallet TEXT := '0x2e0eac981ef5bd98';
  v_profile_count INTEGER;
  v_gum_balance BIGINT;
BEGIN
  -- Verify old wallet exists
  SELECT COUNT(*) INTO v_profile_count
  FROM user_profiles
  WHERE wallet_address = v_old_wallet;
  
  IF v_profile_count = 0 THEN
    RAISE EXCEPTION 'Old wallet address not found in user_profiles';
  END IF;
  
  -- Check if new wallet already exists (will be deleted if found)
  SELECT COUNT(*) INTO v_profile_count
  FROM user_profiles
  WHERE wallet_address = v_new_wallet;
  
  IF v_profile_count > 0 THEN
    RAISE NOTICE '⚠️  New wallet address already exists - will be replaced with old wallet data';
  END IF;
  
  -- Get current GUM balance for logging
  SELECT total_gum INTO v_gum_balance
  FROM user_gum_balances
  WHERE wallet_address = v_old_wallet;
  
  RAISE NOTICE '✅ Validation passed';
  RAISE NOTICE '   Old wallet (Dapper): % (GUM balance: %)', v_old_wallet, COALESCE(v_gum_balance, 0);
  RAISE NOTICE '   New wallet (Flow): %', v_new_wallet;
END $$;

-- 1. Handle existing data in new wallet (if any exists, delete it first)
DELETE FROM user_gum_balances WHERE wallet_address = '0x2e0eac981ef5bd98';
DELETE FROM gum_transactions WHERE wallet_address = '0x2e0eac981ef5bd98';
DELETE FROM user_gum_cooldowns WHERE wallet_address = '0x2e0eac981ef5bd98';
DELETE FROM user_profiles WHERE wallet_address = '0x2e0eac981ef5bd98';

-- 2. Update the main profile (this updates locker_assignments view automatically)
UPDATE user_profiles 
SET wallet_address = '0x2e0eac981ef5bd98'
WHERE wallet_address = '0xdca7ac623136e447';

-- 3. Update GUM system tables (have foreign keys but no ON UPDATE CASCADE)
UPDATE user_gum_balances 
SET wallet_address = '0x2e0eac981ef5bd98'
WHERE wallet_address = '0xdca7ac623136e447';

UPDATE gum_transactions 
SET wallet_address = '0x2e0eac981ef5bd98'
WHERE wallet_address = '0xdca7ac623136e447';

UPDATE user_gum_cooldowns 
SET wallet_address = '0x2e0eac981ef5bd98'
WHERE wallet_address = '0xdca7ac623136e447';

-- 4. Delete any existing data in objective tables for new wallet (if tables exist)
DO $$
BEGIN
  DELETE FROM paradise_motel_room7_visits WHERE wallet_address = '0x2e0eac981ef5bd98';
  DELETE FROM crack_the_code WHERE wallet_address = '0x2e0eac981ef5bd98';
  DELETE FROM flunko_clicks WHERE wallet_address = '0x2e0eac981ef5bd98';
  DELETE FROM homecoming_dance_attendance WHERE wallet_address = '0x2e0eac981ef5bd98';
  DELETE FROM paradise_motel_entries WHERE wallet_address = '0x2e0eac981ef5bd98';
  DELETE FROM paradise_motel_room7_keys WHERE wallet_address = '0x2e0eac981ef5bd98';
  DELETE FROM cafeteria_button_clicks WHERE wallet_address = '0x2e0eac981ef5bd98';
  DELETE FROM friday_night_lights_clicks WHERE wallet_address = '0x2e0eac981ef5bd98';
  DELETE FROM picture_day_votes WHERE user_wallet = '0x2e0eac981ef5bd98';
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'flow_drawing_entries') THEN
    DELETE FROM flow_drawing_entries WHERE wallet_address = '0x2e0eac981ef5bd98';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'digital_lock_attempts') THEN
    DELETE FROM digital_lock_attempts WHERE wallet_address = '0x2e0eac981ef5bd98';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'terminal_activities') THEN
    DELETE FROM terminal_activities WHERE wallet_address = '0x2e0eac981ef5bd98';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'magic_carpet_logs') THEN
    DELETE FROM magic_carpet_logs WHERE wallet_address = '0x2e0eac981ef5bd98';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'flow_logs') THEN
    DELETE FROM flow_logs WHERE wallet_address = '0x2e0eac981ef5bd98';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'semester_zero_allowlist') THEN
    DELETE FROM semester_zero_allowlist WHERE wallet_address = '0x2e0eac981ef5bd98';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'weekly_objectives_completed') THEN
    DELETE FROM weekly_objectives_completed WHERE wallet_address = '0x2e0eac981ef5bd98';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
    DELETE FROM chat_messages WHERE wallet_address = '0x2e0eac981ef5bd98';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'feedback_reports') THEN
    DELETE FROM feedback_reports WHERE wallet_address = '0x2e0eac981ef5bd98';
  END IF;
END $$;

-- 5. Update Chapter/Objective tracking tables
UPDATE paradise_motel_room7_visits 
SET wallet_address = '0x2e0eac981ef5bd98'
WHERE wallet_address = '0xdca7ac623136e447';

UPDATE crack_the_code 
SET wallet_address = '0x2e0eac981ef5bd98'
WHERE wallet_address = '0xdca7ac623136e447';

UPDATE flunko_clicks 
SET wallet_address = '0x2e0eac981ef5bd98'
WHERE wallet_address = '0xdca7ac623136e447';

UPDATE homecoming_dance_attendance 
SET wallet_address = '0x2e0eac981ef5bd98'
WHERE wallet_address = '0xdca7ac623136e447';

UPDATE paradise_motel_entries 
SET wallet_address = '0x2e0eac981ef5bd98'
WHERE wallet_address = '0xdca7ac623136e447';

UPDATE paradise_motel_room7_keys 
SET wallet_address = '0x2e0eac981ef5bd98'
WHERE wallet_address = '0xdca7ac623136e447';

UPDATE cafeteria_button_clicks 
SET wallet_address = '0x2e0eac981ef5bd98'
WHERE wallet_address = '0xdca7ac623136e447';

UPDATE friday_night_lights_clicks 
SET wallet_address = '0x2e0eac981ef5bd98'
WHERE wallet_address = '0xdca7ac623136e447';

UPDATE picture_day_votes 
SET user_wallet = '0x2e0eac981ef5bd98'
WHERE user_wallet = '0xdca7ac623136e447';

-- 6. Update optional tracking tables (only if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'flow_drawing_entries') THEN
    UPDATE flow_drawing_entries 
    SET wallet_address = '0x2e0eac981ef5bd98'
    WHERE wallet_address = '0xdca7ac623136e447';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'digital_lock_attempts') THEN
    UPDATE digital_lock_attempts 
    SET wallet_address = '0x2e0eac981ef5bd98'
    WHERE wallet_address = '0xdca7ac623136e447';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'terminal_activities') THEN
    UPDATE terminal_activities 
    SET wallet_address = '0x2e0eac981ef5bd98'
    WHERE wallet_address = '0xdca7ac623136e447';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'magic_carpet_logs') THEN
    UPDATE magic_carpet_logs 
    SET wallet_address = '0x2e0eac981ef5bd98'
    WHERE wallet_address = '0xdca7ac623136e447';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'flow_logs') THEN
    UPDATE flow_logs 
    SET wallet_address = '0x2e0eac981ef5bd98'
    WHERE wallet_address = '0xdca7ac623136e447';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'semester_zero_allowlist') THEN
    UPDATE semester_zero_allowlist 
    SET wallet_address = '0x2e0eac981ef5bd98'
    WHERE wallet_address = '0xdca7ac623136e447';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'weekly_objectives_completed') THEN
    UPDATE weekly_objectives_completed 
    SET wallet_address = '0x2e0eac981ef5bd98'
    WHERE wallet_address = '0xdca7ac623136e447';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
    UPDATE chat_messages 
    SET wallet_address = '0x2e0eac981ef5bd98'
    WHERE wallet_address = '0xdca7ac623136e447';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'feedback_reports') THEN
    UPDATE feedback_reports 
    SET wallet_address = '0x2e0eac981ef5bd98'
    WHERE wallet_address = '0xdca7ac623136e447';
  END IF;
END $$;

-- 7. Verification queries
DO $$
DECLARE
  v_new_profile_count INTEGER;
  v_new_gum_balance BIGINT;
  v_old_profile_count INTEGER;
BEGIN
  -- Check that new wallet now exists
  SELECT COUNT(*) INTO v_new_profile_count
  FROM user_profiles
  WHERE wallet_address = '0x2e0eac981ef5bd98';
  
  IF v_new_profile_count = 0 THEN
    RAISE EXCEPTION 'Transfer failed: New wallet address not found in user_profiles';
  END IF;
  
  -- Check that old wallet no longer exists
  SELECT COUNT(*) INTO v_old_profile_count
  FROM user_profiles
  WHERE wallet_address = '0xdca7ac623136e447';
  
  IF v_old_profile_count > 0 THEN
    RAISE EXCEPTION 'Transfer failed: Old wallet address still exists in user_profiles';
  END IF;
  
  -- Get new GUM balance
  SELECT total_gum INTO v_new_gum_balance
  FROM user_gum_balances
  WHERE wallet_address = '0x2e0eac981ef5bd98';
  
  RAISE NOTICE '✅ Transfer successful!';
  RAISE NOTICE '   New wallet: 0x2e0eac981ef5bd98';
  RAISE NOTICE '   GUM balance: %', COALESCE(v_new_gum_balance, 0);
  RAISE NOTICE '';
  RAISE NOTICE '📝 Summary of transferred data:';
  RAISE NOTICE '   - User profile (username, locker assignment)';
  RAISE NOTICE '   - GUM balance and transaction history';
  RAISE NOTICE '   - All chapter objectives and achievements';
  RAISE NOTICE '   - All cooldowns and tracking data';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: User should now connect with wallet 0x2e0eac981ef5bd98';
  RAISE NOTICE '   Their NFTs remain in Dapper wallet 0xdca7ac623136e447 via account linking';
END $$;

COMMIT;

-- Final verification query (run separately to review results)
-- SELECT 
--   'Profile' as table_name,
--   wallet_address,
--   username,
--   locker_number
-- FROM user_profiles
-- WHERE wallet_address = '0x2e0eac981ef5bd98'
-- UNION ALL
-- SELECT 
--   'GUM Balance',
--   wallet_address,
--   total_gum::text,
--   NULL
-- FROM user_gum_balances
-- WHERE wallet_address = '0x2e0eac981ef5bd98';
