-- New WTF Command Tracking Schema (Magic Carpet Style)
-- Clean, modern tracking system for WTF terminal commands with username support

-- Drop old WTF system completely first
DROP POLICY IF EXISTS "Users can insert their own wtf command logs" ON wtf_command_logs;
DROP POLICY IF EXISTS "Authenticated users can view wtf command logs" ON wtf_command_logs;
DROP POLICY IF EXISTS "Users can view their own wtf command logs" ON wtf_command_logs;
DROP TRIGGER IF EXISTS update_wtf_command_logs_updated_at_trigger ON wtf_command_logs;
DROP FUNCTION IF EXISTS update_wtf_command_logs_updated_at() CASCADE;
DROP FUNCTION IF EXISTS log_wtf_command(TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_wtf_command_stats() CASCADE;
DROP FUNCTION IF EXISTS get_recent_wtf_commands(INTEGER) CASCADE;
DROP TABLE IF EXISTS wtf_command_logs CASCADE;

-- Create new WTF tracking table (similar to magic_carpet_logs)
CREATE TABLE wtf_logs (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  username TEXT,
  access_level TEXT,
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_wtf_logs_wallet ON wtf_logs(wallet_address);
CREATE INDEX idx_wtf_logs_username ON wtf_logs(username);
CREATE INDEX idx_wtf_logs_created_at ON wtf_logs(created_at);
CREATE INDEX idx_wtf_logs_access_level ON wtf_logs(access_level);

-- Enable RLS
ALTER TABLE wtf_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can insert wtf logs" ON wtf_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view wtf logs" ON wtf_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Function to log WTF command usage
CREATE OR REPLACE FUNCTION log_wtf_command(
  p_wallet_address TEXT,
  p_username TEXT DEFAULT NULL,
  p_access_level TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO wtf_logs (
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

-- Function to get recent WTF commands
CREATE OR REPLACE FUNCTION get_recent_wtf_commands(limit_count INTEGER DEFAULT 50)
RETURNS TABLE(
  wallet_address TEXT,
  username TEXT,
  access_level TEXT,
  created_at TIMESTAMPTZ,
  session_id TEXT,
  user_agent TEXT,
  ip_address INET
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.wallet_address,
    w.username,
    w.access_level,
    w.created_at,
    w.session_id,
    w.user_agent,
    w.ip_address
  FROM wtf_logs w
  ORDER BY w.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get WTF command statistics
CREATE OR REPLACE FUNCTION get_wtf_command_stats()
RETURNS TABLE(
  total_commands BIGINT,
  unique_wallets BIGINT,
  unique_usernames BIGINT,
  commands_today BIGINT,
  commands_this_week BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_commands,
    COUNT(DISTINCT wallet_address) as unique_wallets,
    COUNT(DISTINCT username) FILTER (WHERE username IS NOT NULL) as unique_usernames,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as commands_today,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as commands_this_week
  FROM wtf_logs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
