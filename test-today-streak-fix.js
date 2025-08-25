// 🧪 Test Today GUM and Streak Fix
// Run this in the browser console while on your site

console.log('🧪 TESTING TODAY GUM & STREAK FIX');
console.log('='.repeat(50));

async function testTrackingFix() {
  // Get your wallet address
  const wallet = window.dynamic?.primaryWallet?.address;
  
  if (!wallet) {
    console.log('❌ No wallet found. Please connect your wallet first.');
    return;
  }
  
  console.log('🔍 Testing for wallet:', wallet.slice(0, 8) + '...');
  
  try {
    // Test 1: Check if transactions endpoint works
    console.log('\n1️⃣ Testing transactions API...');
    const txResponse = await fetch('/api/gum-transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet, limit: 20 })
    });
    
    if (txResponse.ok) {
      const txData = await txResponse.json();
      console.log('✅ Transactions API working!');
      console.log('📊 Found', txData.transactions?.length || 0, 'transactions');
      
      if (txData.transactions && txData.transactions.length > 0) {
        // Calculate today's earnings
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const todayTransactions = txData.transactions.filter(tx => 
          tx.transaction_type === 'earned' && 
          new Date(tx.created_at) >= todayStart
        );
        
        const todayEarnings = todayTransactions.reduce((total, tx) => total + tx.amount, 0);
        console.log('💰 Today earnings calculated:', todayEarnings, 'GUM');
        
        if (todayTransactions.length > 0) {
          console.log('📋 Today transactions:');
          todayTransactions.forEach(tx => {
            console.log(`  - ${tx.source}: +${tx.amount} GUM at ${new Date(tx.created_at).toLocaleTimeString()}`);
          });
        }
        
        // Calculate streak
        const dailyLogins = txData.transactions.filter(tx => 
          tx.transaction_type === 'earned' && 
          tx.source === 'daily_login'
        );
        
        console.log('🔥 Daily login transactions:', dailyLogins.length);
        if (dailyLogins.length > 0) {
          console.log('📅 Latest daily login:', new Date(dailyLogins[0].created_at).toLocaleDateString());
        }
        
        // Check if today's login exists
        const todayLogin = dailyLogins.find(tx => {
          const txDate = new Date(tx.created_at).toDateString();
          const todayDate = today.toDateString();
          return txDate === todayDate;
        });
        
        if (todayLogin) {
          console.log('✅ Found today\'s daily login!');
        } else {
          console.log('❌ No daily login found for today');
        }
        
      } else {
        console.log('⚠️ No transactions found - this explains why Today/Streak shows 0');
      }
    } else {
      console.log('❌ Transactions API failed:', txResponse.status);
    }
    
    // Test 2: Force refresh the locker system tracking data
    console.log('\n2️⃣ Triggering UI refresh...');
    window.dispatchEvent(new CustomEvent('gumBalanceUpdated', {
      detail: { walletAddress: wallet, source: 'test_refresh' }
    }));
    
    console.log('✅ Dispatched gumBalanceUpdated event');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testTrackingFix();
