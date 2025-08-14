const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testLockerAssignment() {
  console.log('🧪 Testing locker assignment API...');
  
  const testWallet = '0x1234567890abcdef1234567890abcdef12345678';
  
  // First, create a test user profile
  console.log('👤 Creating test user profile...');
  const { data: userData, error: userError } = await supabase
    .from('user_profiles')
    .upsert({
      wallet_address: testWallet,
      username: 'testuser123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (userError) {
    console.error('❌ Error creating test user:', userError);
    return;
  }
  
  console.log('✅ Test user created:', userData);

  // Now test the API endpoint
  console.log('🎯 Testing assign-locker API...');
  try {
    const response = await fetch('http://localhost:3000/api/assign-locker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: testWallet
      })
    });

    const result = await response.json();
    console.log('📊 API Response status:', response.status);
    console.log('📊 API Response data:', result);

    if (response.ok) {
      console.log('✅ Locker assignment successful!');
    } else {
      console.log('❌ Locker assignment failed');
    }

  } catch (err) {
    console.error('❌ API call failed:', err.message);
  }

  // Clean up test user
  console.log('🧹 Cleaning up test user...');
  await supabase
    .from('user_profiles')
    .delete()
    .eq('wallet_address', testWallet);
  
  console.log('✅ Test completed');
}

testLockerAssignment().then(() => process.exit(0));
