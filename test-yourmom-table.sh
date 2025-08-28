#!/bin/bash

# Test yourmom command table creation
echo "🎯 Creating yourmom_command_usage table..."

# Create the table using Supabase SQL editor or direct execution
# This script helps test the table creation

# Table structure:
cat << 'EOF'
CREATE TABLE IF NOT EXISTS yourmom_command_usage (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(255),
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_yourmom_command_usage_wallet ON yourmom_command_usage(wallet_address);
CREATE INDEX IF NOT EXISTS idx_yourmom_command_usage_used_at ON yourmom_command_usage(used_at);

ALTER TABLE yourmom_command_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow read access to yourmom command usage" ON yourmom_command_usage
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow insert access to yourmom command usage" ON yourmom_command_usage
    FOR INSERT WITH CHECK (true);
EOF

echo "✅ Table SQL generated! Copy the above SQL to Supabase SQL Editor"
