-- Gum System Schema - Safe Version (handles existing tables)
-- Table to track user gum balances and transactions

-- Create tables only if they don't exist
CREATE TABLE IF NOT EXISTS user_gum_balances (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(64) UNIQUE NOT NULL,
  total_gum BIGINT DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_gum_balance CHECK (total_gum >= 0)
);

CREATE TABLE IF NOT EXISTS gum_transactions (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(64) NOT NULL,
  transaction_type VARCHAR(32) NOT NULL, -- 'earned', 'spent', 'bonus', etc.
  amount INTEGER NOT NULL,
  source VARCHAR(64) NOT NULL, -- 'floating_button', 'daily_reward', 'feature_usage', etc.
  description TEXT,
  metadata JSONB, -- For storing additional context (button position, feature used, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gum_sources (
  id SERIAL PRIMARY KEY,
  source_name VARCHAR(64) UNIQUE NOT NULL,
  base_reward INTEGER NOT NULL,
  cooldown_minutes INTEGER DEFAULT 0, -- Cooldown between earning from same source
  daily_limit INTEGER, -- Max earnings per day from this source (NULL = unlimited)
  description TEXT, -- Description of the gum source
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_gum_cooldowns (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(64) NOT NULL,
  source_name VARCHAR(64) NOT NULL,
  last_earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  daily_earned_amount INTEGER DEFAULT 0,
  daily_reset_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(wallet_address, source_name)
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add description column to gum_sources if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gum_sources' AND column_name = 'description'
    ) THEN
        ALTER TABLE gum_sources ADD COLUMN description TEXT;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_gum_balances_wallet ON user_gum_balances(wallet_address);
CREATE INDEX IF NOT EXISTS idx_gum_transactions_wallet ON gum_transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_gum_transactions_source ON gum_transactions(source);
CREATE INDEX IF NOT EXISTS idx_gum_transactions_created ON gum_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_gum_cooldowns_wallet_source ON user_gum_cooldowns(wallet_address, source_name);
CREATE INDEX IF NOT EXISTS idx_gum_cooldowns_last_earned ON user_gum_cooldowns(last_earned_at);

-- Add foreign key constraints only if they don't exist
DO $$ 
BEGIN
    -- Check if user_profiles table exists before adding foreign keys
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        
        -- Add foreign key for gum_transactions if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_gum_transactions_wallet' AND table_name = 'gum_transactions'
        ) THEN
            ALTER TABLE gum_transactions 
            ADD CONSTRAINT fk_gum_transactions_wallet 
            FOREIGN KEY (wallet_address) REFERENCES user_profiles(wallet_address) ON DELETE CASCADE;
        END IF;

        -- Add foreign key for user_gum_balances if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_gum_balances_wallet' AND table_name = 'user_gum_balances'
        ) THEN
            ALTER TABLE user_gum_balances 
            ADD CONSTRAINT fk_gum_balances_wallet 
            FOREIGN KEY (wallet_address) REFERENCES user_profiles(wallet_address) ON DELETE CASCADE;
        END IF;

        -- Add foreign key for user_gum_cooldowns if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_gum_cooldowns_wallet' AND table_name = 'user_gum_cooldowns'
        ) THEN
            ALTER TABLE user_gum_cooldowns 
            ADD CONSTRAINT fk_gum_cooldowns_wallet 
            FOREIGN KEY (wallet_address) REFERENCES user_profiles(wallet_address) ON DELETE CASCADE;
        END IF;
        
    END IF;
END $$;

-- Create update function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_gum_balances_updated_at'
    ) THEN
        CREATE TRIGGER update_gum_balances_updated_at 
            BEFORE UPDATE ON user_gum_balances 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_gum_sources_updated_at'
    ) THEN
        CREATE TRIGGER update_gum_sources_updated_at 
            BEFORE UPDATE ON gum_sources 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE user_gum_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE gum_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gum_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gum_cooldowns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can read own gum balance" ON user_gum_balances;
DROP POLICY IF EXISTS "Allow gum balance updates" ON user_gum_balances;
DROP POLICY IF EXISTS "Users can read own transactions" ON gum_transactions;
DROP POLICY IF EXISTS "Allow transaction inserts" ON gum_transactions;
DROP POLICY IF EXISTS "Allow public read gum sources" ON gum_sources;
DROP POLICY IF EXISTS "Users can read own cooldowns" ON user_gum_cooldowns;
DROP POLICY IF EXISTS "Allow cooldown management" ON user_gum_cooldowns;

-- Create policies
CREATE POLICY "Users can read own gum balance" ON user_gum_balances
FOR SELECT USING (wallet_address = current_setting('jwt.claims.wallet_address', true));

CREATE POLICY "Allow gum balance updates" ON user_gum_balances
FOR ALL USING (true); -- Will be handled by functions

CREATE POLICY "Users can read own transactions" ON gum_transactions
FOR SELECT USING (wallet_address = current_setting('jwt.claims.wallet_address', true));

CREATE POLICY "Allow transaction inserts" ON gum_transactions
FOR INSERT WITH CHECK (true); -- Will be handled by functions

CREATE POLICY "Allow public read gum sources" ON gum_sources
FOR SELECT USING (true);

CREATE POLICY "Users can read own cooldowns" ON user_gum_cooldowns
FOR SELECT USING (wallet_address = current_setting('jwt.claims.wallet_address', true));

CREATE POLICY "Allow cooldown management" ON user_gum_cooldowns
FOR ALL USING (true); -- Will be handled by functions

-- Insert or update default gum sources
INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description) VALUES
('floating_button', 5, 360, 20, 'Floating gum button clicks'),
('daily_login', 10, 1440, 10, 'Daily login bonus'),
('special_event', 50, 0, 50, 'Special event rewards'),
('locker_jacket', 3, 300, 15, 'Gum earned from clicking button in locker jacket section')
ON CONFLICT (source_name) DO UPDATE SET
  base_reward = EXCLUDED.base_reward,
  cooldown_minutes = EXCLUDED.cooldown_minutes,
  daily_limit = EXCLUDED.daily_limit,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- Function to award gum (handles balance updates, transaction logging, and cooldowns)
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
    END IF;
    
    -- Check cooldown (minutes since last earn)
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
        WHEN EXTRACT(EPOCH FROM (v_current_time - v_cooldown_record.last_earned_at))/60 < v_source_config.cooldown_minutes 
        THEN 'Still in cooldown period'
        WHEN v_source_config.daily_limit IS NOT NULL AND 
             (v_cooldown_record.daily_earned_amount + v_source_config.base_reward) > v_source_config.daily_limit
        THEN 'Daily limit reached'
        ELSE 'Unknown error'
      END,
      'cooldown_remaining_minutes', GREATEST(0, v_source_config.cooldown_minutes - 
        EXTRACT(EPOCH FROM (v_current_time - COALESCE(v_cooldown_record.last_earned_at, v_current_time)))/60)
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user gum balance and stats
CREATE OR REPLACE FUNCTION get_user_gum_stats(p_wallet_address VARCHAR(64))
RETURNS JSONB AS $$
DECLARE
  v_balance BIGINT := 0;
  v_total_earned BIGINT := 0;
  v_total_spent BIGINT := 0;
  v_result JSONB;
BEGIN
  -- Get current balance
  SELECT COALESCE(total_gum, 0) INTO v_balance
  FROM user_gum_balances
  WHERE wallet_address = p_wallet_address;
  
  -- Get total earned
  SELECT COALESCE(SUM(amount), 0) INTO v_total_earned
  FROM gum_transactions
  WHERE wallet_address = p_wallet_address AND transaction_type = 'earned';
  
  -- Get total spent
  SELECT COALESCE(SUM(amount), 0) INTO v_total_spent
  FROM gum_transactions
  WHERE wallet_address = p_wallet_address AND transaction_type = 'spent';
  
  RETURN jsonb_build_object(
    'current_balance', v_balance,
    'total_earned', v_total_earned,
    'total_spent', v_total_spent,
    'wallet_address', p_wallet_address
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
