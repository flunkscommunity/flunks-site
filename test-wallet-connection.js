// Wallet Connection Test Script for Browser Console
// Copy and paste this into your browser's developer console

console.log('🔧 Wallet Connection Test Starting...');

// Force enable all mobile wallet features
(window).FORCE_SHOW_ALL_WALLETS = true;
(window).MOBILE_WALLET_OVERRIDE = true;
(window).FORCE_DESKTOP_MODE = false;

console.log('✅ Force flags set:', {
  FORCE_SHOW_ALL_WALLETS: (window).FORCE_SHOW_ALL_WALLETS,
  MOBILE_WALLET_OVERRIDE: (window).MOBILE_WALLET_OVERRIDE,
  FORCE_DESKTOP_MODE: (window).FORCE_DESKTOP_MODE
});

// Create wallet objects if they don't exist (for testing)
if (typeof window !== 'undefined') {
  if (!window.lilico) {
    window.lilico = {
      name: 'Lilico',
      isInstalled: true,
      authenticate: () => {
        console.log('✅ Lilico authenticate called');
        return Promise.resolve({ address: 'test_lilico_address' });
      }
    };
    console.log('🔧 Created mock Lilico wallet');
  }

  if (!window.flowWallet) {
    window.flowWallet = {
      name: 'Flow Wallet',
      isInstalled: true,
      connect: () => {
        console.log('✅ Flow Wallet connect called');
        return Promise.resolve({ address: 'test_flow_address' });
      }
    };
    console.log('🔧 Created mock Flow Wallet');
  }

  if (!window.dapper) {
    window.dapper = {
      name: 'Dapper',
      isInstalled: true,
      connect: () => {
        console.log('✅ Dapper connect called');
        return Promise.resolve({ address: 'test_dapper_address' });
      }
    };
    console.log('🔧 Created mock Dapper wallet');
  }
}

// Check current wallet status
const checkWalletStatus = () => {
  console.log('📊 Current Wallet Status:');
  console.log('- Dynamic user:', !!window.dynamic?.user);
  console.log('- Dynamic primary wallet:', !!window.dynamic?.primaryWallet);
  console.log('- Lilico available:', !!window.lilico);
  console.log('- Flow Wallet available:', !!window.flowWallet);
  console.log('- Dapper available:', !!window.dapper);
  console.log('- Mobile device:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(navigator.userAgent));
};

checkWalletStatus();

// Helper function to trigger wallet connection
window.testWalletConnection = () => {
  console.log('🚀 Testing wallet connection...');
  
  // Try to find and click the connect wallet button
  const connectButtons = [
    ...document.querySelectorAll('button'),
    ...document.querySelectorAll('[class*="dynamic"]'),
    ...document.querySelectorAll('[class*="wallet"]'),
    ...document.querySelectorAll('[class*="connect"]')
  ].filter(btn => 
    btn.textContent?.toLowerCase().includes('connect') ||
    btn.textContent?.toLowerCase().includes('wallet')
  );

  console.log('🔍 Found potential connect buttons:', connectButtons.length);
  
  if (connectButtons.length > 0) {
    console.log('🖱️ Clicking first connect button...');
    connectButtons[0].click();
  } else {
    console.log('⚠️ No connect buttons found. Try opening OnlyFlunks window first.');
  }
};

console.log('');
console.log('🎯 Next Steps:');
console.log('1. Open OnlyFlunks window from the desktop');
console.log('2. The window should show "Connect Wallet to Access OnlyFlunks"');
console.log('3. Click the wallet connection button');
console.log('4. You should see all Flow ecosystem wallets (Flow, Lilico, Dapper, Blocto)');
console.log('');
console.log('🔧 Manual Test Functions:');
console.log('- checkWalletStatus() - Check current status');
console.log('- testWalletConnection() - Try to connect');
console.log('');
console.log('💡 If wallets still don\'t appear, refresh the page and run this script again');
