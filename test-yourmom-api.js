// Test script to create yourmom table via API test
async function testYourMomTable() {
  console.log('Testing YourMom table creation...');
  
  try {
    // First try to use the API to see if table exists
    const response = await fetch('http://localhost:3002/api/yourmom-tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: 'test_wallet_123',
        username: 'test_user'
      })
    });
    
    const result = await response.json();
    console.log('API Test Result:', result);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run test
testYourMomTable();
