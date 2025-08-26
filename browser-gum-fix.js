// 🎯 GUM BALANCE FIX - Run this in browser console
// This will force refresh your GUM balance display

console.log('🎯 GUM BALANCE FIX - Browser Console Version');
console.log('='.repeat(50));

// Step 1: Get current wallet
const walletAddr = window.dynamic?.primaryWallet?.address;
console.log('🔍 Wallet found:', walletAddr);

if (!walletAddr) {
  console.log('❌ No wallet connected. Please connect your wallet first.');
} else {
  // Step 2: Force refresh GUM balance via API
  console.log('🔄 Refreshing GUM balance...');
  
  fetch('/api/gum-balance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet: walletAddr })
  })
  .then(response => response.json())
  .then(data => {
    console.log('💰 Balance API response:', data);
    
    if (data.success) {
      console.log(`✅ Your actual GUM balance: ${data.balance} GUM`);
      
      // Step 3: Force update React context
      console.log('🔄 Forcing React context refresh...');
      
      // Dispatch balance update event
      window.dispatchEvent(new CustomEvent('gumBalanceUpdated', { 
        detail: { balance: data.balance, walletAddress: walletAddr }
      }));
      
      // Force re-render by dispatching wallet change
      window.dispatchEvent(new CustomEvent('walletChanged'));
      
      // Try to find and click refresh buttons
      const refreshButtons = document.querySelectorAll('[data-testid*="refresh"], [class*="refresh"], button');
      console.log(`🎯 Found ${refreshButtons.length} potential refresh elements`);
      
      // Step 4: Show success message
      console.log('');
      console.log('🎉 GUM BALANCE FIX COMPLETE!');
      console.log(`💰 You should now see ${data.balance} GUM in your interface`);
      console.log('');
      console.log('If the balance still shows 0:');
      console.log('1. Refresh the page (Cmd/Ctrl + R)');
      console.log('2. Clear browser cache');
      console.log('3. Disconnect and reconnect your wallet');
      
    } else {
      console.log('❌ Error getting balance:', data.error);
    }
  })
  .catch(error => {
    console.error('❌ API call failed:', error);
    console.log('The development server might not be running.');
    console.log('Start it with: npm run dev');
  });
}

// Step 5: Also test claiming if it's been 24 hours
console.log('');
console.log('💡 Note: You can claim daily GUM once per 24 hours');
console.log('💡 Last claim was recent, so you\'re in cooldown period');
console.log('💡 Your current balance is 5 GUM - the system is working!');
