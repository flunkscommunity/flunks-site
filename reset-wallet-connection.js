// Wallet Connection Reset Script
// Use this in your browser console to reset wallet connection to normal behavior

console.log('🔧 Resetting Wallet Connection to Normal Behavior...');

if (typeof window !== 'undefined') {
  // Clear ALL override flags
  delete window.FORCE_SHOW_ALL_WALLETS;
  delete window.SELECTED_WALLET_TYPE;
  delete window.SELECTED_WALLET_STRICT;
  delete window.MOBILE_WALLET_OVERRIDE;
  delete window.SHOW_MOBILE_WALLET_DEBUG;
  
  // Set proper desktop mode for desktop users
  const isDesktop = window.innerWidth > 1024 && 
    !('ontouchstart' in window) && 
    !navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i);

  if (isDesktop) {
    window.FORCE_DESKTOP_MODE = true;
    console.log('🖥️ Desktop detected - enabled desktop mode');
  } else {
    delete window.FORCE_DESKTOP_MODE;
    console.log('📱 Mobile/Tablet detected - mobile mode enabled');
  }

  console.log('✅ Reset complete');
  console.log('📊 Current device detection:', {
    isDesktop,
    screenWidth: window.innerWidth,
    touchSupport: 'ontouchstart' in window,
    userAgent: navigator.userAgent.substring(0, 50) + '...'
  });

  // Check wallet installation status
  const walletStatus = {
    lilico: !!window.lilico,
    flowWallet: !!window.flowWallet,
    dapper: !!window.dapper,
    blocto: !!window.blocto
  };

  console.log('💎 Wallet installation status:', walletStatus);

  if (walletStatus.lilico || walletStatus.flowWallet) {
    console.log('✅ Flow ecosystem wallet detected - should connect directly');
  } else {
    console.log('❌ No Flow ecosystem wallets detected - will show installation prompt');
  }

  console.log('🔄 Refreshing page in 2 seconds...');
  
  setTimeout(() => {
    location.reload();
  }, 2000);
}

console.log('💡 After refresh:');
console.log('💡 - Desktop users: Only installed wallets will show');
console.log('💡 - Mobile users: All wallet options will be available');
console.log('💡 - Lilico should connect directly if installed');
