// BROWSER TEST SCRIPT FOR WALLET AUTHENTICATION
// Copy and paste this into your browser console at http://localhost:3000

(async () => {
  console.log('🚀 TESTING WALLET AUTHENTICATION');
  console.log('================================');
  
  // Test 1: Check Dynamic Labs context
  console.log('📍 Test 1: Dynamic Labs Context');
  if (window.dynamic) {
    console.log('✅ Dynamic Labs loaded');
    console.log('  User:', window.dynamic.user || 'None');
    console.log('  Primary Wallet:', window.dynamic.primaryWallet || 'None');
    console.log('  Wallet Address:', window.dynamic.primaryWallet?.address || 'None');
  } else {
    console.log('❌ Dynamic Labs not loaded');
  }
  
  // Test 2: Check React context
  console.log('\n📍 Test 2: React Context Availability');
  console.log('  React:', !!window.React);
  console.log('  ReactDOM:', !!window.ReactDOM);
  
  // Test 3: Check FCL (Flow)
  console.log('\n📍 Test 3: Flow Context');
  console.log('  FCL:', !!window.fcl);
  console.log('  Flow Account:', window.fcl ? 'Available' : 'Not Found');
  
  // Test 4: Check app states
  console.log('\n📍 Test 4: App State Analysis');
  
  // Check for authentication prompts
  const authPrompts = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent?.includes('Connect Wallet to Access') ||
    el.textContent?.includes('Connect Your Wallet') ||
    el.textContent?.includes('🔒')
  );
  
  console.log('  Authentication prompts found:', authPrompts.length);
  authPrompts.forEach((prompt, i) => {
    console.log(`    ${i + 1}. "${prompt.textContent?.trim().substring(0, 50)}..."`);
  });
  
  // Test 5: Manual wallet connection
  console.log('\n📍 Test 5: Manual Connection Test');
  
  if (window.dynamic && !window.dynamic.primaryWallet?.address) {
    console.log('⚠️ Wallet not connected. Attempting to connect...');
    
    if (window.dynamic.setShowAuthFlow) {
      console.log('🔄 Opening wallet connection dialog...');
      window.dynamic.setShowAuthFlow(true);
    } else {
      console.log('❌ Cannot trigger wallet connection - method not available');
    }
  } else if (window.dynamic?.primaryWallet?.address) {
    console.log('✅ Wallet already connected:', window.dynamic.primaryWallet.address);
    
    // Test 6: Force app re-renders
    console.log('\n📍 Test 6: Force App Updates');
    
    // Dispatch events to force React re-renders
    const events = [
      'walletConnected',
      'walletStateChanged', 
      'authenticationChanged',
      'userChanged'
    ];
    
    events.forEach(eventName => {
      window.dispatchEvent(new CustomEvent(eventName, {
        detail: {
          user: window.dynamic.user,
          primaryWallet: window.dynamic.primaryWallet,
          address: window.dynamic.primaryWallet.address,
          timestamp: Date.now()
        }
      }));
      console.log(`  📡 Dispatched ${eventName}`);
    });
    
    // Force page refresh after 3 seconds if needed
    setTimeout(() => {
      const stillHasPrompts = Array.from(document.querySelectorAll('*')).some(el => 
        el.textContent?.includes('Connect Wallet to Access')
      );
      
      if (stillHasPrompts) {
        console.log('⚠️ Apps still showing auth prompts after 3s. Try refreshing the page.');
        console.log('💡 Or run: location.reload()');
      } else {
        console.log('✅ Apps appear to be recognizing authentication!');
      }
    }, 3000);
    
  } else {
    console.log('❌ Dynamic Labs not properly initialized');
  }
  
  console.log('\n🏁 Test Complete');
  console.log('💡 Next steps:');
  console.log('1. If wallet connection dialog opened, connect your Lilico/Flow wallet');
  console.log('2. After connecting, apps should automatically update');
  console.log('3. Try opening OnlyFlunks, Semester Zero, etc.');
  console.log('4. If still having issues, refresh the page after connecting');
})();
