/**
 * Award 2000 GUM to Flow address 0x39bd8fa7414207cb
 * Run with: node award-gum-fund-account.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function awardGum() {
  const wallet = '0x39bd8fa7414207cb';
  const amount = 2000;
  
  console.log('💰 Awarding 2000 GUM to:', wallet);
  console.log('');
  
  try {
    // Insert transaction directly
    const { data: txData, error: txError } = await supabase
      .from('gum_transactions')
      .insert({
        wallet_address: wallet,
        source: 'manual_award',
        amount: amount,
        metadata: { reason: 'Fund account', date: new Date().toISOString() },
        transaction_type: 'earned',
        description: 'Manual GUM funding from admin'
      })
      .select()
      .single();

    if (txError) {
      console.error('❌ Transaction insert error:', txError);
      return;
    }

    console.log('✅ Transaction created:', txData);

    // Update user balance
    const { data: balanceData, error: balanceError } = await supabase
      .from('user_gum_balances')
      .select('total_gum')
      .eq('wallet_address', wallet)
      .single();

    if (balanceError && balanceError.code !== 'PGRST116') {
      console.error('❌ Balance check error:', balanceError);
      return;
    }

    const currentBalance = balanceData?.total_gum || 0;
    const newBalance = currentBalance + amount;

    const { error: updateError } = await supabase
      .from('user_gum_balances')
      .upsert({
        wallet_address: wallet,
        total_gum: newBalance,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'wallet_address'
      });

    if (updateError) {
      console.error('❌ Balance update error:', updateError);
      return;
    }

    console.log('✅ Balance updated:');
    console.log(`   Previous: ${currentBalance} GUM`);
    console.log(`   New: ${newBalance} GUM`);
    console.log(`   Added: ${amount} GUM`);
    console.log('');
    console.log('🎉 Successfully awarded 2000 GUM!');

  } catch (err) {
    console.error('💥 Exception:', err);
  }
}

awardGum();
