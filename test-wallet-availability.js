// Enhanced Wallet Configuration Test
// Run this in browser console to diagnose wallet issues

console.log('🔍 Enhanced Wallet Configuration Test Starting...');

// Test Dynamic Labs Environment
const testDynamicEnvironment = async () => {
  console.log('📡 Testing Dynamic Labs Environment...');
  
  const envId = "53675303-5e80-4fe5-88a4-e6caae677432";
  console.log('Environment ID:', envId);
  
  // Check what FCL is configured for
  if (typeof window !== 'undefined' && window.fcl) {
    try {
      console.log('🌊 FCL Configuration:', window.fcl.config);
    } catch (e) {
      console.log('❌ FCL not available or error:', e);
    }
  }
  
  // Set all force flags
  window.FORCE_SHOW_ALL_WALLETS = true;
  window.MOBILE_WALLET_OVERRIDE = true;
  window.FORCE_DESKTOP_MODE = false;
  
  console.log('🚨 Force flags set for maximum wallet visibility');
};

// Test wallet detection
const testWalletDetection = () => {
  console.log('🔍 Testing wallet detection...');
  
  const walletChecks = {
    'Flow Wallet': !!window.flowWallet,
    'Lilico': !!window.lilico,
    'Dapper': !!window.dapper,
    'Blocto': !!window.blocto,
    'FCL': !!window.fcl
  };
  
  console.log('Wallet Detection Results:', walletChecks);
  
  // Check for Flow-related properties
  const flowProps = Object.keys(window).filter(key => 
    key.toLowerCase().includes('flow') ||
    key.toLowerCase().includes('lilico') ||
    key.toLowerCase().includes('dapper') ||
    key.toLowerCase().includes('blocto')
  );
  
  console.log('Flow-related window properties:', flowProps);
};

// Test mobile detection
const testMobileDetection = () => {
  console.log('📱 Testing mobile detection...');
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(
    navigator.userAgent
  ) || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  console.log('Mobile Detection Results:', {
    userAgent: navigator.userAgent,
    isMobile,
    touchSupport: 'ontouchstart' in window,
    maxTouchPoints: navigator.maxTouchPoints,
    screenWidth: window.innerWidth
  });
};

// Simulate wallet objects to help Dynamic Labs detection
const simulateWalletObjects = () => {
  console.log('🔧 Simulating wallet objects...');
  
  if (!window.flowWallet) {
    window.flowWallet = {
      name: 'Flow Wallet',
      isInstalled: true,
      connect: () => console.log('Flow Wallet connect called')
    };
  }
  
  if (!window.lilico) {
    window.lilico = {
      name: 'Lilico',
      isInstalled: true,
      authenticate: () => console.log('Lilico authenticate called')
    };
  }
  
  if (!window.dapper) {
    window.dapper = {
      name: 'Dapper',
      isInstalled: true,
      connect: () => console.log('Dapper connect called')
    };
  }
  
  if (!window.blocto) {
    window.blocto = {
      name: 'Blocto',
      isInstalled: true,
      connect: () => console.log('Blocto connect called')
    };
  }
  
  console.log('✅ Wallet objects simulated');
};

// Run all tests
const runFullWalletTest = async () => {
  await testDynamicEnvironment();
  testMobileDetection();
  testWalletDetection();
  simulateWalletObjects();
  
  console.log('');
  console.log('✅ Wallet configuration test complete!');
  console.log('💡 Now try connecting a wallet to see if all options appear');
  console.log('💡 Look for "📱 Enhanced mobile wallet connection" logs when connecting');
};

// Auto-run the test
runFullWalletTest();

// Export for manual use
window.runFullWalletTest = runFullWalletTest;

console.log('');
console.log('💡 To run again: window.runFullWalletTest()');
console.log('💡 To manually set flags: window.FORCE_SHOW_ALL_WALLETS = true');
console.log('💡 To reload page: location.reload()');
console.log('');
