CREATE TABLE IF NOT EXISTS wtf_command_usage (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    username TEXT,
    command_used TEXT NOT NULL CHECK (command_used IN ('wtf', 'WTF')),
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wtf_wallet_address ON wtf_command_usage(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wtf_executed_at ON wtf_command_usage(executed_at);
CREATE INDEX IF NOT EXISTS idx_wtf_command_used ON wtf_command_usage(command_used);

ALTER TABLE wtf_command_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own WTF command usage" ON wtf_command_usage;
CREATE POLICY "Users can view their own WTF command usage" ON wtf_command_usage
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow inserting WTF command usage" ON wtf_command_usage;
CREATE POLICY "Allow inserting WTF command usage" ON wtf_command_usage
    FOR INSERT WITH CHECK (true);
