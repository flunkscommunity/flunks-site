// Quick Fix - Disable All Mobile Wallet Overrides
// Run this in console to restore normal wallet functionality

console.log('🔧 Disabling all mobile wallet overrides...');

// Clear all override flags
if (typeof window !== 'undefined') {
  delete window.FORCE_SHOW_ALL_WALLETS;
  delete window.SELECTED_WALLET_TYPE;
  delete window.SELECTED_WALLET_STRICT;
  delete window.MOBILE_WALLET_OVERRIDE;
  delete window.FORCE_DESKTOP_MODE;
  delete window.SHOW_MOBILE_WALLET_DEBUG;
  
  console.log('✅ Cleared all override flags');
  console.log('🔄 Please refresh the page to restore normal wallet functionality');
  console.log('💡 After refresh, Flow wallet should work normally again');
  
  // Auto-refresh after a moment
  setTimeout(() => {
    console.log('🔄 Auto-refreshing...');
    location.reload();
  }, 2000);
}
