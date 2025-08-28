// Test the crack-the-code tracking system
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jejycbxxdsrcsobmvbbz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplanljYnh4ZHNyY3NvYm12YmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTk1NjksImV4cCI6MjA2NTY3NTU2OX0.J14zg5h4W_d7SjTN97RbDqCmdAYS9q7x7ZoSxLz0dkE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCrackTheCodeTracking() {
  console.log('🔓 Testing Crack-The-Code tracking system...')
  
  // Test if table exists by checking current records
  const { data, error } = await supabase
    .from('crack_the_code')
    .select('*')
    .limit(5)

  if (error) {
    console.log('❌ crack_the_code table not found:', error.message)
    console.log('')
    console.log('📝 Need to create crack_the_code table in Supabase:')
    console.log('Go to: https://supabase.com/dashboard/project/jejycbxxdsrcsobmvbbz/editor')
    console.log('')
    console.log('Run this SQL:')
    console.log('─'.repeat(60))
    console.log(`CREATE TABLE crack_the_code (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  username TEXT,
  cracked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_crack_wallet_address ON crack_the_code(wallet_address);
CREATE INDEX idx_crack_cracked_at ON crack_the_code(cracked_at);

ALTER TABLE crack_the_code ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON crack_the_code FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON crack_the_code FOR INSERT WITH CHECK (true);`)
    console.log('─'.repeat(60))
    
    return
  } else {
    console.log('✅ crack_the_code table exists!')
    console.log(`📊 Found ${data.length} code crackers:`)
    data.forEach((record, index) => {
      console.log(`${index + 1}. ${record.username || 'Anonymous'} (${record.wallet_address.substring(0, 8)}...) cracked it at ${new Date(record.cracked_at).toLocaleString()}`)
    })
    
    // Get total count
    const { count } = await supabase
      .from('crack_the_code')
      .select('*', { count: 'exact', head: true })

    console.log(`🎯 Total successful code cracks: ${count || 0}`)
  }

  // Test API endpoint
  console.log('')
  console.log('🧪 Testing API endpoint...')
  
  try {
    const response = await fetch('http://localhost:3000/api/crack-the-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: 'test-wallet-' + Date.now(),
        username: 'TestHacker'
      })
    })
    
    const result = await response.json()
    console.log('✅ API Response:', result)
  } catch (error) {
    console.log('⚠️  API test failed (server might not be running):', error.message)
    console.log('💡 Start dev server with: npm run dev')
  }
}

console.log('🎯 Testing the "YOU DID IT!" button tracking system...')
testCrackTheCodeTracking()
