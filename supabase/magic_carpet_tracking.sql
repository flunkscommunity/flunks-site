-- Magic Carpet Command Tracking Schema
-- Tracks when users input the 'magic carpet' command in the terminal

-- Create table to track magic carpet command usage
CREATE TABLE IF NOT EXISTS magic_carpet_logs (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT, -- Can be null for anonymous users
  username TEXT, -- User's profile username, can be null
  command_input TEXT DEFAULT 'magic carpet',
  access_level TEXT, -- ADMIN, BETA, COMMUNITY
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_magic_carpet_logs_wallet ON magic_carpet_logs(wallet_address);
CREATE INDEX IF NOT EXISTS idx_magic_carpet_logs_username ON magic_carpet_logs(username);
CREATE INDEX IF NOT EXISTS idx_magic_carpet_logs_created_at ON magic_carpet_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_magic_carpet_logs_access_level ON magic_carpet_logs(access_level);

-- Add RLS (Row Level Security) policies
ALTER TABLE magic_carpet_logs ENABLE ROW LEVEL SECURITY;

-- Policy for users to insert their own records (including anonymous users)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'magic_carpet_logs' 
      AND policyname = 'Allow users to insert their own magic carpet logs'
  ) THEN
    CREATE POLICY "Allow users to insert their own magic carpet logs" ON magic_carpet_logs
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
    WHERE schemaname = 'public' AND tablename = 'magic_carpet_logs' 
      AND policyname = 'Users can view their own magic carpet logs'
  ) THEN
    CREATE POLICY "Users can view their own magic carpet logs" ON magic_carpet_logs
      FOR SELECT USING (wallet_address = auth.jwt() ->> 'wallet_address');
  END IF;
END$$;

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_magic_carpet_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_magic_carpet_logs_updated_at_trigger ON magic_carpet_logs;
CREATE TRIGGER update_magic_carpet_logs_updated_at_trigger
  BEFORE UPDATE ON magic_carpet_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_magic_carpet_logs_updated_at();

-- Function to log magic carpet command usage
CREATE OR REPLACE FUNCTION log_magic_carpet_command(
  p_wallet_address TEXT,
  p_username TEXT DEFAULT NULL,
  p_access_level TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO magic_carpet_logs (
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

-- Function to get magic carpet command statistics
CREATE OR REPLACE FUNCTION get_magic_carpet_stats()
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
  FROM magic_carpet_logs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent magic carpet command usage (simplified - no admin check)
CREATE OR REPLACE FUNCTION get_recent_magic_carpet_commands(limit_count INTEGER DEFAULT 50)
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
  FROM magic_carpet_logs w
  ORDER BY w.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SEQUENCE magic_carpet_logs_id_seq TO anon;
GRANT INSERT ON magic_carpet_logs TO anon;
GRANT USAGE ON SEQUENCE magic_carpet_logs_id_seq TO authenticated;
GRANT INSERT ON magic_carpet_logs TO authenticated;
GRANT EXECUTE ON FUNCTION log_magic_carpet_command TO anon;
GRANT EXECUTE ON FUNCTION log_magic_carpet_command TO authenticated;
GRANT EXECUTE ON FUNCTION get_magic_carpet_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_magic_carpet_commands TO authenticated;

-- Add comment
COMMENT ON TABLE magic_carpet_logs IS 'Tracks usage of the magic carpet command in the terminal for analytics and monitoring';
