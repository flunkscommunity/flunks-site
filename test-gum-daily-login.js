// Test GUM Daily Login Functionality
console.log('🧪 Testing GUM Daily Login System...');

// Test 1: Check GUM sources in database
const testGumSources = async () => {
  console.log('\n1️⃣ Testing GUM sources availability...');
  
  try {
    const response = await fetch('/api/gum-sources', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ GUM sources found:', data);
      
      const dailyLogin = data.find(source => source.source_name === 'daily_login');
      if (dailyLogin) {
        console.log('✅ daily_login source exists:', dailyLogin);
      } else {
        console.log('❌ daily_login source missing!');
      }
    } else {
      console.log('❌ Failed to fetch GUM sources:', response.status);
    }
  } catch (error) {
    console.log('❌ Error fetching GUM sources:', error.message);
  }
};

// Test 2: Check cooldown for daily_login
const testDailyLoginCooldown = async () => {
  console.log('\n2️⃣ Testing daily_login cooldown check...');
  
  const testWallet = '0x123test';
  
  try {
    const response = await fetch('/api/check-gum-cooldown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        wallet: testWallet,
        source: 'daily_login' 
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Cooldown check result:', data);
    } else {
      console.log('❌ Cooldown check failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Error checking cooldown:', error.message);
  }
};

// Test 3: Test daily check-in API
const testDailyCheckin = async () => {
  console.log('\n3️⃣ Testing daily check-in API...');
  
  const testWallet = '0x123test';
  
  try {
    const response = await fetch('/api/daily-checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: testWallet })
    });
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (data.success) {
      console.log('✅ Daily checkin successful:', data.earned, 'GUM earned');
    } else {
      console.log('ℹ️ Daily checkin result:', data.message);
    }
  } catch (error) {
    console.log('❌ Error with daily checkin:', error.message);
  }
};

// Test 4: Check if server is running
const testServerConnection = async () => {
  console.log('\n0️⃣ Testing server connection...');
  
  try {
    const response = await fetch('/api/health', {
      method: 'GET'
    });
    
    if (response.ok) {
      console.log('✅ Server is running');
      return true;
    } else {
      console.log('⚠️ Server responded with status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Server connection failed:', error.message);
    return false;
  }
};

// Run all tests
const runAllTests = async () => {
  const serverRunning = await testServerConnection();
  
  if (!serverRunning) {
    console.log('❌ Cannot run tests - server not available');
    console.log('💡 Make sure to run: npm run dev');
    return;
  }
  
  await testGumSources();
  await testDailyLoginCooldown();
  await testDailyCheckin();
  
  console.log('\n🎯 Test Summary:');
  console.log('- If daily_login source exists, the GUM button should work');
  console.log('- If cooldown check works, the timer should display correctly');
  console.log('- If daily checkin works, the button should award GUM');
  console.log('\n💡 Open browser console and run: runAllTests()');
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.runAllTests = runAllTests;
  console.log('💡 Tests loaded! Run: runAllTests()');
  
  // Auto-run after a short delay
  setTimeout(runAllTests, 1000);
} else {
  // Auto-run if in Node.js
  runAllTests();
}
