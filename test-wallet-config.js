// Quick test script to check Dynamic Labs wallet configuration
console.log('🔍 Testing Dynamic Labs wallet configuration...');

// Test the environment ID being used
const envId = "53675303-5e80-4fe5-88a4-e6caae677432";
console.log('Environment ID:', envId);

// Simulate a fetch to Dynamic's API to see what wallets are actually available
const testDynamicAPI = async () => {
  try {
    console.log('📡 Fetching Dynamic Labs wallet configuration...');
    
    // Check if we can access any Dynamic-related endpoints
    const testUrls = [
      `https://app.dynamicauth.com/api/v0/environments/${envId}/wallets`,
      `https://app.dynamicauth.com/api/v0/environments/${envId}/configuration`,
      'https://app.dynamicauth.com/api/v0/wallets/supported'
    ];
    
    for (const url of testUrls) {
      try {
        const response = await fetch(url);
        console.log(`📡 ${url}: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📡 Response data:', data);
        }
      } catch (e) {
        console.log(`❌ ${url}: ${e.message}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Dynamic API test failed:', error);
  }
};

// Check local environment
console.log('🔍 Environment check:');
console.log('- User agent:', navigator.userAgent);
console.log('- Is mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(navigator.userAgent));
console.log('- Touch support:', 'ontouchstart' in window);
console.log('- Max touch points:', navigator.maxTouchPoints);

// Check for existing wallet objects
console.log('🔍 Wallet object check:');
console.log('- window.flowWallet:', !!window.flowWallet);
console.log('- window.lilico:', !!window.lilico);
console.log('- window.dapper:', !!window.dapper);
console.log('- window.blocto:', !!window.blocto);

// Run the test
testDynamicAPI();
