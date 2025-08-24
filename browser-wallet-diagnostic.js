// Browser-based Dynamic Labs wallet diagnostic
// Copy and paste this into the browser console while OnlyFlunks is open

console.log('🔍 Dynamic Labs Wallet Authentication Diagnostic');
console.log('================================================');

// 1. Check if Dynamic Labs is loaded
const checkDynamicLabs = () => {
  console.log('1️⃣ Dynamic Labs Status:');
  
  if (typeof window.dynamic !== 'undefined') {
    console.log('  ✅ Dynamic Labs SDK loaded');
    console.log('  📊 Version:', window.dynamic.version || 'unknown');
    
    // Check auth state
    if (window.dynamic.user) {
      console.log('  👤 User:', {
        userId: window.dynamic.user.userId,
        email: window.dynamic.user.email,
        walletConnected: !!window.dynamic.user.verifiedCredentials?.length
      });
    } else {
      console.log('  ❌ No user authenticated');
    }
    
    // Check primary wallet
    if (window.dynamic.primaryWallet) {
      console.log('  💎 Primary Wallet:', {
        address: window.dynamic.primaryWallet.address,
        chain: window.dynamic.primaryWallet.chain,
        connector: window.dynamic.primaryWallet.connector?.name
      });
    } else {
      console.log('  ❌ No primary wallet connected');
    }
    
    // Check available wallets
    if (window.dynamic.wallets) {
      console.log('  🏦 Available Wallets:', window.dynamic.wallets.length);
      window.dynamic.wallets.forEach(wallet => {
        console.log(`    ${wallet.key}: ${wallet.installed ? '✅' : '❌'} ${wallet.name}`);
      });
    }
    
    return true;
  } else {
    console.log('  ❌ Dynamic Labs SDK not loaded');
    return false;
  }
};

// 2. Check React Context
const checkReactContext = () => {
  console.log('2️⃣ React Context Status:');
  
  // Try to find the Dynamic context data from React DevTools
  const reactFiber = document.querySelector('#__next')?._reactInternalInstance ||
                    document.querySelector('#__next')?._reactInternals;
  
  if (reactFiber) {
    console.log('  ✅ React app detected');
    // We can't easily access context from here, but we can check the DOM
  } else {
    console.log('  ❌ React app not found');
  }
  
  // Check if OnlyFlunks is showing the wallet connection screen
  const onlyFlunksContent = document.querySelector('[data-testid="onlyflunks"]') ||
                           Array.from(document.querySelectorAll('*')).find(el => 
                             el.textContent?.includes('Connect Wallet to Access OnlyFlunks')
                           );
  
  if (onlyFlunksContent) {
    console.log('  🔍 OnlyFlunks detected - checking content...');
    
    const hasConnectWallet = document.body.textContent?.includes('Connect Wallet to Access OnlyFlunks');
    const hasDynamicWidget = document.querySelector('[data-dynamic-widget]') || 
                            document.querySelector('.dynamic-widget');
    
    console.log('  📱 Shows connect wallet screen:', hasConnectWallet);
    console.log('  🔧 Dynamic widget present:', !!hasDynamicWidget);
  }
};

// 3. Check browser wallet extensions
const checkWalletExtensions = () => {
  console.log('3️⃣ Browser Wallet Extensions:');
  
  const wallets = {
    'Flow Wallet (Lilico)': !!window.lilico,
    'Flow Wallet (FCL)': !!window.fcl,
    'Flow (Direct)': !!window.flow,
    'Dapper': !!window.dapper,
    'Blocto': !!window.blocto,
    'MetaMask': !!window.ethereum?.isMetaMask
  };
  
  Object.entries(wallets).forEach(([name, detected]) => {
    console.log(`  ${detected ? '✅' : '❌'} ${name}`);
  });
  
  // Check for any Flow-related objects
  const flowObjects = Object.keys(window).filter(key => 
    key.toLowerCase().includes('flow') || 
    key.toLowerCase().includes('lil') ||
    key.toLowerCase().includes('fcl')
  );
  
  if (flowObjects.length > 0) {
    console.log('  🌊 Flow-related objects found:', flowObjects);
  }
};

// 4. Provide recommendations
const provideRecommendations = () => {
  console.log('4️⃣ Recommendations:');
  
  const hasDynamic = typeof window.dynamic !== 'undefined';
  const hasUser = hasDynamic && window.dynamic.user;
  const hasWallet = hasDynamic && window.dynamic.primaryWallet;
  const hasFlowWallet = !!(window.lilico || window.flow || window.fcl);
  
  if (!hasDynamic) {
    console.log('  🔴 Install Dynamic Labs SDK');
  } else if (!hasUser) {
    console.log('  🟡 User not authenticated - click "Connect Wallet" button');
  } else if (!hasWallet) {
    console.log('  🟡 Wallet not connected - complete wallet connection flow');
  } else if (hasUser && hasWallet) {
    console.log('  🟢 Authentication looks good! Check React context or component state');
  }
  
  if (!hasFlowWallet) {
    console.log('  📱 Install Flow Wallet extension: https://wallet.flow.com/');
  }
  
  // Test button for Dynamic widget
  console.log('  🧪 Test: Try clicking the wallet connection button or run window.dynamic?.setShowAuthFlow?.(true)');
};

// Run all checks
console.log('\n' + '='.repeat(50));
const dynamicLoaded = checkDynamicLabs();
console.log('\n' + '='.repeat(50));
checkReactContext();
console.log('\n' + '='.repeat(50));
checkWalletExtensions();
console.log('\n' + '='.repeat(50));
provideRecommendations();
console.log('\n' + '='.repeat(50));

// Export functions for manual testing
window.testWalletAuth = () => {
  console.log('🧪 Manual wallet auth test...');
  
  if (window.dynamic?.setShowAuthFlow) {
    window.dynamic.setShowAuthFlow(true);
    console.log('✅ Triggered Dynamic auth flow');
  } else {
    console.log('❌ Dynamic setShowAuthFlow not available');
  }
};

console.log('💡 Run window.testWalletAuth() to manually trigger authentication');
