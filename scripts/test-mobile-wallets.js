#!/usr/bin/env node

/**
 * Test script for mobile wallet connections
 * Run this on mobile device or mobile simulator to test wallet integration
 */

const { execSync } = require('child_process');

console.log('🔄 Starting mobile wallet connection test...');
console.log('========================================');

// Check if development server is running
try {
  const response = execSync('curl -s -o /dev/null -w "%{http_code}\\n" http://localhost:3000', { 
    encoding: 'utf8',
    timeout: 5000 
  });
  
  if (response.trim() === '200') {
    console.log('✅ Development server is running');
    
    console.log('\n📱 Testing Mobile Wallet Integration:');
    console.log('');
    console.log('1. 🌊 Flow Wallet / Lilico Test:');
    console.log('   - Open http://localhost:3000 on your mobile device');
    console.log('   - Look for "📱 Mobile Wallet Connection" component');
    console.log('   - Try connecting Flow Wallet');
    console.log('');
    console.log('2. 💎 Dapper Wallet Test:');
    console.log('   - Click on Dapper option');
    console.log('   - Should open Dapper web interface');
    console.log('');
    console.log('3. 🌊 Blocto Test (fallback):');
    console.log('   - Dynamic Labs should offer Blocto as option');
    console.log('   - Blocto has good mobile deep-link support');
    console.log('');
    
    console.log('🐛 Debugging Features Available:');
    console.log('   - Mobile Wallet Debugger shows at bottom of screen');
    console.log('   - Console logs wallet detection results');
    console.log('   - Force show all wallets option for testing');
    console.log('');
    
    console.log('🔧 Troubleshooting:');
    console.log('   - Open browser dev tools on mobile');
    console.log('   - Check console for "📱 Enhanced Mobile Wallet Detection" logs');
    console.log('   - Look for "🔍 Dynamic wallets available" messages');
    console.log('');
    
    console.log('📋 Test Checklist:');
    console.log('   [ ] Mobile device detects correctly');
    console.log('   [ ] Flow/Lilico wallet shows as option');
    console.log('   [ ] Dapper wallet shows as option');
    console.log('   [ ] Connection attempts work');
    console.log('   [ ] Dynamic Labs modal appears');
    console.log('   [ ] Wallet selection persists');
    
  } else {
    console.log('❌ Development server not responding');
    console.log('💡 Start server with: npm run dev');
  }
  
} catch (error) {
  console.log('❌ Cannot connect to development server');
  console.log('💡 Make sure server is running: npm run dev');
  console.log('💡 Server should be at: http://localhost:3000');
}

console.log('\n🚀 Quick Mobile Test Commands:');
console.log('   npm run dev     # Start development server');
console.log('   open "http://localhost:3000" on mobile browser');
console.log('   Look for mobile wallet connection UI');

console.log('\n📖 For detailed debugging:');
console.log('   Check the browser console on your mobile device');
console.log('   All wallet detection is logged with 📱 emojis');
