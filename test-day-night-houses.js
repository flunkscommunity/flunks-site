/**
 * Test script for Day/Night House System
 * Run with: node test-day-night-houses.js
 */

const { createClient } = require('@supabase/supabase-js');

// You'll need to add your Supabase credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDayNightSystem() {
  console.log('🏠 Testing Day/Night House System...\n');

  try {
    // Test 1: Check if tables exist and have data
    console.log('📊 Test 1: Checking database tables...');
    
    const { data: houseImages, error: houseError } = await supabase
      .from('house_images')
      .select('*')
      .limit(5);

    if (houseError) {
      console.error('❌ House images table error:', houseError.message);
    } else {
      console.log(`✅ Found ${houseImages.length} house configurations`);
      houseImages.forEach(house => {
        console.log(`   - ${house.house_name} (${house.house_id})`);
      });
    }

    // Test 2: Check time configuration
    console.log('\n⏰ Test 2: Checking time configuration...');
    
    const { data: timeConfig, error: timeError } = await supabase
      .from('time_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (timeError) {
      console.error('❌ Time config error:', timeError.message);
    } else {
      console.log('✅ Time configuration found:');
      console.log(`   Day starts: ${timeConfig.day_start_hour}:00 (${timeConfig.day_start_hour === 0 ? '12 AM' : timeConfig.day_start_hour < 12 ? timeConfig.day_start_hour + ' AM' : timeConfig.day_start_hour === 12 ? '12 PM' : (timeConfig.day_start_hour - 12) + ' PM'})`);
      console.log(`   Night starts: ${timeConfig.night_start_hour}:00 (${timeConfig.night_start_hour === 0 ? '12 AM' : timeConfig.night_start_hour < 12 ? timeConfig.night_start_hour + ' AM' : timeConfig.night_start_hour === 12 ? '12 PM' : (timeConfig.night_start_hour - 12) + ' PM'})`);
      console.log(`   Timezone: ${timeConfig.timezone}`);
    }

    // Test 3: Check current day/night status
    console.log('\n🌅 Test 3: Checking current day/night status...');
    
    const { data: isDayTime, error: dayError } = await supabase
      .rpc('is_day_time');

    if (dayError) {
      console.error('❌ Day/night check error:', dayError.message);
    } else {
      console.log(`✅ Current time status: ${isDayTime ? '☀️ Day Time' : '🌙 Night Time'}`);
    }

    // Test 4: Test current house images view
    console.log('\n🖼️ Test 4: Testing current house images view...');
    
    const { data: currentImages, error: viewError } = await supabase
      .from('house_images_current')
      .select('*')
      .limit(3);

    if (viewError) {
      console.error('❌ Current images view error:', viewError.message);
    } else {
      console.log('✅ Current house images:');
      currentImages.forEach(house => {
        console.log(`   - ${house.house_name}: ${house.current_image_url} (${house.is_day_time ? 'Day' : 'Night'})`);
      });
    }

    // Test 5: Test individual house image function
    console.log('\n🏠 Test 5: Testing get_house_image function...');
    
    const { data: houseImage, error: funcError } = await supabase
      .rpc('get_house_image', { house_id_param: 'jocks-house' });

    if (funcError) {
      console.error('❌ House image function error:', funcError.message);
    } else {
      console.log(`✅ Jocks house current image: ${houseImage || 'Not found'}`);
    }

    // Test 6: Check Central Time
    console.log('\n🕐 Test 6: Checking Central Time function...');
    
    const { data: centralTime, error: centralError } = await supabase
      .rpc('get_central_time');

    if (centralError) {
      console.error('❌ Central time function error:', centralError.message);
    } else {
      console.log(`✅ Current Central Time: ${new Date(centralTime).toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
    }

    console.log('\n🎉 Day/Night House System test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testDayNightSystem();
