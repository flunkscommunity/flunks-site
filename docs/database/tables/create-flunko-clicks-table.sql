-- Create flunko_clicks table (similar to friday_night_lights_clicks)
CREATE TABLE IF NOT EXISTS flunko_clicks (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(50) NOT NULL,
  clicked_from_clique VARCHAR(50),
  clicked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address) -- Only allow one click per wallet for the achievement
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_flunko_clicks_wallet ON flunko_clicks(wallet_address);

-- Insert a test record for your wallet to verify it works
INSERT INTO flunko_clicks (wallet_address, clicked_from_clique, clicked_at)
VALUES ('0x50b39b127236f46a', 'test', NOW())
ON CONFLICT (wallet_address) DO NOTHING;

SELECT 'flunko_clicks table created successfully!' AS message;