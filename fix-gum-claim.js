// 🎯 DIRECT GUM CLAIM FIX - No more diagnostic loops!
// This script directly fixes your daily GUM claim issue

console.log('🎯 DIRECT GUM CLAIM FIX');
console.log('='.repeat(40));

// Step 1: Get your wallet address
const walletAddr = window.dynamic?.primaryWallet?.address;
console.log('🔍 Your wallet:', walletAddr);

if (!walletAddr) {
  console.log('❌ No wallet found - please connect your wallet first');
} else {
  // Step 2: Force claim daily GUM directly
  console.log('🚀 Attempting direct daily GUM claim...');
  
  fetch('/api/daily-checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet: walletAddr })
  })
  .then(response => response.json())
  .then(data => {
    console.log('📋 Claim result:', data);
    
    if (data.success) {
      console.log(`🎉 SUCCESS! You earned ${data.earned} GUM!`);
      
      // Step 3: Refresh the GUM display
      if (window.location.reload) {
        console.log('🔄 Refreshing page to show updated balance...');
        setTimeout(() => window.location.reload(), 2000);
      }
    } else {
      console.log(`ℹ️ ${data.message || 'Already claimed or in cooldown'}`);
      
      // Step 4: If it's a cooldown issue, show when you can claim next
      if (data.message && data.message.includes('Come back in')) {
        console.log('⏰ You\'ve already claimed today - check back tomorrow!');
      }
    }
  })
  .catch(error => {
    console.error('❌ Direct claim failed:', error);
    console.log('🔧 The server might need the new API endpoints to be deployed');
  });
}

// Step 5: Clear any stuck UI states
setTimeout(() => {
  // Force refresh GUM Center display
  const gumElements = document.querySelectorAll('[data-testid*="gum"], [class*="gum"], [class*="Gum"]');
  gumElements.forEach(el => {
    if (el.click) el.click();
  });
  
  console.log('✨ Attempted to refresh GUM UI elements');
}, 1000);

console.log('\n💡 If this doesn\'t work:');
console.log('1. The daily_login source might be missing from database');
console.log('2. Server needs restart to load new API endpoints');
console.log('3. Your wallet might have already claimed today');
