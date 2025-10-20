-- Create table for tracking Flunky Uppy arcade machine entries
-- This tracks who clicks to enter the game from the arcade

CREATE TABLE flunky_uppy_entries (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    username TEXT DEFAULT 'Anonymous',
    user_agent TEXT,
    referrer_url TEXT,
    ip_address TEXT,
    entry_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_flunky_uppy_entries_wallet ON flunky_uppy_entries(wallet_address);
CREATE INDEX idx_flunky_uppy_entries_timestamp ON flunky_uppy_entries(entry_timestamp);
CREATE INDEX idx_flunky_uppy_entries_created ON flunky_uppy_entries(created_at);

-- Add comments for documentation
COMMENT ON TABLE flunky_uppy_entries IS 'Tracks user entries into Flunky Uppy arcade game from Flow blockchain integration';
COMMENT ON COLUMN flunky_uppy_entries.wallet_address IS 'Flow blockchain wallet address of the user';
COMMENT ON COLUMN flunky_uppy_entries.username IS 'Display username if available';
COMMENT ON COLUMN flunky_uppy_entries.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN flunky_uppy_entries.referrer_url IS 'Page that referred to the game';
COMMENT ON COLUMN flunky_uppy_entries.ip_address IS 'IP address of the user';
COMMENT ON COLUMN flunky_uppy_entries.entry_timestamp IS 'When the user clicked to enter the game';

-- Enable Row Level Security (optional)
ALTER TABLE flunky_uppy_entries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading for authenticated users (optional)
CREATE POLICY "Allow read access for authenticated users" ON flunky_uppy_entries
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow insert for service role
CREATE POLICY "Allow insert for service role" ON flunky_uppy_entries
    FOR INSERT WITH CHECK (true);