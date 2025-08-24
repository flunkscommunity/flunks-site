// 🍬 COMPREHENSIVE GUM DAILY CHECK-IN DIAGNOSTIC
console.log('🔍 GUM DAILY CHECK-IN DIAGNOSTIC STARTING...');

// First, let's get your actual wallet address
const getWalletAddress = () => {
  const walletAddr = window.dynamic?.primaryWallet?.address || 
                    window.dynamic?.user?.walletPublicKey ||
                    localStorage.getItem('walletAddress') ||
                    'NOT_FOUND';
  
  console.log('🔍 Detected wallet address:', walletAddr);
  return walletAddr;
};

// Test 1: Check if GUM sources exist in database
const testGumSources = async () => {
  console.log('\n🧪 TEST 1: Checking GUM sources...');
  
  try {
    const response = await fetch('/api/gum-sources', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const sources = await response.json();
      console.log('✅ Available GUM sources:', sources);
      
      const dailyLogin = sources.find(s => s.source_name === 'daily_login');
      if (dailyLogin) {
        console.log('✅ daily_login source found:', {
          reward: dailyLogin.base_reward,
          cooldown: dailyLogin.cooldown_minutes,
          dailyLimit: dailyLogin.daily_limit,
          active: dailyLogin.is_active
        });
        return dailyLogin;
      } else {
        console.log('❌ daily_login source NOT FOUND');
        return null;
      }
    } else {
      console.log('❌ Failed to fetch GUM sources:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Error fetching GUM sources:', error.message);
    return null;
  }
};

// Test 2: Check cooldown status for your wallet
const testCooldownCheck = async (walletAddress) => {
  console.log('\n🧪 TEST 2: Checking daily_login cooldown...');
  
  if (walletAddress === 'NOT_FOUND') {
    console.log('❌ Cannot test - no wallet address found');
    return null;
  }
  
  try {
    const response = await fetch('/api/check-gum-cooldown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        wallet: walletAddress,
        source: 'daily_login' 
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Cooldown check result:', data);
      
      if (data.canEarn) {
        console.log('🎯 STATUS: You CAN claim daily GUM!');
      } else if (data.cooldownMinutes > 0) {
        console.log(`⏰ STATUS: Still in cooldown for ${data.cooldownMinutes} minutes`);
      } else {
        console.log(`🚫 STATUS: ${data.reason}`);
      }
      
      return data;
    } else {
      console.log('❌ Cooldown check failed:', response.status, await response.text());
      return null;
    }
  } catch (error) {
    console.log('❌ Error checking cooldown:', error.message);
    return null;
  }
};

// Test 3: Try claiming daily check-in
const testDailyCheckin = async (walletAddress) => {
  console.log('\n🧪 TEST 3: Testing daily check-in claim...');
  
  if (walletAddress === 'NOT_FOUND') {
    console.log('❌ Cannot test - no wallet address found');
    return null;
  }
  
  try {
    const response = await fetch('/api/daily-checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: walletAddress })
    });
    
    const data = await response.json();
    console.log('📋 Daily check-in API response:', data);
    
    if (data.success) {
      console.log(`🎉 SUCCESS: Earned ${data.earned} GUM!`);
    } else {
      console.log(`ℹ️ RESULT: ${data.message}`);
    }
    
    return data;
  } catch (error) {
    console.log('❌ Error with daily check-in:', error.message);
    return null;
  }
};

// Test 4: Check your current GUM balance
const testGumBalance = async (walletAddress) => {
  console.log('\n🧪 TEST 4: Checking GUM balance...');
  
  if (walletAddress === 'NOT_FOUND') {
    console.log('❌ Cannot test - no wallet address found');
    return null;
  }
  
  try {
    const response = await fetch('/api/gum-balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: walletAddress })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('💰 Current GUM balance:', data.balance);
      return data.balance;
    } else {
      console.log('❌ Failed to get GUM balance:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Error getting GUM balance:', error.message);
    return null;
  }
};

// Test 5: Debug Dynamic Labs state
const debugDynamicState = () => {
  console.log('\n🧪 TEST 5: Dynamic Labs state debug...');
  
  const dynamicState = {
    windowDynamic: !!window.dynamic,
    user: window.dynamic?.user ? 'PRESENT' : 'MISSING',
    primaryWallet: window.dynamic?.primaryWallet ? 'PRESENT' : 'MISSING',
    walletAddress: window.dynamic?.primaryWallet?.address || 'NONE',
    isAuthenticated: !!window.dynamic?.user || !!window.dynamic?.primaryWallet?.address
  };
  
  console.log('🔍 Dynamic state:', dynamicState);
  return dynamicState;
};

// MAIN TEST RUNNER
const runGumDiagnostic = async () => {
  console.log('🚀 Starting comprehensive GUM diagnostic...\n');
  
  // Get wallet address
  const walletAddress = getWalletAddress();
  
  // Debug Dynamic Labs state  
  debugDynamicState();
  
  // Run all tests
  const sources = await testGumSources();
  const cooldown = await testCooldownCheck(walletAddress);
  const balance = await testGumBalance(walletAddress);
  const checkin = await testDailyCheckin(walletAddress);
  
  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log('='.repeat(50));
  console.log(`Wallet: ${walletAddress}`);
  console.log(`Sources available: ${sources ? '✅' : '❌'}`);
  console.log(`Can claim daily: ${cooldown?.canEarn ? '✅' : '❌'}`);
  console.log(`Current balance: ${balance ?? 'Unknown'} GUM`);
  console.log(`Check-in result: ${checkin?.success ? '✅ Success' : '❌ Failed'}`);
  
  if (!sources) {
    console.log('\n🔧 FIX NEEDED: daily_login source missing from database');
  }
  
  if (cooldown && !cooldown.canEarn && cooldown.reason) {
    console.log(`\n⏰ STATUS: ${cooldown.reason}`);
  }
  
  console.log('\n💡 If tests show "Can claim" but button is greyed out, try:');
  console.log('1. Refresh the page');
  console.log('2. Disconnect and reconnect wallet');
  console.log('3. Clear browser cache');
  
  return {
    walletAddress,
    sources,
    cooldown,
    balance,
    checkin
  };
};

// Auto-run the diagnostic
runGumDiagnostic().catch(console.error);

// Make it available globally
window.runGumDiagnostic = runGumDiagnostic;
