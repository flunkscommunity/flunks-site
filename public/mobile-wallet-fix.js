// Quick Mobile Wallet Fix Test
// Paste this into your mobile browser console to debug and fix wallet issues

console.log('🔧 Mobile Wallet Fix - Starting Debug...');

// Step 1: Force mobile detection
const forceMobileDetection = () => {
  console.log('📱 Step 1: Forcing mobile detection...');
  
  // Override all mobile detection flags
  window.FORCE_SHOW_ALL_WALLETS = true;
  window.FORCE_DESKTOP_MODE = false;
  window.MOBILE_WALLET_OVERRIDE = true;
  
  console.log('✅ Mobile flags set:', {
    FORCE_SHOW_ALL_WALLETS: window.FORCE_SHOW_ALL_WALLETS,
    FORCE_DESKTOP_MODE: window.FORCE_DESKTOP_MODE,
    MOBILE_WALLET_OVERRIDE: window.MOBILE_WALLET_OVERRIDE
  });
};

// Step 2: Force Flow/Lilico/Dapper availability
const forceWalletAvailability = () => {
  console.log('💎 Step 2: Forcing wallet availability...');
  
  // Simulate wallet objects for better detection
  if (!window.flowWallet) {
    window.flowWallet = {
      name: 'Flow Wallet',
      isInstalled: true,
      connect: () => console.log('Flow Wallet connect called')
    };
  }
  
  if (!window.lilico) {
    window.lilico = {
      name: 'Lilico',
      isInstalled: true,
      authenticate: () => console.log('Lilico authenticate called')
    };
  }
  
  if (!window.dapper) {
    window.dapper = {
      name: 'Dapper',
      isInstalled: true,
      connect: () => console.log('Dapper connect called')
    };
  }
  
  console.log('✅ Wallet objects created');
};

// Step 3: Test Dynamic Labs wallet selection
const testDynamicWalletSelection = () => {
  console.log('🔗 Step 3: Testing Dynamic Labs wallet selection...');
  
  // Set preferred wallet
  window.SELECTED_WALLET_TYPE = 'flowwallet';
  window.SELECTED_WALLET_STRICT = false;
  
  console.log('✅ Wallet selection set:', {
    SELECTED_WALLET_TYPE: window.SELECTED_WALLET_TYPE,
    SELECTED_WALLET_STRICT: window.SELECTED_WALLET_STRICT
  });
};

// Step 4: Reload Dynamic Labs
const reloadDynamicLabs = () => {
  console.log('🔄 Step 4: Attempting to refresh Dynamic Labs...');
  
  try {
    // Try to find Dynamic Labs components and refresh them
    const dynamicElements = document.querySelectorAll('[class*="dynamic"]');
    console.log('Found Dynamic elements:', dynamicElements.length);
    
    // Dispatch a custom event to trigger re-render
    window.dispatchEvent(new CustomEvent('dynamicWalletRefresh'));
    
    console.log('✅ Dynamic Labs refresh triggered');
  } catch (error) {
    console.log('❌ Dynamic Labs refresh failed:', error);
  }
};

// Run all steps
const runMobileWalletFix = () => {
  console.log('🚀 Running Mobile Wallet Fix...');
  
  forceMobileDetection();
  forceWalletAvailability();
  testDynamicWalletSelection();
  reloadDynamicLabs();
  
  console.log('');
  console.log('✅ Mobile Wallet Fix Complete!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Try clicking "Connect Wallet" button');
  console.log('2. Look for Flow Wallet, Lilico, or Dapper options');
  console.log('3. Check if mobile wallet connection UI appears');
  console.log('');
  console.log('🔍 If still not working, try:');
  console.log('   location.reload()  // Reload the page');
  console.log('');
};

// Auto-run
runMobileWalletFix();

// Export for manual use
window.runMobileWalletFix = runMobileWalletFix;

console.log('');
console.log('💡 To run again: window.runMobileWalletFix()');
console.log('💡 To reload page: location.reload()');
console.log('');
