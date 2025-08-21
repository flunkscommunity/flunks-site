-- Fix WTF Logs - Create table and function step by step

-- 1. Create the wtf_logs table first
CREATE TABLE IF NOT EXISTS wtf_logs (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  username TEXT,
  access_level TEXT,
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add indexes
CREATE INDEX IF NOT EXISTS idx_wtf_logs_wallet ON wtf_logs(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wtf_logs_username ON wtf_logs(username);
CREATE INDEX IF NOT EXISTS idx_wtf_logs_created_at ON wtf_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_wtf_logs_access_level ON wtf_logs(access_level);

-- 3. Enable RLS
ALTER TABLE wtf_logs ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert wtf logs" ON wtf_logs;
DROP POLICY IF EXISTS "Authenticated users can view wtf logs" ON wtf_logs;

-- 5. Create RLS policies
CREATE POLICY "Anyone can insert wtf logs" ON wtf_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view wtf logs" ON wtf_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 6. Drop existing function
DROP FUNCTION IF EXISTS log_wtf_command CASCADE;

-- 7. Create the function with exact parameter signature
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
    CASE 
      WHEN p_ip_address IS NOT NULL THEN CAST(p_ip_address AS INET)
      ELSE NULL
    END
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
