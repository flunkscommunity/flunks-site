// Fix Lilico Desktop Connection Issue
// This script clears mobile wallet overrides and forces proper desktop wallet detection
// Run this in your browser console at http://localhost:3001

(function() {
  console.log('🔧 Fixing Lilico Desktop Connection...');

  // Clear all mobile wallet overrides
  try {
    delete window.MOBILE_WALLET_OVERRIDE;
    delete window.DYNAMIC_MOBILE_WALLET_OVERRIDE;
    delete window.SELECTED_WALLET_TYPE;
    delete window.SELECTED_WALLET_STRICT;
    
    // Force desktop mode
    window.FORCE_DESKTOP_MODE = true;
    
    // Clear any previous wallet selections
    delete window.LAST_DYNAMIC_WALLETS;

    console.log('✅ Desktop mode forced, mobile overrides cleared');
    console.log('💡 Refresh the page to see the changes');

    // Log current state
    console.log('📊 Current window state:', {
      MOBILE_WALLET_OVERRIDE: window.MOBILE_WALLET_OVERRIDE,
      FORCE_DESKTOP_MODE: window.FORCE_DESKTOP_MODE,
      DYNAMIC_MOBILE_WALLET_OVERRIDE: window.DYNAMIC_MOBILE_WALLET_OVERRIDE,
      width: window.innerWidth,
      touchSupport: 'ontouchstart' in window,
      userAgent: navigator.userAgent.substring(0, 50) + '...'
    });

    // Force reload to apply changes
    setTimeout(() => {
      console.log('🔄 Auto-refreshing page...');
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error('❌ Error fixing wallet connection:', error);
  }
})();
