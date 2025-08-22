// Desktop Wallet Detection Fix
// This script clears mobile overrides and restores proper desktop wallet detection

console.log('🖥️ Restoring Desktop Wallet Detection...');

if (typeof window !== 'undefined') {
  // Clear all mobile overrides
  delete window.FORCE_SHOW_ALL_WALLETS;
  delete window.SELECTED_WALLET_TYPE;
  delete window.SELECTED_WALLET_STRICT;
  delete window.MOBILE_WALLET_OVERRIDE;
  delete window.FORCE_DESKTOP_MODE;
  delete window.SHOW_MOBILE_WALLET_DEBUG;

  console.log('✅ Cleared mobile override flags');

  // Set proper desktop mode
  window.FORCE_DESKTOP_MODE = true;

  console.log('✅ Enabled desktop mode');
  console.log('🔄 Refreshing page to apply changes...');

  // Auto-refresh to apply changes
  setTimeout(() => {
    location.reload();
  }, 1000);
}

console.log('💡 After refresh, wallet detection should work normally');
console.log('💡 Lilico should connect directly if installed');
