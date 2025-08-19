-- Terminal Activities Schema
-- Tracks all terminal command activities for analytics and monitoring

-- Create table to track terminal command activities
CREATE TABLE IF NOT EXISTS terminal_activities (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT, -- Can be null for anonymous users
  command_entered TEXT NOT NULL,
  command_type TEXT, -- CODE, SYSTEM, HELP, UNKNOWN, ERROR
  response_given TEXT,
  success BOOLEAN DEFAULT false,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_terminal_activities_wallet ON terminal_activities(wallet_address);
CREATE INDEX IF NOT EXISTS idx_terminal_activities_created_at ON terminal_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_terminal_activities_command_type ON terminal_activities(command_type);
CREATE INDEX IF NOT EXISTS idx_terminal_activities_success ON terminal_activities(success);
CREATE INDEX IF NOT EXISTS idx_terminal_activities_session ON terminal_activities(session_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE terminal_activities ENABLE ROW LEVEL SECURITY;

-- Policy for anyone to insert terminal activities (including anonymous users)
CREATE POLICY "Anyone can insert terminal activities" ON terminal_activities
  FOR INSERT WITH CHECK (true);

-- Policy for authenticated users to view all records
CREATE POLICY "Authenticated users can view terminal activities" ON terminal_activities
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_terminal_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_terminal_activities_updated_at_trigger ON terminal_activities;
CREATE TRIGGER update_terminal_activities_updated_at_trigger
  BEFORE UPDATE ON terminal_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_terminal_activities_updated_at();

-- Function to get terminal activity statistics
CREATE OR REPLACE FUNCTION get_terminal_activity_stats()
RETURNS TABLE(
  total_commands BIGINT,
  unique_users BIGINT,
  successful_commands BIGINT,
  wtf_commands BIGINT,
  help_commands BIGINT,
  system_commands BIGINT,
  unknown_commands BIGINT,
  today_commands BIGINT,
  this_week_commands BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_commands,
    COUNT(DISTINCT wallet_address) as unique_users,
    COUNT(*) FILTER (WHERE success = true) as successful_commands,
    COUNT(*) FILTER (WHERE command_entered = 'wtf') as wtf_commands,
    COUNT(*) FILTER (WHERE command_entered = 'help') as help_commands,
    COUNT(*) FILTER (WHERE command_type = 'SYSTEM') as system_commands,
    COUNT(*) FILTER (WHERE command_type = 'UNKNOWN') as unknown_commands,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_commands,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('week', CURRENT_DATE)) as this_week_commands
  FROM terminal_activities;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent terminal activities (for admin review)
CREATE OR REPLACE FUNCTION get_recent_terminal_activities(limit_count INTEGER DEFAULT 50)
RETURNS TABLE(
  wallet_address TEXT,
  command_entered TEXT,
  command_type TEXT,
  response_given TEXT,
  success BOOLEAN,
  created_at TIMESTAMPTZ,
  session_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.wallet_address,
    t.command_entered,
    t.command_type,
    t.response_given,
    t.success,
    t.created_at,
    t.session_id
  FROM terminal_activities t
  ORDER BY t.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SEQUENCE terminal_activities_id_seq TO anon;
GRANT INSERT ON terminal_activities TO anon;
GRANT USAGE ON SEQUENCE terminal_activities_id_seq TO authenticated;
GRANT INSERT ON terminal_activities TO authenticated;
GRANT SELECT ON terminal_activities TO authenticated;
GRANT EXECUTE ON FUNCTION get_terminal_activity_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_terminal_activities TO authenticated;

-- Add comment
COMMENT ON TABLE terminal_activities IS 'Tracks all terminal command activities for analytics and monitoring, including anonymous users';
