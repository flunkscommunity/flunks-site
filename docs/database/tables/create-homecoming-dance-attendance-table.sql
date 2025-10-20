-- Create homecoming_dance_attendance table (like Friday Night Lights)
-- This table tracks homecoming dance attendance separately from user_gum_transactions

CREATE TABLE IF NOT EXISTS homecoming_dance_attendance (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    username TEXT DEFAULT 'Anonymous',
    gum_amount INTEGER NOT NULL DEFAULT 50,
    user_agent TEXT,
    ip_address TEXT,
    attendance_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_homecoming_attendance_wallet ON homecoming_dance_attendance(wallet_address);
CREATE INDEX IF NOT EXISTS idx_homecoming_attendance_timestamp ON homecoming_dance_attendance(attendance_timestamp);
CREATE INDEX IF NOT EXISTS idx_homecoming_attendance_created ON homecoming_dance_attendance(created_at);

-- Add comments for documentation
COMMENT ON TABLE homecoming_dance_attendance IS 'Tracks homecoming dance attendance and Chapter 4 Slacker rewards';
COMMENT ON COLUMN homecoming_dance_attendance.wallet_address IS 'Flow blockchain wallet address (unique per dance)';
COMMENT ON COLUMN homecoming_dance_attendance.username IS 'Display username if available';
COMMENT ON COLUMN homecoming_dance_attendance.gum_amount IS 'Amount of GUM awarded (50 for Chapter 4 Slacker)';
COMMENT ON COLUMN homecoming_dance_attendance.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN homecoming_dance_attendance.ip_address IS 'IP address of the user';
COMMENT ON COLUMN homecoming_dance_attendance.attendance_timestamp IS 'When the user attended the dance';

-- Enable Row Level Security
ALTER TABLE homecoming_dance_attendance ENABLE ROW LEVEL SECURITY;

-- Create policies (drop first if they exist to avoid conflicts)
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON homecoming_dance_attendance;
DROP POLICY IF EXISTS "Allow insert for service role" ON homecoming_dance_attendance;

-- Create policy to allow reading for authenticated users
CREATE POLICY "Allow read access for authenticated users" ON homecoming_dance_attendance
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow insert for service role
CREATE POLICY "Allow insert for service role" ON homecoming_dance_attendance
    FOR INSERT WITH CHECK (true);

-- Insert a test record to verify the table works
INSERT INTO homecoming_dance_attendance (
    wallet_address,
    username,
    gum_amount,
    user_agent,
    ip_address
) VALUES (
    'test_homecoming_wallet',
    'Test Chapter 4 Slacker',
    50,
    'Test User Agent - Homecoming Dance',
    '127.0.0.1'
) ON CONFLICT (wallet_address) DO NOTHING;