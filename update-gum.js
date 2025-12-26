const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateGumBalance() {
  const walletAddress = '0xe327216d843357f1';
  const newBalance = 2000;

  // Upsert (insert or update) the balance
  const { data, error } = await supabase
    .from('user_gum_balances')
    .upsert({ 
      wallet_address: walletAddress, 
      total_gum: newBalance,
      updated_at: new Date().toISOString()
    }, { 
      onConflict: 'wallet_address' 
    })
    .select();

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Set GUM balance to 2000 for', walletAddress);
    console.log('Data:', data);
  }
}

updateGumBalance();
