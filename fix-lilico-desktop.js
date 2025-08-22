// Fix Lilico Desktop Connection Issue
// This script clears mobile wallet overrides and forces proper desktop wallet detection

console.log('🔧 Fixing Lilico Desktop Connection...');

// Clear all mobile wallet overrides
delete window.MOBILE_WALLET_OVERRIDE;
delete window.DYNAMIC_MOBILE_WALLET_OVERRIDE;
delete window.SELECTED_WALLET_TYPE;
delete window.SELECTED_WALLET_STRICT;

// Force desktop mode
window.FORCE_DESKTOP_MODE = true;

// Clear any previous wallet selections
delete window.LAST_DYNAMIC_WALLETS;

console.log('🖥️ Desktop mode forced, mobile overrides cleared');
console.log('💡 Refresh the page to see the changes');

// Log current state
console.log('📊 Current window state:', {
  MOBILE_WALLET_OVERRIDE: window.MOBILE_WALLET_OVERRIDE,
  FORCE_DESKTOP_MODE: window.FORCE_DESKTOP_MODE,
  DYNAMIC_MOBILE_WALLET_OVERRIDE: window.DYNAMIC_MOBILE_WALLET_OVERRIDE,
  width: window.innerWidth,
  touchSupport: 'ontouchstart' in window
});
