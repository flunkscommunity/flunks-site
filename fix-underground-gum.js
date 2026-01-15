// Fix missing Four Thieves Underground GUM transactions
// This adds the gum_source and backfills missing transactions

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fix() {
  // 1. Add the gum_source for underground access
  console.log('=== Adding gum_source for four_thieves_underground ===');
  const { data: sourceData, error: sourceError } = await supabase
    .from('gum_sources')
    .upsert({
      source_id: 'chapter6_four_thieves_underground',
      source_name: 'Four Thieves Underground Access',
      gum_amount: 75,
      is_active: true,
      description: 'Chapter 6 Slacker objective - discovered snicklefritz password',
      is_repeatable: false,
      cooldown_hours: null
    }, { onConflict: 'source_id' })
    .select();
  
  console.log('Source result:', sourceData, sourceError);
  
  // 2. Backfill missing gum_transactions for users who have access
  console.log('');
  console.log('=== Backfilling missing gum_transactions ===');
  
  // Get all users with underground access
  const { data: accessData } = await supabase
    .from('four_thieves_underground_access')
    .select('wallet_address, gum_amount, access_timestamp');
  
  console.log('Found', accessData?.length || 0, 'users with underground access');
  
  if (accessData && accessData.length > 0) {
    for (const access of accessData) {
      // Check if transaction already exists
      const { data: existing } = await supabase
        .from('gum_transactions')
        .select('id')
        .eq('wallet_address', access.wallet_address)
        .ilike('source', '%four_thieves%')
        .limit(1);
      
      if (!existing || existing.length === 0) {
        // Insert missing transaction
        const { error: insertError } = await supabase
          .from('gum_transactions')
          .insert({
            wallet_address: access.wallet_address,
            transaction_type: 'earned',
            amount: access.gum_amount || 75,
            source: 'chapter6_four_thieves_underground',
            description: 'Chapter 6 Slacker - Four Thieves Underground (backfilled)',
            created_at: access.access_timestamp
          });
        
        if (insertError) {
          console.log('Error for', access.wallet_address, ':', insertError.message);
        } else {
          console.log('Backfilled:', access.wallet_address);
        }
      } else {
        console.log('Already exists:', access.wallet_address);
      }
    }
  }
  
  console.log('');
  console.log('Done! Now updating the view...');
}

fix();
