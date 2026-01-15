// Award 1000 GUM to user_name hatedjay
// Run with: node award-gum-hatedjay.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hluvsdjzsfmlapxpfjqz.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.log('❌ SUPABASE KEY not found. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function awardGum() {
  const username = 'hatedjay';
  const amount = 1000;

  console.log(`\n🔍 Looking up user: ${username}...\n`);

  // First find the wallet address for this username
  const { data: user, error: userError } = await supabase
    .from('user_profiles')
    .select('wallet_address, username')
    .eq('username', username)
    .single();

  if (userError || !user) {
    console.error('❌ User not found:', userError?.message || 'No user with that username');
    return;
  }

  console.log(`✅ Found user: ${user.username} -> ${user.wallet_address}`);
  console.log(`\n🎁 Awarding ${amount} GUM...\n`);

  // Insert directly into gum_transactions
  const { data, error } = await supabase
    .from('gum_transactions')
    .insert({
      wallet_address: user.wallet_address,
      transaction_type: 'earned',
      amount: amount,
      source: 'admin_award',
      description: 'Manual admin award for hatedjay'
    })
    .select();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Success! Transaction:', data);
  
  // Check their new balance
  const { data: stats } = await supabase.rpc('get_user_gum_stats', {
    p_wallet_address: user.wallet_address
  });
  
  console.log('\n📊 Updated stats:', stats);
}

awardGum();
