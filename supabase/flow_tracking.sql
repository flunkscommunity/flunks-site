-- Flow Command Tracking Schema (Magic Carpet Style)
-- Tracks when users input the 'flow' command in the terminal

-- Create table to track flow command usage
CREATE TABLE IF NOT EXISTS flow_logs (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT, -- Can be null for anonymous users
  username TEXT, -- User's profile username, can be null
  command_input TEXT DEFAULT 'flow',
  access_level TEXT, -- ADMIN, BETA, COMMUNITY
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_flow_logs_wallet ON flow_logs(wallet_address);
CREATE INDEX IF NOT EXISTS idx_flow_logs_username ON flow_logs(username);
CREATE INDEX IF NOT EXISTS idx_flow_logs_created_at ON flow_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_flow_logs_access_level ON flow_logs(access_level);

-- Add RLS (Row Level Security) policies
ALTER TABLE flow_logs ENABLE ROW LEVEL SECURITY;

-- Policy for users to insert their own records (including anonymous users)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'flow_logs' 
      AND policyname = 'Allow users to insert their own flow logs'
  ) THEN
    CREATE POLICY "Allow users to insert their own flow logs" ON flow_logs
      FOR INSERT WITH CHECK (
        wallet_address IS NULL OR 
        wallet_address = auth.jwt() ->> 'wallet_address'
      );
  END IF;
END$$;

-- Policy for users to view their own records
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'flow_logs' 
      AND policyname = 'Users can view their own flow logs'
  ) THEN
    CREATE POLICY "Users can view their own flow logs" ON flow_logs
      FOR SELECT USING (wallet_address = auth.jwt() ->> 'wallet_address');
  END IF;
END$$;

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_flow_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_flow_logs_updated_at_trigger ON flow_logs;
CREATE TRIGGER update_flow_logs_updated_at_trigger
  BEFORE UPDATE ON flow_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_flow_logs_updated_at();

-- Function to log flow command usage
CREATE OR REPLACE FUNCTION log_flow_command(
  p_wallet_address TEXT,
  p_username TEXT DEFAULT NULL,
  p_access_level TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO flow_logs (
    wallet_address,
    username,
    access_level,
    session_id,
    user_agent,
    ip_address
  ) VALUES (
    p_wallet_address,
    p_username,
    p_access_level,
    p_session_id,
    p_user_agent,
    CAST(p_ip_address AS INET)
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent flow commands with pagination
CREATE OR REPLACE FUNCTION get_recent_flow_commands(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id BIGINT,
  wallet_address TEXT,
  username TEXT,
  command_input TEXT,
  access_level TEXT,
  created_at TIMESTAMPTZ,
  session_id TEXT,
  user_agent TEXT,
  ip_address INET
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.wallet_address,
    w.username,
    w.command_input,
    w.access_level,
    w.created_at,
    w.session_id,
    w.user_agent,
    w.ip_address
  FROM flow_logs w
  ORDER BY w.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get flow command stats
CREATE OR REPLACE FUNCTION get_flow_command_stats()
RETURNS TABLE(
  total_commands BIGINT,
  unique_wallets BIGINT,
  unique_usernames BIGINT,
  commands_today BIGINT,
  commands_this_week BIGINT,
  commands_this_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_commands,
    COUNT(DISTINCT wallet_address) as unique_wallets,
    COUNT(DISTINCT username) FILTER (WHERE username IS NOT NULL) as unique_usernames,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as commands_today,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as commands_this_week,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as commands_this_month
  FROM flow_logs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
