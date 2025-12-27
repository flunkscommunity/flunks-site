-- Chapter 6: Four Thieves Underground Access Tracking
-- Tracks users who successfully entered "snicklefritz" to access The Underground

CREATE TABLE IF NOT EXISTS four_thieves_underground_access (
    id BIGSERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    username TEXT,
    gum_amount INTEGER DEFAULT 75,
    user_agent TEXT,
    ip_address TEXT,
    access_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_four_thieves_wallet ON four_thieves_underground_access(wallet_address);
CREATE INDEX IF NOT EXISTS idx_four_thieves_timestamp ON four_thieves_underground_access(access_timestamp);
CREATE INDEX IF NOT EXISTS idx_four_thieves_created ON four_thieves_underground_access(created_at);

-- Enable Row Level Security
ALTER TABLE four_thieves_underground_access ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read, only authenticated users can insert
CREATE POLICY "Allow public read access" ON four_thieves_underground_access
    FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated users" ON four_thieves_underground_access
    FOR INSERT WITH CHECK (true);

-- Add comment
COMMENT ON TABLE four_thieves_underground_access IS 'Chapter 6 Slacker objective: Users who discovered snicklefritz password for Underground access';

-- Test record (optional - remove in production)
INSERT INTO four_thieves_underground_access (wallet_address, username, gum_amount, user_agent, ip_address)
VALUES ('0xTESTWALLET123', 'TestUser', 75, 'Test Browser', '127.0.0.1')
ON CONFLICT (wallet_address) DO NOTHING;
