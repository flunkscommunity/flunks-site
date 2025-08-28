-- Create Fetty Wap command tracking table
-- This tracks when users run the "fetty wap" terminal command

CREATE TABLE IF NOT EXISTS fetty_wap_usage (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    username TEXT,
    command_used TEXT NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fetty_wap_wallet_address ON fetty_wap_usage(wallet_address);
CREATE INDEX IF NOT EXISTS idx_fetty_wap_executed_at ON fetty_wap_usage(executed_at);
CREATE INDEX IF NOT EXISTS idx_fetty_wap_command_used ON fetty_wap_usage(command_used);

-- Add RLS policy (Row Level Security)
ALTER TABLE fetty_wap_usage ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see records
CREATE POLICY "Allow public read" ON fetty_wap_usage FOR SELECT USING (true);

-- Policy to allow inserting new records
CREATE POLICY "Allow public insert" ON fetty_wap_usage FOR INSERT WITH CHECK (true);
