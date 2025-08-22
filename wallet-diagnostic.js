#!/usr/bin/env node

// Quick Wallet Connection Diagnostic Script
console.log('🔧 Flow Wallet Connection Diagnostic');
console.log('=====================================\n');

// Check if we can access the app
const { createClient } = require('@supabase/supabase-js');

async function diagnoseBrowser() {
  try {
    console.log('📊 Current Environment:');
    console.log('- Node.js version:', process.version);
    console.log('- Current directory:', process.cwd());
    
    // Check environment variables
    const envFile = require('fs').readFileSync('.env.local', 'utf8');
    const hasSupabase = envFile.includes('NEXT_PUBLIC_SUPABASE_URL');
    const hasDynamic = envFile.includes('DYNAMIC');
    
    console.log('- Supabase configured:', hasSupabase ? '✅' : '❌');
    console.log('- Dynamic configured:', hasDynamic ? '✅' : '❌');
    
    console.log('\n🔍 Recommendations:');
    console.log('1. Make sure Flow Wallet extension is installed in your browser');
    console.log('2. Try running the wallet fix script in browser console:');
    console.log('   - Open OnlyFlunks in browser');
    console.log('   - Open DevTools (F12)'); 
    console.log('   - Go to Console tab');
    console.log('   - Run: ');
    console.log('     fetch("/fix-dynamic-wallet-connection.js").then(r=>r.text()).then(eval)');
    
    console.log('\n3. Or manually test wallet detection:');
    console.log('   - Check console for "❌ No Flow Wallet extension detected"');
    console.log('   - Install Flow Wallet from: https://wallet.flow.com/');
    console.log('   - Refresh the page after installation');
    
    console.log('\n4. If Flow command tracking was the main issue - that\'s now fixed! ✅');
    console.log('   - Both "magic carpet" and "flow" commands now track properly');
    console.log('   - Test by typing "flow" in the terminal');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

diagnoseBrowser();
