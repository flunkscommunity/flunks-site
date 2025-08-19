-- WTF Command Tracking Schema
-- Tracks when users input the 'wtf' command in the terminal

-- Create table to track wtf command usage
CREATE TABLE IF NOT EXISTS wtf_command_logs (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT, -- Can be null for anonymous users
  command_input TEXT DEFAULT 'wtf',
  access_level TEXT, -- ADMIN, BETA, COMMUNITY
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_wtf_command_logs_wallet ON wtf_command_logs(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wtf_command_logs_created_at ON wtf_command_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_wtf_command_logs_access_level ON wtf_command_logs(access_level);

-- Add RLS (Row Level Security) policies
ALTER TABLE wtf_command_logs ENABLE ROW LEVEL SECURITY;

-- Policy for users to insert their own records (including anonymous users)
CREATE POLICY "Users can insert their own wtf command logs" ON wtf_command_logs
  FOR INSERT WITH CHECK (true);

-- Policy for admins to view all records (simplified - all authenticated users can view)
CREATE POLICY "Authenticated users can view wtf command logs" ON wtf_command_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy for users to view only their own records
CREATE POLICY "Users can view their own wtf command logs" ON wtf_command_logs
  FOR SELECT USING (wallet_address = auth.jwt() ->> 'wallet_address');

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_wtf_command_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_wtf_command_logs_updated_at_trigger ON wtf_command_logs;
CREATE TRIGGER update_wtf_command_logs_updated_at_trigger
  BEFORE UPDATE ON wtf_command_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_wtf_command_logs_updated_at();

-- Function to log wtf command usage
CREATE OR REPLACE FUNCTION log_wtf_command(
  p_wallet_address TEXT,
  p_access_level TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO wtf_command_logs (
    wallet_address,
    access_level,
    session_id,
    user_agent,
    ip_address
  ) VALUES (
    p_wallet_address,
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

-- Function to get wtf command statistics
CREATE OR REPLACE FUNCTION get_wtf_command_stats()
RETURNS TABLE(
  total_uses BIGINT,
  unique_users BIGINT,
  admin_uses BIGINT,
  beta_uses BIGINT,
  community_uses BIGINT,
  today_uses BIGINT,
  this_week_uses BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_uses,
    COUNT(DISTINCT wallet_address) as unique_users,
    COUNT(*) FILTER (WHERE access_level = 'ADMIN') as admin_uses,
    COUNT(*) FILTER (WHERE access_level = 'BETA') as beta_uses,
    COUNT(*) FILTER (WHERE access_level = 'COMMUNITY') as community_uses,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_uses,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as this_week_uses
  FROM wtf_command_logs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent wtf command usage (simplified - no admin check)
CREATE OR REPLACE FUNCTION get_recent_wtf_commands(limit_count INTEGER DEFAULT 50)
RETURNS TABLE(
  wallet_address TEXT,
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
    w.access_level,
    w.created_at,
    w.session_id,
    w.user_agent,
    w.ip_address
  FROM wtf_command_logs w
  ORDER BY w.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SEQUENCE wtf_command_logs_id_seq TO anon;
GRANT INSERT ON wtf_command_logs TO anon;
GRANT USAGE ON SEQUENCE wtf_command_logs_id_seq TO authenticated;
GRANT INSERT ON wtf_command_logs TO authenticated;
GRANT EXECUTE ON FUNCTION log_wtf_command TO anon;
GRANT EXECUTE ON FUNCTION log_wtf_command TO authenticated;
GRANT EXECUTE ON FUNCTION get_wtf_command_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_wtf_commands TO authenticated;

-- Add comment
COMMENT ON TABLE wtf_command_logs IS 'Tracks usage of the WTF command in the terminal for analytics and monitoring';
