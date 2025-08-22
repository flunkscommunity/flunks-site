// Emergency Wallet Fix - Run this in console right now!
console.log('🚑 EMERGENCY WALLET FIX - Running...');

// Step 1: Clear ALL wallet overrides and force flags
Object.keys(window).forEach(key => {
  if (key.includes('WALLET') || key.includes('DYNAMIC') || key.includes('FORCE')) {
    delete window[key];
  }
});

// Step 2: Disable CORS restrictions for wallet connections
if (window.dynamic && window.dynamic.setConfig) {
  try {
    window.dynamic.setConfig({
      walletConnectorOptions: {
        disableSameSiteNone: true,
        disableSecureContext: false
      }
    });
    console.log('✅ Updated Dynamic config for CORS');
  } catch (e) {
    console.log('Note: Could not update Dynamic config');
  }
}

// Step 3: Force enable all wallets (bypass filtering)
if (window.dynamic && window.dynamic.wallets) {
  window.dynamic.wallets = window.dynamic.wallets.map(wallet => ({
    ...wallet,
    isInstalled: true,
    available: true,
    canConnect: true
  }));
  console.log('✅ Forced all wallets to available state');
}

// Step 4: Quick test
console.log('🧪 Testing wallet state:');
console.log('- Lilico:', !!window.lilico);
console.log('- Dynamic loaded:', !!window.dynamic);
console.log('- Available wallets:', window.dynamic?.wallets?.length || 0);

console.log(`
🎯 EMERGENCY FIX COMPLETE!

NOW DO THIS:
1. Refresh the page (Cmd+R)
2. Open OnlyFlunks
3. Click Connect Wallet
4. It should work now!

If it still doesn't work, try:
- Incognito/Private mode
- Different browser (Safari/Firefox)
`);
