-- User Profiles Table
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(64) UNIQUE NOT NULL,
  username VARCHAR(32) UNIQUE NOT NULL,
  discord_id VARCHAR(64),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_user_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_discord ON user_profiles(discord_id);

-- Add constraints
ALTER TABLE user_profiles 
ADD CONSTRAINT username_length CHECK (length(username) >= 3 AND length(username) <= 32);

ALTER TABLE user_profiles 
ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$');

-- Add trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional but recommended)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read any profile (for username checks)
CREATE POLICY "Allow public read access" ON user_profiles
FOR SELECT USING (true);

-- Policy to allow anyone to insert/update profiles (since we're using wallet-based auth)
-- Note: In production, you might want to add additional validation here
CREATE POLICY "Allow profile management" ON user_profiles
FOR ALL USING (true);
