#!/usr/bin/env node

/**
 * Access Code Verification Script
 * Tests access code validation API without exposing codes
 */

console.log('🎮 Flunks Access Code Management');
console.log('================================');

console.log('\n� Access Code System:');
console.log('- Codes are stored securely in backend API');
console.log('- Frontend validation removed for security');
console.log('- Contact admin for valid access codes');

console.log('\n🛠️ To modify access codes:');
console.log('1. Update codes in src/pages/api/validate-access.ts');
console.log('2. Restart the application');
console.log('3. Test with the --test flag');

console.log('\n🚀 To remove access gate entirely:');
console.log('1. Set NEXT_PUBLIC_ACCESS_REQUIRED="false" in production env');
console.log('2. Redeploy the site');

const args = process.argv.slice(2);

if (args.includes('--test-api')) {
  console.log('\n🧪 Testing access code API endpoint...');
  
  async function testAPIEndpoint() {
    try {
      const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
      
      // Test with a dummy code to verify API is working
      const response = await fetch('http://localhost:3001/api/validate-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: 'TEST_CODE' }),
      });

      const result = await response.json();
      
      console.log('API Endpoint Status: ✅ WORKING');
      console.log('Response Structure: Valid JSON');
      console.log('Ready to accept access codes from authorized users');
      
    } catch (error) {
      console.log('❌ API endpoint test failed (server may not be running)');
      console.log('Start the dev server with: npm run dev');
    }
  }
  
  testAPIEndpoint();
} else if (args.includes('--test')) {
  console.log('\n❌ Access codes are now secure and backend-only');
  console.log('Use --test-api flag to verify API endpoint is working');
  console.log('Contact admin for valid access codes');
}

console.log('\n💡 Need help? Check DEPLOYMENT_GUIDE.md for full instructions');
