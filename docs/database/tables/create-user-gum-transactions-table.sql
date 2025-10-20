-- Create user_gum_transactions table for Chapter 4 Slacker system
-- This table tracks all GUM transactions including homecoming dance attendance

CREATE TABLE IF NOT EXISTS user_gum_transactions (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    amount INTEGER NOT NULL,
    source TEXT NOT NULL,
    description TEXT,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_gum_transactions_wallet ON user_gum_transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_gum_transactions_source ON user_gum_transactions(source);
CREATE INDEX IF NOT EXISTS idx_user_gum_transactions_created ON user_gum_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_gum_transactions_wallet_source ON user_gum_transactions(wallet_address, source);

-- Add comments for documentation
COMMENT ON TABLE user_gum_transactions IS 'Tracks all GUM transactions including rewards, spending, and special events';
COMMENT ON COLUMN user_gum_transactions.wallet_address IS 'Flow blockchain wallet address of the user';
COMMENT ON COLUMN user_gum_transactions.amount IS 'Amount of GUM (positive for earning, negative for spending)';
COMMENT ON COLUMN user_gum_transactions.source IS 'Source of the transaction (e.g., chapter4_homecoming_dance, daily_checkin, etc.)';
COMMENT ON COLUMN user_gum_transactions.description IS 'Human-readable description of the transaction';
COMMENT ON COLUMN user_gum_transactions.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN user_gum_transactions.ip_address IS 'IP address of the user';

-- Enable Row Level Security (optional)
ALTER TABLE user_gum_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies (drop first if they exist to avoid conflicts)
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON user_gum_transactions;
DROP POLICY IF EXISTS "Allow insert for service role" ON user_gum_transactions;

-- Create policy to allow reading for authenticated users (optional)
CREATE POLICY "Allow read access for authenticated users" ON user_gum_transactions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow insert for service role
CREATE POLICY "Allow insert for service role" ON user_gum_transactions
    FOR INSERT WITH CHECK (true);

-- Insert a test record to verify the table works
-- (Remove this after confirming the table is working)
INSERT INTO user_gum_transactions (
    wallet_address,
    amount,
    source,
    description,
    user_agent,
    ip_address
) VALUES (
    'test_wallet_address',
    50,
    'chapter4_homecoming_dance',
    'Chapter 4 Slacker - Homecoming Dance attendance',
    'Test User Agent',
    '127.0.0.1'
) ON CONFLICT DO NOTHING;