const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jejycbxxdsrcsobmvbbz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplanljYnh4ZHNyY3NvYm12YmJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA5OTU2OSwiZXhwIjoyMDY1Njc1NTY5fQ.w_s8ZYXrYerg_eV41KUXCyRPya6ToSrSfVkNxvLRafk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testGumSystem() {
  console.log('🔍 Testing GUM System...\n');

  try {
    // Check gum_sources table
    console.log('1. Checking gum_sources table:');
    const { data: sources, error: sourcesError } = await supabase
      .from('gum_sources')
      .select('*');

    if (sourcesError) {
      console.error('Error fetching gum_sources:', sourcesError);
    } else {
      console.log(`Found ${sources?.length || 0} GUM sources:`);
      sources?.forEach(source => {
        console.log(`  - ${source.source_name}: ${source.base_reward} GUM, cooldown: ${source.cooldown_minutes}min, daily limit: ${source.daily_limit}`);
      });
    }

    console.log('\n2. Checking daily_login source specifically:');
    const { data: dailyLogin, error: dailyError } = await supabase
      .from('gum_sources')
      .select('*')
      .eq('source_name', 'daily_login')
      .single();

    if (dailyError) {
      console.error('Error fetching daily_login source:', dailyError);
      if (dailyError.code === 'PGRST116') {
        console.log('❌ daily_login source not found! This needs to be created.');
      }
    } else {
      console.log('✅ Daily login source found:');
      console.log('   Amount:', dailyLogin.base_reward);
      console.log('   Cooldown:', dailyLogin.cooldown_minutes, 'minutes');
      console.log('   Daily limit:', dailyLogin.daily_limit);
      console.log('   Active:', dailyLogin.is_active);
    }

    // Check user_gum_cooldowns table structure
    console.log('\n3. Checking user_gum_cooldowns for test wallet:');
    const testWallet = '0x123test';
    const { data: cooldown, error: cooldownError } = await supabase
      .from('user_gum_cooldowns')
      .select('*')
      .eq('wallet_address', testWallet)
      .eq('source_name', 'daily_login');

    if (cooldownError) {
      console.error('Error fetching cooldown:', cooldownError);
    } else {
      console.log(`Cooldown records for ${testWallet}:`, cooldown?.length || 0);
      if (cooldown && cooldown.length > 0) {
        cooldown.forEach(record => {
          console.log(`  - Last earned: ${record.last_earned_at}`);
          console.log(`  - Daily earned: ${record.daily_earned_amount}`);
          console.log(`  - Reset date: ${record.daily_reset_date}`);
        });
      }
    }

    // Check table schema
    console.log('\n4. Checking table schemas...');
    const tablesInfo = await Promise.all([
      supabase.rpc('get_table_info', { table_name: 'gum_sources' }),
      supabase.rpc('get_table_info', { table_name: 'user_gum_cooldowns' })
    ]);

    console.log('Schema check completed');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testGumSystem();
