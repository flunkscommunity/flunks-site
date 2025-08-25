// 🔧 IMMEDIATE FIX for Today GUM and Streak Display
// Run this in the browser console to force refresh the tracking data

console.log('🔧 FIXING TODAY GUM & STREAK DISPLAY');
console.log('='.repeat(45));

async function fixTrackingDisplay() {
  // Get your wallet address
  const wallet = window.dynamic?.primaryWallet?.address;
  
  if (!wallet) {
    console.log('❌ No wallet found. Please connect your wallet first.');
    return;
  }
  
  console.log('🔍 Forcing refresh for wallet:', wallet.slice(0, 8) + '...');
  
  try {
    // Step 1: Force refresh tracking data by dispatching the event
    console.log('1️⃣ Dispatching gumBalanceUpdated event...');
    window.dispatchEvent(new CustomEvent('gumBalanceUpdated', {
      detail: { 
        walletAddress: wallet, 
        source: 'manual_refresh',
        forceRefresh: true
      }
    }));
    
    // Step 2: Also try the specific daily login event
    console.log('2️⃣ Dispatching dailyLoginClaimed event...');
    window.dispatchEvent(new CustomEvent('dailyLoginClaimed', {
      detail: { 
        walletAddress: wallet,
        earned: 15 // Assume the daily login amount
      }
    }));
    
    // Step 3: Wait a moment and check if the UI updated
    setTimeout(() => {
      const todayElements = document.querySelectorAll('*');
      let foundTodayElement = null;
      let foundStreakElement = null;
      
      for (let el of todayElements) {
        if (el.textContent && el.textContent.includes('📈 Today')) {
          foundTodayElement = el.parentElement;
        }
        if (el.textContent && el.textContent.includes('🎯 Streak')) {
          foundStreakElement = el.parentElement;
        }
      }
      
      if (foundTodayElement) {
        console.log('📈 Today section found:', foundTodayElement.textContent);
      }
      if (foundStreakElement) {
        console.log('🎯 Streak section found:', foundStreakElement.textContent);
      }
      
      console.log('✅ Refresh events dispatched - check if Today/Streak updated!');
    }, 1000);
    
  } catch (error) {
    console.log('❌ Fix failed:', error.message);
  }
}

fixTrackingDisplay();

console.log('\n💡 If the display still shows 0:');
console.log('1. Try refreshing the page');
console.log('2. Close and reopen the locker');
console.log('3. The transaction might not be recorded yet - try again in a few minutes');
