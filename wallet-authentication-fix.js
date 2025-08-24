// COMPREHENSIVE WALLET AUTHENTICATION FIX
// This script fixes wallet recognition across all apps: OnlyFlunks, Semester Zero, Create Profile, Chat Rooms

console.log('🔧 COMPREHENSIVE WALLET AUTHENTICATION FIX');
console.log('=============================================');

// STEP 1: Clear any problematic wallet states
const clearWalletStates = () => {
  console.log('🧹 Step 1: Clearing problematic wallet states...');
  
  // Clear localStorage items that might be causing conflicts
  const itemsToRemove = [
    'dynamic_wallet_selection',
    'dynamic_wallet_override', 
    'wallet_connection_state',
    'locker_assignment_cache',
    'SELECTED_WALLET_TYPE',
    'SELECTED_WALLET_STRICT',
    'MOBILE_WALLET_OVERRIDE',
    'FORCE_DESKTOP_MODE'
  ];
  
  itemsToRemove.forEach(item => {
    try {
      localStorage.removeItem(item);
      sessionStorage.removeItem(item);
      console.log(`  ✅ Cleared ${item}`);
    } catch (e) {
      console.log(`  ⚠️ Could not clear ${item}:`, e.message);
    }
  });
  
  // Clear problematic window flags
  const flagsToDelete = [
    'FORCE_SHOW_ALL_WALLETS', 'SELECTED_WALLET_TYPE', 'SELECTED_WALLET_STRICT',
    'MOBILE_WALLET_OVERRIDE', 'DYNAMIC_MOBILE_WALLET_OVERRIDE', 'SHOW_MOBILE_WALLET_DEBUG',
    'LAST_DYNAMIC_WALLETS', 'FORCE_DESKTOP_MODE'
  ];
  
  flagsToDelete.forEach(flag => {
    if (window[flag]) {
      delete window[flag];
      console.log(`  ✅ Cleared window.${flag}`);
    }
  });
};

// STEP 2: Enhanced wallet connection check
const checkWalletConnection = () => {
  console.log('🔍 Step 2: Checking wallet connection status...');
  
  const connectionState = {
    // Dynamic Labs checks
    dynamicLoaded: !!window.dynamic,
    dynamicUser: !!window.dynamic?.user,
    primaryWallet: !!window.dynamic?.primaryWallet,
    walletAddress: window.dynamic?.primaryWallet?.address || null,
    walletChain: window.dynamic?.primaryWallet?.chain || 'Unknown',
    
    // Flow wallet specific checks
    flowAccount: window.fcl ? 'FCL Loaded' : 'FCL Not Found',
    
    // Extension checks
    lilico: !!window.lilico,
    blocto: !!window.blocto,
    dapper: !!window.dapper
  };
  
  console.log('  📊 Connection State:', connectionState);
  
  // Check if any wallet is actually connected
  const isConnected = connectionState.dynamicUser || connectionState.primaryWallet || connectionState.walletAddress;
  console.log('  🔐 Authentication Status:', isConnected ? '✅ CONNECTED' : '❌ NOT CONNECTED');
  
  return connectionState;
};

// STEP 3: Force refresh NFT data
const refreshNFTData = async () => {
  console.log('🎒 Step 3: Refreshing NFT data...');
  
  try {
    // Check if there are any refresh functions available
    if (typeof window.refetchLocker === 'function') {
      console.log('  🔄 Calling refetchLocker...');
      await window.refetchLocker();
    }
    
    if (typeof window.refreshNFTs === 'function') {
      console.log('  🔄 Calling refreshNFTs...');
      await window.refreshNFTs();
    }
    
    // Trigger custom events that React components might be listening for
    const events = [
      'walletStateChanged',
      'nftDataRefresh', 
      'authenticationUpdated',
      'forceRerender'
    ];
    
    events.forEach(eventName => {
      window.dispatchEvent(new CustomEvent(eventName));
      console.log(`  📡 Dispatched ${eventName} event`);
    });
    
    console.log('  ✅ NFT refresh completed');
    
  } catch (error) {
    console.log('  ⚠️ Error during NFT refresh:', error.message);
  }
};

// STEP 4: Fix app-specific authentication states
const fixAppAuthentication = () => {
  console.log('🎮 Step 4: Fixing app-specific authentication...');
  
  // Force authentication state in global scope
  if (window.dynamic?.primaryWallet?.address) {
    const walletAddress = window.dynamic.primaryWallet.address;
    
    // Set global authentication flags
    window.USER_AUTHENTICATED = true;
    window.WALLET_ADDRESS = walletAddress;
    window.WALLET_CONNECTED = true;
    
    console.log(`  ✅ Set global auth flags for ${walletAddress}`);
    
    // Try to populate user data if available
    if (window.dynamic?.user) {
      window.USER_DATA = window.dynamic.user;
      console.log('  ✅ Set global user data');
    }
  }
  
  // Check for specific app containers and trigger updates
  const apps = [
    { name: 'OnlyFlunks', selector: '[class*="onlyflunks"], [data-app="onlyflunks"]' },
    { name: 'Semester Zero', selector: '[class*="semester"], [data-app="semester-zero"]' },
    { name: 'Profile', selector: '[class*="profile"], [data-app="profile"]' },
    { name: 'Chat', selector: '[class*="chat"], [data-app="chat"]' }
  ];
  
  apps.forEach(app => {
    const elements = document.querySelectorAll(app.selector);
    if (elements.length > 0) {
      console.log(`  📱 Found ${app.name} app elements: ${elements.length}`);
      
      // Trigger re-render by updating a data attribute
      elements.forEach((el, i) => {
        el.setAttribute('data-auth-refresh', Date.now().toString());
        el.dispatchEvent(new CustomEvent('authRefresh', { bubbles: true }));
      });
    }
  });
};

// STEP 5: Check if apps are recognizing authentication
const testAppRecognition = () => {
  console.log('🧪 Step 5: Testing app authentication recognition...');
  
  const tests = {
    onlyFlunks: {
      loginRequired: document.body.textContent?.includes('Connect Wallet to Access') || 
                    document.body.textContent?.includes('Connect Your Wallet'),
      hasNFTDisplay: document.querySelectorAll('[class*="nft"], [class*="flunk"]').length > 0
    },
    semesterZero: {
      mapBlocked: document.querySelectorAll('[class*="wallet-prompt-overlay"]').length > 0,
      mapVisible: document.querySelectorAll('[class*="map"]').length > 0
    },
    profile: {
      createPrompt: document.body.textContent?.includes('create your profile') ||
                   document.body.textContent?.includes('Create Profile'),
      profileVisible: document.querySelectorAll('[class*="profile"]').length > 0
    }
  };
  
  console.log('  📊 App Recognition Tests:', tests);
  
  // Provide recommendations based on test results
  const recommendations = [];
  
  if (tests.onlyFlunks.loginRequired) {
    recommendations.push('❌ OnlyFlunks still showing login prompt');
  } else if (tests.onlyFlunks.hasNFTDisplay) {
    recommendations.push('✅ OnlyFlunks appears to be working');
  }
  
  if (tests.semesterZero.mapBlocked) {
    recommendations.push('❌ Semester Zero map still blocked');
  } else if (tests.semesterZero.mapVisible) {
    recommendations.push('✅ Semester Zero map is accessible');
  }
  
  if (tests.profile.createPrompt) {
    recommendations.push('⚠️ Profile creation still required');
  }
  
  console.log('  💡 Recommendations:', recommendations);
  
  return tests;
};

// STEP 6: Force React component re-renders
const forceReactRerender = () => {
  console.log('⚛️ Step 6: Forcing React component re-renders...');
  
  // Method 1: Dispatch multiple custom events
  const reactEvents = [
    'walletConnected',
    'walletDisconnected', 
    'walletStateChanged',
    'userChanged',
    'authenticationChanged',
    'nftDataUpdated',
    'forceUpdate'
  ];
  
  reactEvents.forEach(event => {
    window.dispatchEvent(new CustomEvent(event, { 
      detail: { 
        timestamp: Date.now(),
        walletAddress: window.dynamic?.primaryWallet?.address || null,
        user: window.dynamic?.user || null
      }
    }));
  });
  
  console.log(`  📡 Dispatched ${reactEvents.length} React events`);
  
  // Method 2: Update React root if available
  if (window.React && window.ReactDOM) {
    console.log('  ⚛️ React detected, triggering root update...');
    // Force a small delay then dispatch more events
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRootRerender'));
    }, 100);
  }
  
  // Method 3: Trigger Dynamic Labs events
  if (window.dynamic) {
    console.log('  🔄 Triggering Dynamic Labs refresh...');
    // Force Dynamic to re-evaluate authentication
    setTimeout(() => {
      if (window.dynamic.primaryWallet) {
        window.dispatchEvent(new CustomEvent('dynamicWalletUpdate', {
          detail: window.dynamic.primaryWallet
        }));
      }
    }, 200);
  }
};

// MAIN EXECUTION FUNCTION
const fixWalletAuthentication = async () => {
  console.log('🚀 Starting comprehensive wallet authentication fix...\n');
  
  // Step 1: Clear problematic states
  clearWalletStates();
  console.log('');
  
  // Step 2: Check current connection
  const connectionState = checkWalletConnection();
  console.log('');
  
  // Step 3: Refresh NFT data
  await refreshNFTData();
  console.log('');
  
  // Step 4: Fix app authentication
  fixAppAuthentication();
  console.log('');
  
  // Step 5: Test app recognition
  const appTests = testAppRecognition();
  console.log('');
  
  // Step 6: Force React re-renders
  forceReactRerender();
  console.log('');
  
  // Final summary
  console.log('📋 AUTHENTICATION FIX SUMMARY');
  console.log('==============================');
  console.log('🔐 Wallet Connected:', !!connectionState.walletAddress);
  console.log('👤 User Authenticated:', !!connectionState.dynamicUser);
  console.log('🏠 Wallet Address:', connectionState.walletAddress || 'None');
  console.log('🌊 Chain:', connectionState.walletChain);
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Try opening OnlyFlunks - it should show your NFTs');
  console.log('2. Check Semester Zero map - should be accessible');
  console.log('3. Try Create Profile - should recognize your wallet');
  console.log('4. Test Chat Rooms - should allow access');
  console.log('5. If still having issues, disconnect and reconnect wallet');
  
  return {
    connectionState,
    appTests,
    success: !!connectionState.walletAddress
  };
};

// ADDITIONAL HELPER FUNCTIONS
const reconnectWallet = () => {
  console.log('🔄 Attempting to reconnect wallet...');
  
  if (window.dynamic?.setShowAuthFlow) {
    window.dynamic.setShowAuthFlow(true);
    console.log('  ✅ Triggered Dynamic auth flow');
  } else {
    console.log('  ❌ Dynamic auth flow not available');
  }
};

const checkSpecificApp = (appName) => {
  console.log(`🔍 Checking ${appName} specifically...`);
  
  const appChecks = {
    onlyflunks: () => {
      const nftElements = document.querySelectorAll('[class*="nft"], [class*="flunk"], [class*="token"]');
      const loginPrompts = document.querySelectorAll('*').length > 0 && 
                          document.body.textContent?.includes('Connect Wallet to Access');
      
      return {
        nftElements: nftElements.length,
        showingLogin: loginPrompts,
        status: loginPrompts ? '❌ Needs Authentication' : '✅ Working'
      };
    },
    
    'semester-zero': () => {
      const mapElements = document.querySelectorAll('[class*="map"]');
      const overlays = document.querySelectorAll('[class*="wallet-prompt-overlay"]');
      
      return {
        mapElements: mapElements.length,
        overlays: overlays.length,
        status: overlays.length > 0 ? '❌ Map Blocked' : '✅ Map Accessible'
      };
    }
  };
  
  const check = appChecks[appName.toLowerCase()];
  if (check) {
    const result = check();
    console.log(`  📊 ${appName} Status:`, result);
    return result;
  } else {
    console.log(`  ❌ No specific check available for ${appName}`);
    return null;
  }
};

// Export functions to window for manual use
window.fixWalletAuth = fixWalletAuthentication;
window.reconnectWallet = reconnectWallet;
window.checkWalletConnection = checkWalletConnection;
window.checkApp = checkSpecificApp;
window.refreshNFTData = refreshNFTData;
window.clearWalletStates = clearWalletStates;

// Auto-run the complete fix
console.log('🔥 RUNNING AUTOMATIC AUTHENTICATION FIX...');
fixWalletAuthentication().then(results => {
  console.log('\n🏁 AUTHENTICATION FIX COMPLETED');
  console.log('Results:', results);
  
  if (!results.success) {
    console.log('\n⚠️ WALLET NOT CONNECTED');
    console.log('💡 Run window.reconnectWallet() to open connection dialog');
  } else {
    console.log('\n✅ WALLET CONNECTED');
    console.log('💡 Apps should now recognize your authentication state');
    console.log('🔧 If still having issues, run window.fixWalletAuth() again');
  }
});

export {};
