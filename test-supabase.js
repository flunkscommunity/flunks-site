const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSupabase() {
  console.log('🔗 Testing Supabase connection...');
  
  // Test basic connection
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      return;
    }
    console.log('✅ Supabase connection successful');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    return;
  }

  // Test if get_next_locker_number function exists (as suggested by error)
  console.log('🔧 Testing get_next_locker_number function...');
  try {
    const { data, error } = await supabase.rpc('get_next_locker_number');
    
    if (error) {
      console.error('❌ get_next_locker_number error:', error);
    } else {
      console.log('✅ get_next_locker_number result:', data);
    }
  } catch (err) {
    console.error('❌ get_next_locker_number test failed:', err.message);
  }

  // Test if assign_next_locker function exists
  console.log('🔧 Testing assign_next_locker function...');
  try {
    const { data, error } = await supabase.rpc('assign_next_locker', { 
      user_wallet: '0x1234567890abcdef' 
    });
    
    if (error) {
      console.error('❌ Function error:', error);
    } else {
      console.log('✅ Function result:', data);
    }
  } catch (err) {
    console.error('❌ Function test failed:', err.message);
  }
}

testSupabase().then(() => process.exit(0));
