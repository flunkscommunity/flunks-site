-- Update the award_gum function to use calendar day logic for daily_login
-- This allows users to claim gum once per calendar day (midnight reset) 
-- instead of a rolling 24-hour cooldown

CREATE OR REPLACE FUNCTION award_gum(
  p_wallet_address VARCHAR(64),
  p_source VARCHAR(64),
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_source_config gum_sources%ROWTYPE;
  v_cooldown_record user_gum_cooldowns%ROWTYPE;
  v_can_earn BOOLEAN := false;
  v_reward_amount INTEGER := 0;
  v_current_time TIMESTAMP WITH TIME ZONE := CURRENT_TIMESTAMP;
  v_current_date DATE := CURRENT_DATE;
  v_result JSONB;
  v_already_claimed_today BOOLEAN := false;
BEGIN
  -- Get source configuration
  SELECT * INTO v_source_config 
  FROM gum_sources 
  WHERE source_name = p_source AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or inactive gum source',
      'earned', 0
    );
  END IF;
  
  -- Check/update cooldown record
  SELECT * INTO v_cooldown_record
  FROM user_gum_cooldowns
  WHERE wallet_address = p_wallet_address AND source_name = p_source;
  
  IF NOT FOUND THEN
    -- First time earning from this source
    v_can_earn := true;
    v_reward_amount := v_source_config.base_reward;
    
    -- Create cooldown record
    INSERT INTO user_gum_cooldowns (wallet_address, source_name, daily_earned_amount, daily_reset_date)
    VALUES (p_wallet_address, p_source, v_reward_amount, v_current_date);
  ELSE
    -- Reset daily counter if new day
    IF v_cooldown_record.daily_reset_date < v_current_date THEN
      UPDATE user_gum_cooldowns 
      SET daily_earned_amount = 0, daily_reset_date = v_current_date
      WHERE wallet_address = p_wallet_address AND source_name = p_source;
      v_cooldown_record.daily_earned_amount := 0;
      v_cooldown_record.daily_reset_date := v_current_date;
    END IF;
    
    -- Special logic for daily_login: only check if already claimed today (calendar day)
    IF p_source = 'daily_login' THEN
      -- For daily_login, only check if we already claimed today
      v_already_claimed_today := (v_cooldown_record.daily_reset_date = v_current_date AND v_cooldown_record.daily_earned_amount > 0);
      
      IF NOT v_already_claimed_today THEN
        -- Check daily limit (should be fine for daily_login)
        IF v_source_config.daily_limit IS NULL OR 
           (v_cooldown_record.daily_earned_amount + v_source_config.base_reward) <= v_source_config.daily_limit THEN
          v_can_earn := true;
          v_reward_amount := v_source_config.base_reward;
          
          -- Update cooldown record
          UPDATE user_gum_cooldowns 
          SET last_earned_at = v_current_time,
              daily_earned_amount = daily_earned_amount + v_reward_amount
          WHERE wallet_address = p_wallet_address AND source_name = p_source;
        END IF;
      END IF;
    ELSE
      -- Original logic for all other sources: check cooldown_minutes
      IF EXTRACT(EPOCH FROM (v_current_time - v_cooldown_record.last_earned_at))/60 >= v_source_config.cooldown_minutes THEN
        -- Check daily limit
        IF v_source_config.daily_limit IS NULL OR 
           (v_cooldown_record.daily_earned_amount + v_source_config.base_reward) <= v_source_config.daily_limit THEN
          v_can_earn := true;
          v_reward_amount := v_source_config.base_reward;
          
          -- Update cooldown record
          UPDATE user_gum_cooldowns 
          SET last_earned_at = v_current_time,
              daily_earned_amount = daily_earned_amount + v_reward_amount
          WHERE wallet_address = p_wallet_address AND source_name = p_source;
        END IF;
      END IF;
    END IF;
  END IF;
  
  IF v_can_earn AND v_reward_amount > 0 THEN
    -- Create/update gum balance
    INSERT INTO user_gum_balances (wallet_address, total_gum)
    VALUES (p_wallet_address, v_reward_amount)
    ON CONFLICT (wallet_address) 
    DO UPDATE SET 
      total_gum = user_gum_balances.total_gum + v_reward_amount,
      updated_at = CURRENT_TIMESTAMP;
    
    -- Log transaction
    INSERT INTO gum_transactions (wallet_address, transaction_type, amount, source, description, metadata)
    VALUES (p_wallet_address, 'earned', v_reward_amount, p_source, 
           'Earned gum from ' || p_source, p_metadata);
    
    -- Return success
    RETURN jsonb_build_object(
      'success', true,
      'earned', v_reward_amount,
      'source', p_source,
      'cooldown_minutes', v_source_config.cooldown_minutes,
      'daily_limit', v_source_config.daily_limit
    );
  ELSE
    -- Return failure with reason
    RETURN jsonb_build_object(
      'success', false,
      'earned', 0,
      'error', CASE 
        WHEN p_source = 'daily_login' AND v_already_claimed_today
        THEN 'Already claimed daily gum today'
        WHEN p_source = 'daily_login' AND v_source_config.daily_limit IS NOT NULL AND 
             (v_cooldown_record.daily_earned_amount + v_source_config.base_reward) > v_source_config.daily_limit
        THEN 'Daily limit reached'
        WHEN p_source != 'daily_login' AND EXTRACT(EPOCH FROM (v_current_time - v_cooldown_record.last_earned_at))/60 < v_source_config.cooldown_minutes 
        THEN 'Still in cooldown period'
        WHEN p_source != 'daily_login' AND v_source_config.daily_limit IS NOT NULL AND 
             (v_cooldown_record.daily_earned_amount + v_source_config.base_reward) > v_source_config.daily_limit
        THEN 'Daily limit reached'
        ELSE 'Unknown error'
      END,
      'cooldown_remaining_minutes', CASE
        WHEN p_source = 'daily_login' THEN 0  -- No cooldown for daily_login, just calendar day
        ELSE GREATEST(0, v_source_config.cooldown_minutes - 
          EXTRACT(EPOCH FROM (v_current_time - COALESCE(v_cooldown_record.last_earned_at, v_current_time)))/60)
      END
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update the daily_login source to set cooldown_minutes to 0 since we're using calendar day logic
UPDATE gum_sources 
SET cooldown_minutes = 0, 
    description = 'Daily login bonus (resets at midnight)'
WHERE source_name = 'daily_login';