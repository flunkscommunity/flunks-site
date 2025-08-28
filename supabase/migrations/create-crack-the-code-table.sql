-- Create table to track users who crack the access code
CREATE TABLE crack_the_code (
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
CREATE INDEX idx_crack_the_code_wallet ON crack_the_code(wallet_address);
CREATE INDEX idx_crack_the_code_completed_at ON crack_the_code(completed_at);

-- Add unique constraint to prevent duplicate entries per wallet
CREATE UNIQUE INDEX idx_crack_the_code_unique_wallet ON crack_the_code(wallet_address);

-- Add RLS (Row Level Security) policies
ALTER TABLE crack_the_code ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to read their own records
CREATE POLICY "Users can view their own crack_the_code records" 
  ON crack_the_code 
  FOR SELECT 
  USING (auth.uid()::text = wallet_address);

-- Policy: Allow authenticated users to insert their own records
CREATE POLICY "Users can insert their own crack_the_code records" 
  ON crack_the_code 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = wallet_address);

-- Policy: Allow service role to read all records (for admin dashboard)
CREATE POLICY "Service role can view all crack_the_code records" 
  ON crack_the_code 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE crack_the_code IS 'Tracks users who successfully crack the digital lock access code';
COMMENT ON COLUMN crack_the_code.wallet_address IS 'User wallet address from Dynamic Auth';
COMMENT ON COLUMN crack_the_code.username IS 'Username from user profile or wallet';
COMMENT ON COLUMN crack_the_code.completed_at IS 'When user clicked the You did it button';
COMMENT ON COLUMN crack_the_code.user_agent IS 'Browser user agent for analytics';
COMMENT ON COLUMN crack_the_code.ip_address IS 'User IP address for analytics';
