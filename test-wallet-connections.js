// Test Wallet Connection Script
// Run this in the browser console after the fixes are applied

console.log('🧪 Testing Wallet Connections...');

const testWalletConnections = () => {
  console.log('1️⃣ Checking wallet extensions...');
  
  // Test Flow wallet extensions
  const wallets = {
    flowWallet: !!window.flow,
    lilico: !!window.lilico,
    dapper: !!window.dapper,
    blocto: !!window.blocto
  };
  
  console.log('🔍 Wallet extension status:', wallets);
  
  // Test Dynamic Labs state
  console.log('2️⃣ Checking Dynamic Labs...');
  if (window.dynamic) {
    console.log('✅ Dynamic Labs loaded:', {
      version: window.dynamic.version,
      wallets: window.dynamic.wallets?.length || 0
    });
    
    if (window.dynamic.wallets) {
      console.log('📋 Dynamic Labs wallets:', 
        window.dynamic.wallets.map(w => ({
          key: w.key,
          name: w.name,
          installed: w.installed || w.isInstalled
        }))
      );
    }
  } else {
    console.log('❌ Dynamic Labs not loaded yet');
  }
  
  // Check device detection
  console.log('3️⃣ Device detection:', {
    userAgent: navigator.userAgent,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent),
    windowWidth: window.innerWidth,
    touchSupport: 'ontouchstart' in window,
    forceDesktop: window.FORCE_DESKTOP_MODE
  });
  
  // Test recommendations
  const hasAnyWallet = Object.values(wallets).some(Boolean);
  
  console.log('4️⃣ Recommendations:');
  if (!hasAnyWallet) {
    console.log('❗ No Flow wallets detected. Install Flow Wallet extension from: https://wallet.flow.com/');
  } else {
    console.log('✅ Flow wallets detected. Try connecting through OnlyFlunks.');
  }
  
  if (window.dynamic && window.dynamic.wallets && window.dynamic.wallets.length === 0) {
    console.log('❗ Dynamic Labs found no wallets. This might be a configuration issue.');
  }
  
  return {
    extensions: wallets,
    dynamicLoaded: !!window.dynamic,
    dynamicWalletCount: window.dynamic?.wallets?.length || 0,
    hasWallets: hasAnyWallet
  };
};

const result = testWalletConnections();

// Auto-retry after 3 seconds if Dynamic isn't loaded yet
if (!result.dynamicLoaded) {
  console.log('⏱️ Dynamic not loaded yet, retrying in 3 seconds...');
  setTimeout(() => {
    console.log('🔄 Retrying wallet connection test...');
    testWalletConnections();
  }, 3000);
}

console.log(`
🎯 Quick Test Summary:
- Flow extensions: ${result.hasWallets ? '✅' : '❌'}
- Dynamic Labs: ${result.dynamicLoaded ? '✅' : '❌'}
- Dynamic wallets: ${result.dynamicWalletCount}

Next: Open OnlyFlunks window and try to connect!
`);
