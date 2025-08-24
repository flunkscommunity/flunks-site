// TEST SEMESTER ZERO MAP FIX
// Run this script in browser console to test the new Semester Zero map functionality

console.log('🧪 TESTING SEMESTER ZERO MAP FIX');
console.log('================================');

// Test 1: Check if wallet is connected
const testWalletConnection = () => {
  console.log('🔍 Test 1: Checking wallet connection...');
  
  const hasUser = !!window.dynamic?.user;
  const hasPrimaryWallet = !!window.dynamic?.primaryWallet?.address;
  const walletAddress = window.dynamic?.primaryWallet?.address;
  
  console.log('  User:', hasUser);
  console.log('  Primary Wallet:', hasPrimaryWallet);
  console.log('  Wallet Address:', walletAddress || 'None');
  
  const isAuthenticated = hasUser || hasPrimaryWallet;
  console.log('  ✅ Is Authenticated:', isAuthenticated);
  
  return { isAuthenticated, walletAddress };
};

// Test 2: Check NFT ownership
const testNFTOwnership = () => {
  console.log('🎒 Test 2: Checking NFT ownership...');
  
  // Check different possible sources of NFT data
  let flunksCount = 0;
  let nftSources = [];
  
  // Check if React context data is available
  if (window.React && window.React.useContext) {
    console.log('  React context available - NFT data should be in components');
  }
  
  // Check global variables that might contain NFT data
  if (window.userNFTs) {
    nftSources.push('window.userNFTs');
    if (Array.isArray(window.userNFTs)) {
      flunksCount = window.userNFTs.filter(nft => 
        nft.name?.toLowerCase().includes('flunk') ||
        nft.collection?.toLowerCase().includes('flunk')
      ).length;
    }
  }
  
  if (window.flunksData) {
    nftSources.push('window.flunksData');
  }
  
  console.log('  NFT Data Sources Found:', nftSources);
  console.log('  Estimated Flunks Count:', flunksCount);
  
  return { flunksCount, nftSources };
};

// Test 3: Check if map overlay is removed
const testMapAccessibility = () => {
  console.log('🗺️ Test 3: Checking map accessibility...');
  
  // Look for the old wallet prompt overlay
  const walletOverlay = document.querySelector('[class*="wallet-prompt-overlay"]');
  const connectMessages = Array.from(document.querySelectorAll('*')).filter(el =>
    el.textContent?.includes('Connect Wallet to Access') ||
    el.textContent?.includes('Sign in using your wallet to participate')
  );
  
  console.log('  Wallet Overlay Found:', !!walletOverlay);
  console.log('  Connect Messages Found:', connectMessages.length);
  
  // Check if map is interactable
  const mapElements = document.querySelectorAll('[class*="map"], [id*="map"]');
  let interactableMapCount = 0;
  
  mapElements.forEach(el => {
    const style = getComputedStyle(el);
    if (style.pointerEvents !== 'none') {
      interactableMapCount++;
    }
  });
  
  console.log('  Map Elements Found:', mapElements.length);
  console.log('  Interactable Map Elements:', interactableMapCount);
  
  return { 
    hasOverlay: !!walletOverlay, 
    connectMessagesCount: connectMessages.length,
    interactableMapCount
  };
};

// Test 4: Check status indicator
const testStatusIndicator = () => {
  console.log('💎 Test 4: Checking status indicator...');
  
  // Look for the status indicator we added
  const indicators = Array.from(document.querySelectorAll('*')).filter(el => {
    const style = getComputedStyle(el);
    const text = el.textContent || '';
    return (
      (text.includes('✅') && text.includes('Flunks')) ||
      (text.includes('⚠️') && text.includes('Connected')) ||
      (text.includes('❌') && text.includes('No Wallet'))
    ) && style.position === 'absolute';
  });
  
  console.log('  Status Indicators Found:', indicators.length);
  
  if (indicators.length > 0) {
    indicators.forEach((indicator, i) => {
      console.log(`    Indicator ${i + 1}:`, indicator.textContent?.trim());
    });
  }
  
  return { indicatorCount: indicators.length, indicators };
};

// Test 5: Test location clicking
const testLocationClicking = () => {
  console.log('🏠 Test 5: Testing location interactions...');
  
  // Find potential location elements
  const locationElements = [
    ...document.querySelectorAll('button[class*="location"]'),
    ...document.querySelectorAll('[class*="location"]:not(div):not(span)'),
    ...document.querySelectorAll('area[alt*="location" i]'),
    ...document.querySelectorAll('[data-location]'),
    ...document.querySelectorAll('[onclick*="location" i]')
  ];
  
  console.log('  Location Elements Found:', locationElements.length);
  
  let clickableCount = 0;
  let restrictedCount = 0;
  
  locationElements.forEach((el, i) => {
    const style = getComputedStyle(el);
    const isClickable = style.pointerEvents !== 'none' && !el.disabled;
    
    if (isClickable) {
      clickableCount++;
    } else {
      restrictedCount++;
    }
    
    console.log(`    Location ${i + 1}: ${isClickable ? 'Clickable' : 'Restricted'}`);
  });
  
  return { 
    locationCount: locationElements.length, 
    clickableCount, 
    restrictedCount 
  };
};

// Main test runner
const runAllTests = () => {
  console.log('🚀 Running Complete Test Suite...\n');
  
  const walletTest = testWalletConnection();
  console.log('');
  
  const nftTest = testNFTOwnership();
  console.log('');
  
  const mapTest = testMapAccessibility();
  console.log('');
  
  const indicatorTest = testStatusIndicator();
  console.log('');
  
  const locationTest = testLocationClicking();
  console.log('');
  
  // Summary
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=======================');
  console.log('🔐 Wallet:', walletTest.isAuthenticated ? '✅ Connected' : '❌ Not Connected');
  console.log('🎒 NFTs:', nftTest.flunksCount > 0 ? `✅ ${nftTest.flunksCount} Flunks` : '❌ No Flunks');
  console.log('🗺️ Map Access:', mapTest.hasOverlay ? '❌ Still Blocked' : '✅ Accessible');
  console.log('💎 Status Indicator:', indicatorTest.indicatorCount > 0 ? '✅ Present' : '❌ Missing');
  console.log('🏠 Locations:', `${locationTest.clickableCount}/${locationTest.locationCount} accessible`);
  
  console.log('\n🔮 EXPECTED BEHAVIOR:');
  if (walletTest.isAuthenticated) {
    if (nftTest.flunksCount > 0) {
      console.log('✅ Map should be fully accessible');
      console.log('✅ All locations should be clickable');
      console.log('✅ Status should show "Full Access"');
    } else {
      console.log('⚠️ Map should be visible but locations restricted');
      console.log('⚠️ Status should show "Need Flunks for Access"');
      console.log('⚠️ Clicking locations should show NFT requirement message');
    }
  } else {
    console.log('❌ Map should be visible but locations should prompt for wallet connection');
    console.log('❌ Status should show "No Wallet Connected"');
  }
  
  return {
    wallet: walletTest,
    nfts: nftTest,
    map: mapTest,
    indicator: indicatorTest,
    locations: locationTest
  };
};

// Export functions to window
window.testSemesterZero = runAllTests;
window.testWallet = testWalletConnection;
window.testNFTs = testNFTOwnership;
window.testMap = testMapAccessibility;

// Auto-run tests
console.log('🔥 AUTO-RUNNING TESTS...');
const results = runAllTests();

console.log('\n💡 MANUAL TESTING STEPS:');
console.log('1. Try clicking on different locations on the map');
console.log('2. Check if the status indicator updates when you connect/disconnect wallet');
console.log('3. Verify that location access matches your NFT ownership');
console.log('4. Test with different wallet states (connected/disconnected)');

return results;
