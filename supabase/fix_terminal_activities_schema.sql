-- Migration to fix terminal activities schema
-- This ensures the table has the correct column names

-- Drop the old terminal_activities table if it exists with wrong schema
DROP TABLE IF EXISTS terminal_activities CASCADE;

-- Create the terminal_activities table with correct schema
CREATE TABLE terminal_activities (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT, -- Can be null for anonymous users
  command_input TEXT NOT NULL,
  access_level TEXT,
  session_id TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_terminal_activities_wallet ON terminal_activities(wallet_address);
CREATE INDEX idx_terminal_activities_created_at ON terminal_activities(created_at);
CREATE INDEX idx_terminal_activities_access_level ON terminal_activities(access_level);
CREATE INDEX idx_terminal_activities_session ON terminal_activities(session_id);

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

-- Create a function to log terminal commands
CREATE OR REPLACE FUNCTION log_terminal_command(
  p_wallet_address TEXT,
  p_command_input TEXT DEFAULT 'wtf',
  p_access_level TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO terminal_activities (
    wallet_address,
    command_input,
    access_level,
    session_id,
    user_agent
  ) VALUES (
    p_wallet_address,
    p_command_input,
    p_access_level,
    p_session_id,
    p_user_agent
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error logging terminal command: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION log_terminal_command TO anon;
GRANT EXECUTE ON FUNCTION log_terminal_command TO authenticated;
