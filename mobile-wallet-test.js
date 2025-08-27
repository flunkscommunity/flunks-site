// Mobile Wallet Authentication Test
// Run this in browser console to test wallet connections

console.log('🧪 Testing mobile wallet authentication...');

// Test function to check wallet object properties
function testWallet(walletName, walletObj) {
  console.log(`\n📋 Testing ${walletName}:`);
  
  const requiredProps = [
    'isEmbeddedWallet',
    'isConnectorWallet', 
    'canConnect',
    'connect'
  ];
  
  const results = {
    name: walletName,
    exists: !!walletObj,
    properties: {},
    canTest: false
  };
  
  if (walletObj) {
    requiredProps.forEach(prop => {
      results.properties[prop] = {
        exists: prop in walletObj,
        value: walletObj[prop],
        type: typeof walletObj[prop]
      };
    });
    
    results.canTest = requiredProps.every(prop => prop in walletObj);
    
    console.log(`✅ Exists: ${results.exists}`);
    console.log(`🔧 Has required properties: ${results.canTest}`);
    console.log('📊 Properties:', results.properties);
    
    if (results.canTest && walletObj.connect) {
      console.log(`🚀 Testing ${walletName} connection...`);
      
      try {
        // Test connection (but don't actually connect)
        console.log(`   - connect function type: ${typeof walletObj.connect}`);
        console.log(`   - isEmbeddedWallet: ${walletObj.isEmbeddedWallet}`);
        console.log(`   - isConnectorWallet: ${walletObj.isConnectorWallet}`);
        console.log(`   - canConnect: ${walletObj.canConnect}`);
      } catch (e) {
        console.log(`   ❌ Connection test failed: ${e.message}`);
      }
    }
  } else {
    console.log(`❌ ${walletName} wallet object not found`);
  }
  
  return results;
}

// Test all Flow ecosystem wallets
const testResults = {
  flowWallet: testWallet('Flow Wallet', window.flowWallet || window.flowwallet),
  lilico: testWallet('Lilico', window.lilico),
  dapper: testWallet('Dapper', window.dapper)
};

// Test Dynamic Labs integration
console.log('\n🔍 Testing Dynamic Labs integration...');

if (window.DynamicSDK) {
  console.log('✅ Dynamic SDK found');
  
  // Check if our wallets are in Dynamic's wallet list
  const dynamicContext = window.DynamicSDK?.context;
  if (dynamicContext?.wallets) {
    console.log('📱 Dynamic wallets:', dynamicContext.wallets.map(w => ({
      key: w.key,
      name: w.name,
      isEmbeddedWallet: w.isEmbeddedWallet,
      isConnectorWallet: w.isConnectorWallet
    })));
  }
} else {
  console.log('⚠️ Dynamic SDK not found - checking if loaded...');
  
  // Check various ways Dynamic might be available
  const dynamicChecks = [
    'window.DynamicSDK',
    'window.dynamic',
    'window.DynamicContextProvider'
  ];
  
  dynamicChecks.forEach(check => {
    try {
      const value = eval(check);
      console.log(`${check}: ${!!value ? '✅ Found' : '❌ Not found'}`);
    } catch (e) {
      console.log(`${check}: ❌ Error - ${e.message}`);
    }
  });
}

// Test mobile detection
console.log('\n📱 Mobile detection test...');
const mobileTests = {
  userAgent: /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  touchSupport: 'ontouchstart' in window,
  maxTouchPoints: navigator.maxTouchPoints > 0,
  screenWidth: window.innerWidth <= 768,
  isMobileOverall: false
};

mobileTests.isMobileOverall = Object.values(mobileTests).some(test => test === true);

console.log('📊 Mobile detection results:', mobileTests);

// Summary
console.log('\n📄 Test Summary:');
console.log('================');

Object.entries(testResults).forEach(([wallet, result]) => {
  const status = result.exists && result.canTest ? '✅' : '❌';
  console.log(`${status} ${result.name}: ${result.exists ? 'Available' : 'Missing'}`);
});

console.log(`📱 Mobile device: ${mobileTests.isMobileOverall ? 'Yes' : 'No'}`);
console.log(`🔌 Dynamic Labs: ${window.DynamicSDK ? 'Loaded' : 'Not loaded'}`);

// Export results for manual inspection
window.mobileWalletTestResults = {
  testResults,
  mobileTests,
  timestamp: new Date().toISOString()
};

console.log('\n💾 Test results saved to window.mobileWalletTestResults');
console.log('🧪 Mobile wallet authentication test complete!');
