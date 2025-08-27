// 🔧 Add Daily Check-in Source to Database
// This script adds the separate daily_checkin gum source

console.log('🔧 Adding daily_checkin gum source...');

async function addDailyCheckinSource() {
  try {
    // Test if we can access the gum sources API
    const response = await fetch('/api/gum-sources');
    if (response.ok) {
      const sources = await response.json();
      console.log('Current gum sources:', sources.map(s => ({ 
        name: s.source_name, 
        reward: s.base_reward, 
        cooldown: s.cooldown_minutes 
      })));
      
      const hasCheckinSource = sources.some(s => s.source_name === 'daily_checkin');
      
      if (hasCheckinSource) {
        console.log('✅ daily_checkin source already exists!');
      } else {
        console.log('❌ daily_checkin source missing - needs to be added to database');
        console.log('\nSQL to run:');
        console.log(`
INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description, is_active) 
VALUES ('daily_checkin', 15, 1440, 15, 'Manual daily check-in button in locker', true);
        `);
      }
    } else {
      console.log('❌ Cannot access gum sources API');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

addDailyCheckinSource();

console.log('\n💡 After adding the source:');
console.log('- Login: 5 GUM (automatic, daily_login source)');
console.log('- Check-in button: 15 GUM (manual, daily_checkin source)');
console.log('- Both will work independently with separate 24h cooldowns');
