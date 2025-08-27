// Simple Mobile Wallet Test Script
// Run this in your browser console on mobile to test the fixes

console.log('📱 MOBILE WALLET TEST - AUGUST 2025');
console.log('===================================');

// Test 1: Check mobile detection
const testMobileDetection = () => {
  console.log('📱 Test 1: Mobile Detection');
  
  const userAgent = navigator.userAgent;
  const isMobileUA = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent);
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  
  const results = {
    userAgent: userAgent,
    isMobileUA: isMobileUA,
    isTouchDevice: isTouchDevice,
    isSmallScreen: isSmallScreen,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    orientation: window.orientation !== undefined,
    overallMobile: isMobileUA || (isTouchDevice && isSmallScreen)
  };
  
  console.log('Mobile Detection Results:', results);
  return results.overallMobile;
};

// Test 2: Check wallet objects
const testWalletObjects = () => {
  console.log('🔍 Test 2: Wallet Objects');
  
  const wallets = {
    'Flow Wallet': !!window.flowWallet,
    'Lilico': !!window.lilico,
    'Dapper': !!window.dapper,
    'Blocto': !!window.blocto,
    'FCL': !!window.fcl
  };
  
  console.log('Wallet Objects Available:', wallets);
  
  // Check wallet object details
  if (window.flowWallet) {
    console.log('Flow Wallet details:', {
      name: window.flowWallet.name,
      isInstalled: window.flowWallet.isInstalled,
      isMobile: window.flowWallet.isMobile,
      methods: Object.keys(window.flowWallet).filter(key => typeof window.flowWallet[key] === 'function')
    });
  }
  
  if (window.lilico) {
    console.log('Lilico details:', {
      name: window.lilico.name,
      isInstalled: window.lilico.isInstalled,
      isMobile: window.lilico.isMobile,
      methods: Object.keys(window.lilico).filter(key => typeof window.lilico[key] === 'function')
    });
  }
  
  return wallets;
};

// Test 3: Check Dynamic Labs state
const testDynamicState = () => {
  console.log('🔧 Test 3: Dynamic Labs State');
  
  if (!window.dynamic) {
    console.log('❌ Dynamic Labs not detected');
    return { available: false };
  }
  
  const dynamicInfo = {
    available: true,
    version: window.dynamic.version || 'unknown',
    environmentId: window.dynamic.environmentId || 'unknown',
    wallets: window.dynamic.wallets?.length || 0,
    user: !!window.dynamic.user
  };
  
  console.log('Dynamic Labs Info:', dynamicInfo);
  
  // Check for mobile-specific flags
  const flags = {
    FORCE_SHOW_ALL_WALLETS: !!window.FORCE_SHOW_ALL_WALLETS,
    MOBILE_WALLET_OVERRIDE: !!window.MOBILE_WALLET_OVERRIDE,
    ENHANCED_MOBILE_AUTH: !!window.ENHANCED_MOBILE_AUTH,
    DYNAMIC_MOBILE_MODE: !!window.DYNAMIC_MOBILE_MODE
  };
  
  console.log('Mobile Enhancement Flags:', flags);
  return { dynamicInfo, flags };
};

// Test 4: Try a test connection
const testWalletConnection = async () => {
  console.log('🔗 Test 4: Test Wallet Connection');
  
  try {
    if (window.flowWallet && typeof window.flowWallet.connect === 'function') {
      console.log('Testing Flow Wallet connection...');
      const result = await window.flowWallet.connect();
      console.log('Flow Wallet test result:', result);
    }
    
    if (window.lilico && typeof window.lilico.connect === 'function') {
      console.log('Testing Lilico connection...');
      const result = await window.lilico.connect();
      console.log('Lilico test result:', result);
    }
    
    return { success: true, message: 'Test connections completed' };
  } catch (error) {
    console.log('Connection test error:', error);
    return { success: false, error };
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Running all mobile wallet tests...\n');
  
  const isMobile = testMobileDetection();
  console.log('');
  
  const wallets = testWalletObjects();
  console.log('');
  
  const dynamicState = testDynamicState();
  console.log('');
  
  const connectionTest = await testWalletConnection();
  console.log('');
  
  // Summary
  console.log('📊 TEST SUMMARY');
  console.log('===============');
  console.log('Mobile Device:', isMobile);
  console.log('Wallets Available:', Object.values(wallets).some(Boolean));
  console.log('Dynamic Labs:', dynamicState.dynamicInfo?.available || false);
  console.log('Connection Test:', connectionTest.success);
  
  if (isMobile && Object.values(wallets).some(Boolean) && dynamicState.dynamicInfo?.available) {
    console.log('✅ All systems look good for mobile wallet connection!');
    console.log('📱 Try opening the wallet connection flow in the app.');
  } else {
    console.log('⚠️ Some issues detected. Check the individual test results above.');
    
    if (!isMobile) {
      console.log('💡 This test is designed for mobile devices.');
    }
    
    if (!Object.values(wallets).some(Boolean)) {
      console.log('💡 Try running the mobile-wallet-error-fix-2025.js script first.');
    }
    
    if (!dynamicState.dynamicInfo?.available) {
      console.log('💡 Dynamic Labs may still be loading. Try refreshing the page.');
    }
  }
  
  return {
    mobile: isMobile,
    wallets: wallets,
    dynamic: dynamicState,
    connection: connectionTest,
    timestamp: new Date().toISOString()
  };
};

// Auto-run tests
runAllTests().then(results => {
  console.log('\n🎯 Final Results:', results);
});
