// EMERGENCY MOBILE WALLET + LOCKER FIX
// Run this script in your mobile browser console

console.log('🚑 EMERGENCY MOBILE WALLET + LOCKER FIX');
console.log('=====================================');

// STEP 1: Mobile Wallet Authentication Fix
const fixMobileWalletAuth = () => {
  console.log('📱 Step 1: Fixing Mobile Wallet Authentication...');
  
  // Clear all problematic flags
  const flagsToDelete = [
    'FORCE_SHOW_ALL_WALLETS', 'SELECTED_WALLET_TYPE', 'SELECTED_WALLET_STRICT',
    'MOBILE_WALLET_OVERRIDE', 'DYNAMIC_MOBILE_WALLET_OVERRIDE', 'SHOW_MOBILE_WALLET_DEBUG',
    'LAST_DYNAMIC_WALLETS', 'FORCE_DESKTOP_MODE'
  ];
  
  flagsToDelete.forEach(flag => {
    if (window[flag]) {
      delete window[flag];
      console.log(`  ✅ Cleared ${flag}`);
    }
  });
  
  // Set mobile-friendly flags
  window.FORCE_SHOW_ALL_WALLETS = true;
  window.MOBILE_WALLET_OVERRIDE = true;
  
  // Force Dynamic Labs to recognize mobile properly
  if (window.dynamic) {
    console.log('  🔄 Refreshing Dynamic Labs for mobile...');
    
    // Force all wallets to be available
    if (window.dynamic.wallets) {
      window.dynamic.wallets = window.dynamic.wallets.map(wallet => ({
        ...wallet,
        available: true,
        isInstalled: true,
        canConnect: true
      }));
      console.log('  ✅ All wallets forced to available state');
    }
  }
  
  console.log('  📱 Mobile wallet fix applied');
};

// STEP 2: Check Current Authentication State
const checkAuthState = () => {
  console.log('🔍 Step 2: Checking Authentication State...');
  
  const authState = {
    dynamicLoaded: !!window.dynamic,
    user: !!window.dynamic?.user,
    primaryWallet: !!window.dynamic?.primaryWallet,
    walletAddress: window.dynamic?.primaryWallet?.address || 'None',
    walletChain: window.dynamic?.primaryWallet?.chain || 'None'
  };
  
  console.log('  📊 Auth State:', authState);
  
  // Check if React app is recognizing the wallet
  const hasConnectScreen = document.body.textContent?.includes('Connect Wallet to Access');
  const showingLockerLogin = document.body.textContent?.includes('Connect Your Wallet');
  
  console.log('  🎮 App State:', {
    showingConnectScreen: hasConnectScreen,
    showingLockerLogin: showingLockerLogin,
    dynamicWidget: !!document.querySelector('[data-dynamic-widget]')
  });
  
  return authState;
};

// STEP 3: Locker System Health Check
const checkLockerSystem = () => {
  console.log('🏠 Step 3: Checking Locker System Health...');
  
  // Check for locker-related errors in console
  const lockerElements = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent?.includes('locker') || 
    el.textContent?.includes('Locker') ||
    el.className?.includes('locker')
  );
  
  console.log('  🏠 Locker elements found:', lockerElements.length);
  
  // Check for error states
  const hasLockerError = document.body.textContent?.includes('Error loading locker');
  const hasProfileError = document.body.textContent?.includes('create your profile first');
  const hasAssignmentError = document.body.textContent?.includes('no locker assigned');
  
  console.log('  ⚠️ Error States:', {
    lockerError: hasLockerError,
    profileError: hasProfileError,
    assignmentError: hasAssignmentError
  });
  
  return {
    elements: lockerElements.length,
    hasErrors: hasLockerError || hasProfileError || hasAssignmentError
  };
};

// STEP 4: Force Re-Authentication
const forceReauth = () => {
  console.log('🔄 Step 4: Force Re-Authentication...');
  
  if (window.dynamic?.setShowAuthFlow) {
    console.log('  🔐 Triggering Dynamic auth flow...');
    window.dynamic.setShowAuthFlow(true);
    return true;
  } else {
    console.log('  ❌ Dynamic setShowAuthFlow not available');
    return false;
  }
};

// STEP 5: Emergency Profile/Locker Fix
const emergencyLockerFix = () => {
  console.log('🚨 Step 5: Emergency Locker Fix...');
  
  // Look for and click profile creation or locker assignment buttons
  const buttons = Array.from(document.querySelectorAll('button')).filter(btn => {
    const text = btn.textContent?.toLowerCase() || '';
    return text.includes('profile') || 
           text.includes('locker') || 
           text.includes('assign') ||
           text.includes('create');
  });
  
  console.log('  🔘 Found potential fix buttons:', buttons.map(b => b.textContent?.trim()));
  
  // Try to refresh locker data if functions exist
  if (typeof window.refetchLocker === 'function') {
    console.log('  🔄 Calling refetchLocker...');
    window.refetchLocker();
  }
  
  return buttons;
};

// STEP 6: Complete System Refresh
const refreshSystem = () => {
  console.log('🔄 Step 6: Complete System Refresh...');
  
  // Clear local storage that might be causing issues
  const keysToRemove = [
    'dynamic_wallet_selection',
    'dynamic_wallet_override', 
    'wallet_connection_state',
    'locker_assignment_cache'
  ];
  
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (e) {
      // Ignore storage errors
    }
  });
  
  console.log('  🧹 Cleared potentially problematic storage');
  
  // Trigger page refresh in 3 seconds
  console.log('  ⏱️ Page will refresh in 3 seconds...');
  setTimeout(() => {
    window.location.reload();
  }, 3000);
};

// RUN THE COMPLETE FIX SEQUENCE
const runCompleteFix = () => {
  console.log('🚀 Running Complete Emergency Fix...\n');
  
  // Run all fixes
  fixMobileWalletAuth();
  console.log('');
  
  const authState = checkAuthState();
  console.log('');
  
  const lockerState = checkLockerSystem();
  console.log('');
  
  // If user is authenticated but app doesn't recognize it
  if (authState.user && authState.primaryWallet) {
    console.log('✅ Wallet is connected but app may not recognize it');
    console.log('🔄 Triggering app state refresh...');
    
    // Dispatch custom events to trigger React re-renders
    window.dispatchEvent(new CustomEvent('walletStateChanged'));
    window.dispatchEvent(new CustomEvent('forceRerender'));
    
    // Also trigger a small delay refresh
    setTimeout(() => {
      console.log('🔄 Delayed refresh trigger...');
      window.dispatchEvent(new CustomEvent('walletConnected', { 
        detail: { address: authState.walletAddress } 
      }));
    }, 1000);
    
  } else {
    console.log('❌ Need to authenticate first');
    if (forceReauth()) {
      console.log('✅ Auth modal should appear');
    }
  }
  
  // Emergency locker fix
  const fixButtons = emergencyLockerFix();
  
  // Provide manual options
  console.log('\n🛠️ MANUAL OPTIONS:');
  console.log('1. Try connecting wallet again if auth modal appeared');
  console.log('2. Close and reopen the app');
  if (fixButtons.length > 0) {
    console.log('3. Try clicking these buttons:', fixButtons.map(b => `"${b.textContent?.trim()}"`));
  }
  console.log('4. Run refreshSystem() to force page refresh');
  
  return {
    authState,
    lockerState,
    fixButtons: fixButtons.length,
    recommendations: [
      authState.user ? '✅ Authenticated' : '❌ Need to authenticate',
      lockerState.hasErrors ? '⚠️ Locker has errors' : '✅ Locker looks OK',
      fixButtons.length > 0 ? `🔘 ${fixButtons.length} fix buttons found` : '❌ No fix buttons found'
    ]
  };
};

// Export helper functions to window
window.emergencyFix = runCompleteFix;
window.refreshSystem = refreshSystem;
window.forceReauth = forceReauth;
window.checkAuth = checkAuthState;

// Auto-run the complete fix
console.log('🔥 RUNNING AUTOMATIC FIX...');
const results = runCompleteFix();

console.log('\n📋 FIX RESULTS:', results);
console.log('\n💡 NEXT STEPS:');
console.log('1. Wait 3 seconds for the refresh');
console.log('2. Try connecting wallet again');
console.log('3. If still broken, run window.refreshSystem()');
console.log('4. Check Semester Zero locations to see if authentication is now recognized');

return results;
