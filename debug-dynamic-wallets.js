// Test Dynamic Labs Wallet Configuration
// Run this in your browser console to see exactly what wallets are available

console.log('🔍 Dynamic Labs Wallet Configuration Test');

// Check current environment
const envId = "53675303-5e80-4fe5-88a4-e6caae677432";
console.log('🔍 Environment ID:', envId);

// Set force flags to ensure we see all wallets
if (typeof window !== 'undefined') {
  window.FORCE_SHOW_ALL_WALLETS = true;
  window.FORCE_DESKTOP_MODE = false;
  window.MOBILE_WALLET_OVERRIDE = true;
  
  console.log('🚨 Force flags set:', {
    FORCE_SHOW_ALL_WALLETS: window.FORCE_SHOW_ALL_WALLETS,
    FORCE_DESKTOP_MODE: window.FORCE_DESKTOP_MODE,
    MOBILE_WALLET_OVERRIDE: window.MOBILE_WALLET_OVERRIDE
  });
}

// Monitor fetch requests to see what Dynamic Labs is actually sending
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const response = await originalFetch.apply(this, args);
  const url = args[0]?.toString() || '';
  
  if (url.includes('dynamic') && (url.includes('wallet') || url.includes('connector'))) {
    console.log('📡 Dynamic Labs API call detected:', url);
    
    try {
      const clone = response.clone();
      const data = await clone.json();
      
      if (data.wallets) {
        console.log('📡 Available wallets from Dynamic Labs API:', 
          data.wallets.map(w => ({ 
            key: w.key, 
            name: w.name,
            mobile: w.mobile,
            installed: w.installed,
            available: w.available
          }))
        );
      }
      
      if (data.connectors) {
        console.log('📡 Available connectors:', data.connectors);
      }
      
    } catch (e) {
      console.log('❌ Failed to parse Dynamic Labs response:', e);
    }
  }
  
  return response;
};

console.log('✅ Dynamic Labs wallet monitoring active');
console.log('💡 Now open the wallet connection modal to see what wallets are actually available');
console.log('💡 Check the console for "📡 Available wallets from Dynamic Labs API" logs');

// Restore fetch after 30 seconds
setTimeout(() => {
  window.fetch = originalFetch;
  console.log('🔄 Restored original fetch');
}, 30000);
