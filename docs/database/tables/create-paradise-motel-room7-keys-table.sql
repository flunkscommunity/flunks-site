-- Create table to track users who obtained Room 7 key from the maid dialogue
CREATE TABLE IF NOT EXISTS paradise_motel_room7_keys (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT,
  UNIQUE(wallet_address)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_room7_keys_wallet ON paradise_motel_room7_keys(wallet_address);
CREATE INDEX IF NOT EXISTS idx_room7_keys_obtained_at ON paradise_motel_room7_keys(obtained_at);

-- Add comments
COMMENT ON TABLE paradise_motel_room7_keys IS 'Tracks which users obtained the Room 7 key from the maid dialogue';
COMMENT ON COLUMN paradise_motel_room7_keys.wallet_address IS 'User wallet address';
COMMENT ON COLUMN paradise_motel_room7_keys.obtained_at IS 'Timestamp when key was obtained';
COMMENT ON COLUMN paradise_motel_room7_keys.user_agent IS 'Browser user agent for debugging';
COMMENT ON COLUMN paradise_motel_room7_keys.ip_address IS 'IP address for fraud detection';
