// Dynamic Wallet Connection Fix Script
// This script addresses the wallet connection issues with Dynamic Labs

console.log('🔧 Dynamic Wallet Connection Fix - Starting...');

// Step 1: Clear all potentially problematic override flags
console.log('🧹 Clearing override flags...');
if (typeof window !== 'undefined') {
  delete window.FORCE_SHOW_ALL_WALLETS;
  delete window.SELECTED_WALLET_TYPE;
  delete window.SELECTED_WALLET_STRICT;
  delete window.MOBILE_WALLET_OVERRIDE;
  delete window.DYNAMIC_MOBILE_WALLET_OVERRIDE;
  delete window.SHOW_MOBILE_WALLET_DEBUG;
  delete window.LAST_DYNAMIC_WALLETS;
  
  // Clear any stored wallet selection states
  try {
    localStorage.removeItem('dynamic_wallet_selection');
    localStorage.removeItem('dynamic_wallet_override');
    sessionStorage.removeItem('dynamic_wallet_selection');
    sessionStorage.removeItem('dynamic_wallet_override');
  } catch (e) {
    console.log('Note: Could not clear storage (may be in incognito mode)');
  }
}

// Step 2: Set clean desktop mode
console.log('🖥️ Setting clean desktop mode...');
if (typeof window !== 'undefined') {
  window.FORCE_DESKTOP_MODE = true;
  
  // Log current environment
  console.log('📊 Current environment:', {
    userAgent: navigator.userAgent,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    touchSupport: 'ontouchstart' in window,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    isMobileUA: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent)
  });
}

// Step 3: Check for Flow wallet extensions
console.log('🔍 Checking for Flow wallet extensions...');
const checkFlowWallets = () => {
  const results = {
    lilico: !!window.lilico,
    flowWallet: !!window.flow,
    fcl: !!window.fcl,
    dapper: !!window.dapper,
    blocto: !!window.blocto
  };
  
  console.log('🔍 Flow wallet detection results:', results);
  
  // Enhanced detection for Lilico/Flow Wallet
  if (window.lilico) {
    console.log('✅ Lilico detected:', {
      version: window.lilico.version,
      isInstalled: true,
      methods: Object.keys(window.lilico).filter(k => typeof window.lilico[k] === 'function')
    });
  }
  
  if (window.flow) {
    console.log('✅ Flow detected:', {
      version: window.flow.version,
      isInstalled: true,
      methods: Object.keys(window.flow).filter(k => typeof window.flow[k] === 'function')
    });
  }
  
  return results;
};

const walletResults = checkFlowWallets();

// Step 4: Check Dynamic Labs state
console.log('🔍 Checking Dynamic Labs state...');
const checkDynamicState = () => {
  if (window.dynamic) {
    console.log('✅ Dynamic Labs detected:', {
      version: window.dynamic.version || 'unknown',
      wallets: window.dynamic.wallets?.length || 0,
      connectors: window.dynamic.connectors?.length || 0
    });
    
    if (window.dynamic.wallets) {
      console.log('📋 Available Dynamic wallets:', window.dynamic.wallets.map(w => ({
        key: w.key,
        name: w.name,
        installed: w.installed,
        available: w.available
      })));
    }
  } else {
    console.log('⚠️ Dynamic Labs not detected yet');
  }
};

checkDynamicState();

// Step 5: Force refresh Dynamic Labs wallet detection
console.log('🔄 Forcing Dynamic Labs wallet refresh...');
if (typeof window !== 'undefined') {
  // Try to trigger a Dynamic Labs refresh
  const triggerDynamicRefresh = () => {
    try {
      // Look for Dynamic's internal refresh methods
      if (window.dynamic && window.dynamic.refreshWallets) {
        window.dynamic.refreshWallets();
        console.log('✅ Triggered Dynamic wallet refresh');
      }
      
      // Trigger wallet detection events
      window.dispatchEvent(new Event('walletDetectionRefresh'));
      window.dispatchEvent(new Event('ethereum#accountsChanged'));
      
    } catch (error) {
      console.log('Note: Could not trigger programmatic refresh:', error.message);
    }
  };
  
  triggerDynamicRefresh();
}

// Step 6: Set up monitoring
console.log('📡 Setting up wallet monitoring...');
let monitorCount = 0;
const monitor = setInterval(() => {
  monitorCount++;
  
  const currentWallets = checkFlowWallets();
  const hasWallets = Object.values(currentWallets).some(Boolean);
  
  console.log(`🔄 Monitor check #${monitorCount}:`, {
    hasWallets,
    wallets: currentWallets,
    dynamicReady: !!window.dynamic
  });
  
  if (monitorCount >= 10) {
    clearInterval(monitor);
    console.log('📊 Final status:', {
      flowWalletsDetected: hasWallets,
      dynamicLoaded: !!window.dynamic,
      recommendedAction: hasWallets ? 'Refresh page to apply fixes' : 'Install Flow wallet extension'
    });
  }
}, 1000);

// Step 7: Provide instructions
console.log(`
🎯 Dynamic Wallet Fix Applied!

Next Steps:
1. Refresh the page to apply all changes
2. Open OnlyFlunks window
3. Try connecting with Flow wallet

If issues persist:
- Make sure Flow Wallet (Lilico) extension is installed
- Try opening the connection in a private/incognito window
- Check for browser extension conflicts

Current Status:
- Desktop mode: ${!!window.FORCE_DESKTOP_MODE}
- Override flags cleared: ✅
- Flow wallets detected: ${Object.values(walletResults).some(Boolean) ? '✅' : '❌'}
`);

// Auto-refresh after 3 seconds if wallets are detected
if (Object.values(walletResults).some(Boolean)) {
  console.log('⏱️ Auto-refreshing in 3 seconds to apply fixes...');
  setTimeout(() => {
    location.reload();
  }, 3000);
}
