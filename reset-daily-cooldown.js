// Reset Daily Login Cooldown Script
// Run this to reset your daily login so you can test immediately

console.log('🔄 Resetting daily login cooldown...');

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Missing Supabase environment variables');
  console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetCooldown() {
  try {
    // Get your actual wallet address from the site
    const testWallet = '0x123test';
    
    console.log('🗑️ Deleting old cooldown record for:', testWallet);
    
    // Delete the existing cooldown record so you can claim again
    const { error } = await supabase
      .from('user_gum_cooldowns')
      .delete()
      .eq('wallet_address', testWallet)
      .eq('source_name', 'daily_login');
    
    if (error) {
      console.error('❌ Error deleting cooldown:', error);
    } else {
      console.log('✅ Daily login cooldown reset!');
      console.log('🎯 You can now test the daily login claim again');
      
      // Test the claim immediately
      console.log('🧪 Testing daily claim...');
      
      const response = await fetch('http://localhost:3000/api/daily-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: testWallet })
      });
      
      const result = await response.json();
      console.log('📋 Result:', result);
    }
    
  } catch (error) {
    console.error('❌ Error in reset:', error);
  }
}

resetCooldown();
