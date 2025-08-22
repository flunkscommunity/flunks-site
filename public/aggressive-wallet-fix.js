// Aggressive Flow Wallet Detection Fix
// Run this in console to force Dynamic Labs to recognize Flow Wallet

console.log('🔧 Aggressive Flow Wallet Detection Fix - Starting...');

// Step 1: Check if Flow Wallet is actually installed
const checkWalletInstalled = () => {
  const wallets = {
    lilico: !!(window.lilico),
    flowWallet: !!(window.flowWallet || window.FlowWallet),
    flow: !!(window.flow),
    fcl: !!(window.fcl)
  };
  
  console.log('🔍 Raw wallet detection:', wallets);
  
  // Check for extension in a different way
  const extensionCheck = {
    hasLilicoExtension: typeof window.lilico?.authenticate === 'function',
    hasFlowMethods: typeof window.flow?.authenticate === 'function',
    hasFCL: typeof window.fcl?.authenticate === 'function'
  };
  
  console.log('🔍 Extension method check:', extensionCheck);
  
  return wallets;
};

const walletStatus = checkWalletInstalled();

// Step 2: If Flow Wallet is installed but not detected by Dynamic, force it
if (walletStatus.lilico || walletStatus.flowWallet || walletStatus.flow) {
  console.log('✅ Flow Wallet detected - forcing Dynamic Labs recognition...');
  
  // Force Dynamic Labs to recognize the wallet
  if (window.dynamic) {
    // Method 1: Force wallet availability
    if (window.dynamic.wallets) {
      window.dynamic.wallets = window.dynamic.wallets.map(wallet => {
        if (wallet.key === 'lilico' || wallet.key === 'flowwallet' || wallet.key.includes('flow')) {
          return {
            ...wallet,
            isInstalled: true,
            installed: true,
            available: true,
            canConnect: true,
            connectionMethods: ['injected']
          };
        }
        return wallet;
      });
      console.log('✅ Forced Dynamic wallets to available state');
    }
    
    // Method 2: Add missing wallet if not present
    const hasFlowWallet = window.dynamic.wallets?.some(w => w.key === 'lilico' || w.key === 'flowwallet');
    if (!hasFlowWallet && window.dynamic.wallets) {
      window.dynamic.wallets.push({
        key: 'lilico',
        name: 'Flow Wallet (Lilico)',
        installed: true,
        isInstalled: true,
        available: true,
        canConnect: true,
        connectionMethods: ['injected'],
        connector: { name: 'lilico' }
      });
      console.log('✅ Added missing Flow Wallet to Dynamic');
    }
  }
  
  // Step 3: Add global detection flags
  window.isFlowWalletInstalled = true;
  window.isLilicoInstalled = true;
  window.flowWalletDetected = true;
  
  // Step 4: Trigger Dynamic Labs refresh
  try {
    if (window.dynamic?.sdk?.refreshWallets) {
      window.dynamic.sdk.refreshWallets();
    }
    
    // Dispatch wallet detection events
    window.dispatchEvent(new CustomEvent('wallet-detected', { 
      detail: { type: 'flow', installed: true } 
    }));
    window.dispatchEvent(new CustomEvent('ethereum#accountsChanged'));
    window.dispatchEvent(new Event('walletconnect'));
    
    console.log('✅ Triggered Dynamic Labs refresh');
  } catch (e) {
    console.log('Note: Could not trigger programmatic refresh');
  }
  
} else {
  console.log('❌ No Flow Wallet detected in browser');
  console.log(`
  To install Flow Wallet:
  1. Go to https://wallet.flow.com/
  2. Click "Add to Chrome" or "Add to Safari"
  3. Install the extension
  4. Refresh this page
  5. Run this script again
  `);
}

// Step 5: Monitor Dynamic Labs state
setTimeout(() => {
  console.log('📊 Final Dynamic Labs state:');
  if (window.dynamic?.wallets) {
    const flowWallets = window.dynamic.wallets.filter(w => 
      w.key === 'lilico' || w.key === 'flowwallet' || w.key.includes('flow')
    );
    console.log('Flow wallets in Dynamic:', flowWallets.map(w => ({
      key: w.key,
      name: w.name,
      installed: w.installed || w.isInstalled,
      available: w.available
    })));
  }
}, 1000);

console.log(`
🎯 Aggressive Fix Complete!

Next Steps:
1. Refresh the page
2. Open OnlyFlunks
3. Try connecting

If still not working:
- Make sure Flow Wallet extension is unlocked
- Try in incognito mode
- Check if extension is enabled in browser settings
`);

// Auto-refresh if wallets were detected
if (walletStatus.lilico || walletStatus.flowWallet) {
  console.log('⏱️ Auto-refreshing in 3 seconds...');
  setTimeout(() => {
    location.reload();
  }, 3000);
}
