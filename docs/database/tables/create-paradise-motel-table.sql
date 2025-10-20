-- Create paradise_motel_entries table (similar to friday_night_lights_clicks)
CREATE TABLE IF NOT EXISTS paradise_motel_entries (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(50) NOT NULL,
  entered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address) -- Only allow one entry per wallet for the achievement
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_paradise_motel_wallet ON paradise_motel_entries(wallet_address);

-- Insert a test record for your wallet to verify it works
INSERT INTO paradise_motel_entries (wallet_address, entered_at)
VALUES ('0x50b39b127236f46a', NOW())
ON CONFLICT (wallet_address) DO NOTHING;

SELECT 'paradise_motel_entries table created successfully!' AS message;