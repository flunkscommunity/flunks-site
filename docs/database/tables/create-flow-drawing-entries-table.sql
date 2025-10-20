-- Create flow_drawing_entries table for tracking Flow Drawing entries
-- This table tracks users who enter the Flow Drawing from the arcade

CREATE TABLE IF NOT EXISTS flow_drawing_entries (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    username TEXT DEFAULT 'Anonymous',
    user_agent TEXT,
    referrer_url TEXT,
    ip_address TEXT,
    entry_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_flow_drawing_entries_wallet ON flow_drawing_entries(wallet_address);
CREATE INDEX IF NOT EXISTS idx_flow_drawing_entries_timestamp ON flow_drawing_entries(entry_timestamp);
CREATE INDEX IF NOT EXISTS idx_flow_drawing_entries_created ON flow_drawing_entries(created_at);

-- Add comments for documentation
COMMENT ON TABLE flow_drawing_entries IS 'Tracks user entries into Flow Drawing from arcade machine';
COMMENT ON COLUMN flow_drawing_entries.wallet_address IS 'Flow blockchain wallet address of the user (unique)';
COMMENT ON COLUMN flow_drawing_entries.username IS 'Display username if available';
COMMENT ON COLUMN flow_drawing_entries.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN flow_drawing_entries.referrer_url IS 'Page that referred to the drawing';
COMMENT ON COLUMN flow_drawing_entries.ip_address IS 'IP address of the user';
COMMENT ON COLUMN flow_drawing_entries.entry_timestamp IS 'When the user entered the drawing';

-- Enable Row Level Security (optional)
ALTER TABLE flow_drawing_entries ENABLE ROW LEVEL SECURITY;

-- Create policies (drop first if they exist to avoid conflicts)
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON flow_drawing_entries;
DROP POLICY IF EXISTS "Allow insert for service role" ON flow_drawing_entries;

-- Create policy to allow reading for authenticated users (optional)
CREATE POLICY "Allow read access for authenticated users" ON flow_drawing_entries
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow insert for service role
CREATE POLICY "Allow insert for service role" ON flow_drawing_entries
    FOR INSERT WITH CHECK (true);

-- Insert a test record to verify the table works
-- (Remove this after confirming the table is working)
INSERT INTO flow_drawing_entries (
    wallet_address,
    username,
    user_agent,
    referrer_url,
    ip_address
) VALUES (
    'test_flow_drawing_wallet',
    'Test User',
    'Test User Agent - Flow Drawing',
    'https://test-site.com/arcade',
    '127.0.0.1'
) ON CONFLICT (wallet_address) DO NOTHING;