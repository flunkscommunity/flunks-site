require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Load from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Using anon key for now

console.log('Loading environment variables...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addLockerJacketSource() {
  console.log('🍬 Adding locker_jacket gum source...');
  
  try {
    // Check if the source already exists
    const { data: existing, error: checkError } = await supabase
      .from('gum_sources')
      .select('*')
      .eq('source_name', 'locker_jacket')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing source:', checkError);
      return;
    }

    if (existing) {
      console.log('✅ locker_jacket source already exists:', existing);
      return;
    }

    // Insert the new source
    const { data, error } = await supabase
      .from('gum_sources')
      .insert({
        source_name: 'locker_jacket',
        base_reward: 3,
        cooldown_minutes: 300, // 5 hours
        daily_limit: 15,
        description: 'Gum earned from clicking button in locker jacket section',
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding locker_jacket source:', error);
      return;
    }

    console.log('✅ Successfully added locker_jacket source:', data);

    // Verify all sources
    const { data: allSources, error: listError } = await supabase
      .from('gum_sources')
      .select('*')
      .order('source_name');

    if (listError) {
      console.error('Error listing sources:', listError);
      return;
    }

    console.log('📋 All gum sources:');
    allSources.forEach(source => {
      console.log(`  - ${source.source_name}: ${source.base_reward} gum, ${source.cooldown_minutes}min cooldown, ${source.daily_limit} daily limit`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addLockerJacketSource();
