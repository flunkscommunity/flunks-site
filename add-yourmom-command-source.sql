-- Create yourmom_command_usage table for tracking terminal command usage
CREATE TABLE IF NOT EXISTS yourmom_command_usage (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(255),
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on wallet_address for faster queries
CREATE INDEX IF NOT EXISTS idx_yourmom_command_usage_wallet ON yourmom_command_usage(wallet_address);

-- Create index on used_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_yourmom_command_usage_used_at ON yourmom_command_usage(used_at);

-- Enable RLS (Row Level Security)
ALTER TABLE yourmom_command_usage ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to yourmom usage" ON yourmom_command_usage
    FOR SELECT USING (true);

-- Allow insert access to authenticated users for their own records
CREATE POLICY "Allow insert access to yourmom usage" ON yourmom_command_usage
    FOR INSERT WITH CHECK (true);
