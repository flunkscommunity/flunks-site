// Test script to demonstrate unrestricted Dynamic wallet configuration
console.log('🔧 Testing Dynamic Wallet Configuration - No Restrictions');

// Simulate what Dynamic Labs would provide in a standard installation
const testWallets = [
  { key: 'metamask', name: 'MetaMask', isInstalled: false, mobile: false, available: true },
  { key: 'walletconnect', name: 'WalletConnect', isInstalled: true, mobile: true, available: true },
  { key: 'coinbase', name: 'Coinbase Wallet', isInstalled: false, mobile: true, available: true },
  { key: 'flowwallet', name: 'Flow Wallet', isInstalled: false, mobile: false, available: true },
  { key: 'lilico', name: 'Lilico', isInstalled: false, mobile: false, available: true },
  { key: 'dapper', name: 'Dapper', isInstalled: true, mobile: true, available: true },
  { key: 'blocto', name: 'Blocto', isInstalled: true, mobile: true, available: true },
  { key: 'phantom', name: 'Phantom', isInstalled: false, mobile: true, available: true },
  { key: 'trust', name: 'Trust Wallet', isInstalled: false, mobile: true, available: true },
];

console.log('📋 Standard Dynamic CLI Installation - All Wallets:');
testWallets.forEach(wallet => {
  console.log(`  • ${wallet.name} (${wallet.key}) - Mobile: ${wallet.mobile}, Installed: ${wallet.isInstalled}`);
});

console.log('\n🚫 With NO RESTRICTIONS, you would see ALL of these wallets in the Dynamic modal');
console.log('📱 On mobile: All wallets would be available');
console.log('💻 On desktop: All wallets would be available');
console.log('🔧 No filtering based on device type or wallet preference');

// Test the current configuration
if (typeof window !== 'undefined') {
  console.log('\n🔍 Current window flags:');
  console.log('  LAST_DYNAMIC_WALLETS:', window.LAST_DYNAMIC_WALLETS);
  console.log('  ALL_WALLETS_VISIBLE:', window.ALL_WALLETS_VISIBLE);
  console.log('  FORCE_SHOW_ALL_WALLETS:', window.FORCE_SHOW_ALL_WALLETS);
}
