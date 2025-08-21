-- Add username column to existing magic_carpet_logs table
-- Run this in Supabase SQL Editor to add username tracking

-- Add username column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'magic_carpet_logs' 
                 AND column_name = 'username') THEN
    ALTER TABLE magic_carpet_logs ADD COLUMN username TEXT;
  END IF;
END $$;

-- Add index for username column
CREATE INDEX IF NOT EXISTS idx_magic_carpet_logs_username ON magic_carpet_logs(username);

-- Update the log_magic_carpet_command function to include username
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

-- Drop and recreate the get_recent_magic_carpet_commands function to include username
DROP FUNCTION IF EXISTS get_recent_magic_carpet_commands(INTEGER);
CREATE FUNCTION get_recent_magic_carpet_commands(limit_count INTEGER DEFAULT 50)
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
