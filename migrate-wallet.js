const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const oldWallet = '0xb8acbf8ae32955de';
const newWallet = '0x9078c88f7cc1a02d';

async function migrateWallet() {
  console.log('🔄 Starting migration from', oldWallet, 'to', newWallet);
  console.log('');

  // 1. Update GUM transactions
  const { data: txUpdate, error: txError } = await supabase
    .from('gum_transactions')
    .update({ wallet_address: newWallet })
    .eq('wallet_address', oldWallet)
    .select();
  
  if (txError) {
    console.log('❌ GUM Transactions error:', txError.message);
  } else {
    console.log('✅ GUM Transactions migrated:', txUpdate?.length || 0);
  }

  // 2. Merge GUM balances (1550 + 210 = 1760)
  const newTotalGum = 1550 + 210;
  const { error: balError } = await supabase
    .from('user_gum_balances')
    .upsert({
      wallet_address: newWallet,
      total_gum: newTotalGum,
      updated_at: new Date().toISOString()
    }, { onConflict: 'wallet_address' });
  
  if (balError) {
    console.log('❌ GUM Balance error:', balError.message);
  } else {
    console.log('✅ GUM Balance updated to:', newTotalGum);
  }

  // Delete old balance
  await supabase.from('user_gum_balances').delete().eq('wallet_address', oldWallet);
  console.log('✅ Old GUM balance removed');

  // 3. Migrate user profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({ wallet_address: newWallet })
    .eq('wallet_address', oldWallet);
  
  if (profileError) {
    console.log('❌ Profile error:', profileError.message);
  } else {
    console.log('✅ Profile migrated (username: flunkinaround)');
  }

  // 4. Migrate locker assignment
  const { error: lockerError } = await supabase
    .from('locker_assignments')
    .update({ wallet_address: newWallet })
    .eq('wallet_address', oldWallet);
  
  if (lockerError) {
    console.log('❌ Locker error:', lockerError.message);
  } else {
    console.log('✅ Locker assignment migrated');
  }

  // 5. Create linked accounts record
  const { error: linkError } = await supabase
    .from('linked_accounts')
    .insert({
      primary_wallet: newWallet,
      linked_wallet: oldWallet,
      link_type: 'dapper_migration',
      created_at: new Date().toISOString()
    });
  
  if (linkError) {
    console.log('⚠️ Linked accounts:', linkError.message);
  } else {
    console.log('✅ Linked accounts record created');
  }

  console.log('');
  console.log('🎉 Migration complete!');
  console.log('');
  
  // Verify
  const { data: verify } = await supabase
    .from('user_gum_balances')
    .select('*')
    .eq('wallet_address', newWallet)
    .single();
  console.log('📊 Final GUM Balance:', verify?.total_gum);

  const { data: verifyProfile } = await supabase
    .from('user_profiles')
    .select('username')
    .eq('wallet_address', newWallet)
    .single();
  console.log('👤 Username on new wallet:', verifyProfile?.username);
}

migrateWallet();
