#!/usr/bin/env node

/**
 * Access Code Verification Script
 * Helps test and manage access codes for the Flunks site
 */

const accessCodes = {
  ADMIN: 'FLUNKS2025',
  BETA: 'SEMESTER0', 
  COMMUNITY: 'HIGHSCHOOL95'
};

console.log('🎮 Flunks Access Code Management');
console.log('================================');

console.log('\n📋 Current Access Codes:');
Object.entries(accessCodes).forEach(([level, code]) => {
  console.log(`   ${level}: ${code}`);
});

console.log('\n🔗 To test access codes:');
console.log('1. Visit your deployed site');
console.log('2. Enter one of the codes above');
console.log('3. Access should be granted and stored in session');

console.log('\n🛠️ To modify access codes:');
console.log('1. Update the codes in src/components/AccessGate.tsx');
console.log('2. Update NEXT_PUBLIC_BETA_ACCESS_CODES in .env.production');
console.log('3. Redeploy your site');

console.log('\n🚀 To remove access gate entirely:');
console.log('1. Set NEXT_PUBLIC_ACCESS_REQUIRED="false" in production env');
console.log('2. Redeploy the site');

const args = process.argv.slice(2);
if (args.includes('--test')) {
  console.log('\n🧪 Testing access code validation...');
  
  const testCode = args[1] || 'SEMESTER0';
  const isValid = Object.values(accessCodes).includes(testCode.toUpperCase());
  
  console.log(`Testing code: ${testCode}`);
  console.log(`Valid: ${isValid ? '✅ YES' : '❌ NO'}`);
  
  if (!isValid) {
    console.log('Available codes:', Object.values(accessCodes).join(', '));
  }
}

console.log('\n💡 Need help? Check DEPLOYMENT_GUIDE.md for full instructions');
