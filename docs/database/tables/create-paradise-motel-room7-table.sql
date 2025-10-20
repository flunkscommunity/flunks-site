-- Create paradise_motel_room7_visits table (like Homecoming Dance)
-- This table tracks Room 7 night visits for Chapter 5 Slacker rewards

CREATE TABLE IF NOT EXISTS paradise_motel_room7_visits (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    username TEXT DEFAULT 'Anonymous',
    gum_amount INTEGER NOT NULL DEFAULT 50,
    user_agent TEXT,
    ip_address TEXT,
    visit_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_room7_visits_wallet ON paradise_motel_room7_visits(wallet_address);
CREATE INDEX IF NOT EXISTS idx_room7_visits_timestamp ON paradise_motel_room7_visits(visit_timestamp);
CREATE INDEX IF NOT EXISTS idx_room7_visits_created ON paradise_motel_room7_visits(created_at);

-- Add comments for documentation
COMMENT ON TABLE paradise_motel_room7_visits IS 'Tracks Paradise Motel Room 7 night visits and Chapter 5 Slacker rewards';
COMMENT ON COLUMN paradise_motel_room7_visits.wallet_address IS 'Flow blockchain wallet address (unique per visit)';
COMMENT ON COLUMN paradise_motel_room7_visits.username IS 'Display username if available';
COMMENT ON COLUMN paradise_motel_room7_visits.gum_amount IS 'Amount of GUM awarded (50 for Chapter 5 Slacker)';
COMMENT ON COLUMN paradise_motel_room7_visits.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN paradise_motel_room7_visits.ip_address IS 'IP address of the user';
COMMENT ON COLUMN paradise_motel_room7_visits.visit_timestamp IS 'When the user visited Room 7 at night';

-- Enable Row Level Security
ALTER TABLE paradise_motel_room7_visits ENABLE ROW LEVEL SECURITY;

-- Create policies (drop first if they exist to avoid conflicts)
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON paradise_motel_room7_visits;
DROP POLICY IF EXISTS "Allow insert for service role" ON paradise_motel_room7_visits;

-- Create policy to allow reading for authenticated users
CREATE POLICY "Allow read access for authenticated users" ON paradise_motel_room7_visits
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow insert for service role
CREATE POLICY "Allow insert for service role" ON paradise_motel_room7_visits
    FOR INSERT WITH CHECK (true);

-- Insert a test record to verify the table works
INSERT INTO paradise_motel_room7_visits (
    wallet_address,
    username,
    gum_amount,
    user_agent,
    ip_address
) VALUES (
    'test_room7_wallet',
    'Test Chapter 5 Slacker',
    50,
    'Test User Agent - Paradise Motel Room 7',
    '127.0.0.1'
) ON CONFLICT (wallet_address) DO NOTHING;
