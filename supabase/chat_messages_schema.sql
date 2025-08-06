-- Chat Messages Table for Flunks Messenger
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  room_name VARCHAR(100) NOT NULL,
  username VARCHAR(32) NOT NULL,
  wallet_address VARCHAR(64),
  message_text TEXT NOT NULL,
  is_ai BOOLEAN DEFAULT FALSE,
  ai_agent_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_chat_messages_room ON chat_messages(room_name);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_username ON chat_messages(username);
CREATE INDEX idx_chat_messages_room_time ON chat_messages(room_name, created_at DESC);

-- Add constraints
ALTER TABLE chat_messages 
ADD CONSTRAINT message_text_length CHECK (length(message_text) >= 1 AND length(message_text) <= 2000);

ALTER TABLE chat_messages 
ADD CONSTRAINT room_name_format CHECK (room_name ~ '^[a-zA-Z0-9_\-\s🤖🧙‍♂️☕🏈💬🎮🏫🎵]+$');

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read messages (public chat)
CREATE POLICY "Allow public read access to messages" ON chat_messages
FOR SELECT USING (true);

-- Policy to allow authenticated users to insert messages
-- In production, you might want to add rate limiting and validation
CREATE POLICY "Allow message posting" ON chat_messages
FOR INSERT WITH CHECK (true);

-- Optional: Policy to allow users to delete their own messages
CREATE POLICY "Allow users to delete own messages" ON chat_messages
FOR DELETE USING (wallet_address = current_setting('app.user_wallet', true));

-- Create a function to cleanup old messages (optional)
-- Keep only last 1000 messages per room to prevent infinite growth
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM chat_messages 
  WHERE id NOT IN (
    SELECT id FROM (
      SELECT id, 
             ROW_NUMBER() OVER (PARTITION BY room_name ORDER BY created_at DESC) as rn
      FROM chat_messages
    ) ranked
    WHERE rn <= 1000
  );
END;
$$ LANGUAGE plpgsql;

-- Create a view for recent messages (last 100 per room)
CREATE VIEW recent_chat_messages AS
SELECT * FROM (
  SELECT *,
         ROW_NUMBER() OVER (PARTITION BY room_name ORDER BY created_at DESC) as rn
  FROM chat_messages
) ranked
WHERE rn <= 100
ORDER BY created_at ASC;

-- Grant permissions on the view
GRANT SELECT ON recent_chat_messages TO authenticated, anon;
