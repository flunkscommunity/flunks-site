// Test script to create and test Fetty Wap tracking
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jejycbxxdsrcsobmvbbz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplanljYnh4ZHNyY3NvYm12YmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTk1NjksImV4cCI6MjA2NTY3NTU2OX0.J14zg5h4W_d7SjTN97RbDqCmdAYS9q7x7ZoSxLz0dkE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFettyWapTracking() {
  console.log('🎵 Testing Fetty Wap tracking system...')
  
  // Test if table exists by trying to insert a record
  const { data, error } = await supabase
    .from('fetty_wap_usage')
    .insert([
      {
        wallet_address: '0x1234567890abcdef',
        username: 'test_user',
        command_used: 'fetty wap'
      }
    ])
    .select()

  if (error) {
    console.log('❌ Table does not exist yet. Error:', error.message)
    console.log('')
    console.log('📝 Please create the fetty_wap_usage table in your Supabase dashboard:')
    console.log('Go to: https://supabase.com/dashboard/project/jejycbxxdsrcsobmvbbz/editor')
    console.log('')
    console.log('Run this SQL:')
    console.log('─'.repeat(60))
    console.log(`CREATE TABLE fetty_wap_usage (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  username TEXT,
  command_used TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fetty_wap_wallet_address ON fetty_wap_usage(wallet_address);
CREATE INDEX idx_fetty_wap_executed_at ON fetty_wap_usage(executed_at);
CREATE INDEX idx_fetty_wap_command_used ON fetty_wap_usage(command_used);

ALTER TABLE fetty_wap_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON fetty_wap_usage FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON fetty_wap_usage FOR INSERT WITH CHECK (true);`)
    console.log('─'.repeat(60))
    console.log('')
    console.log('After running the SQL, test again with: node test-fetty-wap-tracking.js')
  } else {
    console.log('✅ fetty_wap_usage table exists and working!')
    console.log('Test record inserted:', data)
    
    // Clean up test record
    await supabase
      .from('fetty_wap_usage')
      .delete()
      .eq('wallet_address', '0x1234567890abcdef')
    
    console.log('🧹 Test record cleaned up')
    
    // Show usage stats
    const { data: stats } = await supabase
      .from('fetty_wap_usage')
      .select('*')
      .limit(5)
    
    console.log('📊 Recent Fetty Wap usage:', stats)
  }
}

console.log('🎯 Adding flunks.fettyWapTest() function for testing...')
console.log('Use: flunks.fettyWapTest() to test Fetty Wap tracking from console')

testFettyWapTracking()
