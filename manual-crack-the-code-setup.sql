-- Manual SQL to run in Supabase Dashboard
-- Copy and paste this into the SQL Editor

-- Create table to track users who crack the access code
CREATE TABLE IF NOT EXISTS crack_the_code (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  username TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_crack_the_code_wallet ON crack_the_code(wallet_address);
CREATE INDEX IF NOT EXISTS idx_crack_the_code_completed_at ON crack_the_code(completed_at);

-- Add unique constraint to prevent duplicate entries per wallet
CREATE UNIQUE INDEX IF NOT EXISTS idx_crack_the_code_unique_wallet ON crack_the_code(wallet_address);

-- Add RLS (Row Level Security) policies
ALTER TABLE crack_the_code ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own crack_the_code records" ON crack_the_code;
DROP POLICY IF EXISTS "Users can insert their own crack_the_code records" ON crack_the_code;  
DROP POLICY IF EXISTS "Service role can view all crack_the_code records" ON crack_the_code;

-- Policy: Allow users to read their own records
CREATE POLICY "Users can view their own crack_the_code records" 
  ON crack_the_code 
  FOR SELECT 
  USING (true); -- Allow all users to read for now

-- Policy: Allow anyone to insert records (we'll validate in API)
CREATE POLICY "Anyone can insert crack_the_code records" 
  ON crack_the_code 
  FOR INSERT 
  WITH CHECK (true);

-- Policy: Allow anyone to update records (we'll validate in API)
CREATE POLICY "Anyone can update crack_the_code records" 
  ON crack_the_code 
  FOR UPDATE 
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE crack_the_code IS 'Tracks users who successfully crack the digital lock access code';
COMMENT ON COLUMN crack_the_code.wallet_address IS 'User wallet address from Dynamic Auth';
COMMENT ON COLUMN crack_the_code.username IS 'Username from user profile or wallet';
COMMENT ON COLUMN crack_the_code.completed_at IS 'When user clicked the You did it button';
COMMENT ON COLUMN crack_the_code.user_agent IS 'Browser user agent for analytics';
COMMENT ON COLUMN crack_the_code.ip_address IS 'User IP address for analytics';
