#!/usr/bin/env node

/**
 * Test Build Mode System
 * Verifies that build mode feature flags work correctly
 */

const fs = require('fs');

console.log('🧪 Testing Flunks Build Mode System');
console.log('===================================');

// Test different environment configurations
const testConfigs = [
  { name: 'Public Mode', env: { NEXT_PUBLIC_BUILD_MODE: 'public' } },
  { name: 'Build Mode', env: { NEXT_PUBLIC_BUILD_MODE: 'build' } },
  { name: 'Default (no env)', env: {} }
];

testConfigs.forEach(config => {
  console.log(`\n🔍 Testing ${config.name}:`);
  
  // Set environment variables
  Object.assign(process.env, config.env);
  
  try {
    // Clear require cache to get fresh imports
    delete require.cache[require.resolve('../src/utils/buildMode.ts')];
    delete require.cache[require.resolve('../src/utils/appPermissions.ts')];
    
    const { getBuildModeConfig, getCurrentBuildMode } = require('../src/utils/buildMode.ts');
    
    const mode = getCurrentBuildMode();
    const buildConfig = getBuildModeConfig();
    
    console.log(`  Mode: ${mode}`);
    console.log(`  Semester Zero: ${buildConfig.showSemesterZero ? '✅' : '❌'}`);
    console.log(`  Meme Manager: ${buildConfig.showMemeManager ? '✅' : '❌'}`);
    console.log(`  MyPlace: ${buildConfig.showMyPlace ? '✅' : '❌'}`);
    console.log(`  Flappy Flunk: ${buildConfig.showFlappyFlunk ? '✅' : '❌'}`);
    console.log(`  Admin Panel: ${buildConfig.showGumAdminPanel ? '✅' : '❌'}`);
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
});

console.log('\n✅ Build mode system test completed!');
console.log('\n💡 To test in browser:');
console.log('1. Run: NEXT_PUBLIC_BUILD_MODE=public npm run dev');
console.log('2. Open browser console and type: flunks.buildMode()');
console.log('3. Try: NEXT_PUBLIC_BUILD_MODE=build npm run dev');
console.log('4. Compare the feature differences!');
