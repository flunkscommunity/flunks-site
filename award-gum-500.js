// Award 500 GUM to a specific wallet
// Run with: node award-gum-manual.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hluvsdjzsfmlapxpfjqz.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.log('❌ SUPABASE KEY not found. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('\nAlternatively, run this SQL in Supabase:');
  console.log(`
INSERT INTO gum_transactions (wallet_address, transaction_type, amount, source, description)
VALUES ('0x6b1ed51f96358d4e', 'earned', 500, 'admin_award', 'Manual admin award');
  `);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function awardGum() {
  const walletAddress = '0x6b1ed51f96358d4e';
  const amount = 500;

  console.log(`\n🎁 Awarding ${amount} GUM to ${walletAddress}...\n`);

  // Insert directly into gum_transactions
  const { data, error } = await supabase
    .from('gum_transactions')
    .insert({
      wallet_address: walletAddress,
      transaction_type: 'earned',
      amount: amount,
      source: 'admin_award',
      description: 'Manual admin award'
    })
    .select();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Success! Transaction:', data);
  
  // Check their new balance
  const { data: stats } = await supabase.rpc('get_user_gum_stats', {
    p_wallet_address: walletAddress
  });
  
  console.log('\n📊 Updated stats:', stats);
}

awardGum();
