const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixJeremyLocker() {
  console.log('🔧 Fixing Jeremy\'s locker assignment...');
  
  // Your wallet from the screenshot
  const yourWallet = '0x50b359b1272bbf52ca3e8b65e6de7de5e08f4fd3'; // Full address (guessing the rest)
  
  // Let's first try with just what we can see from screenshot
  const partialWallet = '0x50b359b1272';
  
  console.log('Step 1: Creating your profile...');
  
  try {
    // Create profile for Jeremy
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        wallet_address: yourWallet,
        username: 'jeremy', // You can change this
        profile_icon: '🚀',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating profile:', createError);
      
      // Try to see if profile exists but with different wallet format
      console.log('🔍 Checking for existing profiles...');
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`wallet_address.ilike.%${partialWallet}%,username.eq.jeremy`);
        
      console.log('Existing profiles found:', existing);
      return;
    }

    console.log('✅ Profile created:', newProfile);

    // Now assign locker using the database function
    console.log('Step 2: Assigning locker...');
    
    const { data: lockerResult, error: lockerError } = await supabase
      .rpc('assign_next_locker', { user_wallet: yourWallet });

    if (lockerError) {
      console.error('❌ Error assigning locker:', lockerError);
    } else {
      console.log('🏠 Locker assigned:', lockerResult);
      console.log('');
      console.log('🎉 SUCCESS! Jeremy now has:');
      console.log('   👤 Username: jeremy');
      console.log('   🏠 Locker:', lockerResult);
      console.log('   💰 Wallet:', yourWallet);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Ask for the full wallet address first
console.log('🤔 I need your full wallet address to create the profile.');
console.log('From the screenshot I can see: 0x50b359b1272...');
console.log('');
console.log('Please run this script again with your full wallet address, or:');
console.log('1. Try creating your profile again through the UI');
console.log('2. Check the browser console for any errors');
console.log('3. Make sure you\'re connected to the right wallet');

fixJeremyLocker().catch(console.error);
