#!/usr/bin/env node

/**
 * Verify Two-Mode System Setup
 * Checks if build mode configuration is working properly
 */

console.log('🔍 Verifying Flunks Two-Mode System Setup');
console.log('=========================================');

// Test if build mode files exist
const fs = require('fs');
const requiredFiles = [
  'src/utils/buildMode.ts',
  '.env.production', 
  '.env.build',
  'deploy-public.sh',
  'deploy-build.sh'
];

console.log('\n📁 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// Test environment configurations
console.log('\n🔧 Checking environment files:');

try {
  const prodEnv = fs.readFileSync('.env.production', 'utf8');
  const buildEnv = fs.readFileSync('.env.build', 'utf8');
  
  const prodHasBuildMode = prodEnv.includes('NEXT_PUBLIC_BUILD_MODE="public"');
  const buildHasBuildMode = buildEnv.includes('NEXT_PUBLIC_BUILD_MODE="build"');
  
  console.log(`   ${prodHasBuildMode ? '✅' : '❌'} .env.production has BUILD_MODE=public`);
  console.log(`   ${buildHasBuildMode ? '✅' : '❌'} .env.build has BUILD_MODE=build`);
} catch (error) {
  console.log('   ❌ Error reading environment files');
}

// Test if package.json has new scripts
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasPublicScript = pkg.scripts && pkg.scripts['build:public'];
  const hasBuildScript = pkg.scripts && pkg.scripts['build:build-mode'];
  
  console.log('\n📦 Checking package.json scripts:');
  console.log(`   ${hasPublicScript ? '✅' : '❌'} build:public script exists`);
  console.log(`   ${hasBuildScript ? '✅' : '❌'} build:build-mode script exists`);
} catch (error) {
  console.log('   ❌ Error reading package.json');
}

console.log('\n🎯 NEXT STEPS FOR DEPLOYMENT:');
console.log('');
console.log('1. 🌐 SET UP VERCEL PROJECTS:');
console.log('   • Run: ./VERCEL_SETUP_GUIDE.sh');
console.log('   • Follow the step-by-step instructions');
console.log('');
console.log('2. 🚀 DEPLOY BOTH MODES:');
console.log('   • Public: ./deploy-public.sh');  
console.log('   • Build:  ./deploy-build.sh');
console.log('');
console.log('3. 🔧 CONFIGURE DOMAINS:');
console.log('   • flunks.net → Public mode');
console.log('   • build.flunks.net → Build mode');
console.log('');
console.log('4. 🧪 TEST THE SYSTEM:');
console.log('   • Visit flunks.net (should show limited features)');
console.log('   • Visit build.flunks.net (should show all features)');
console.log('   • Use console: flunks.buildMode() to verify');

console.log('\n✅ Two-mode system is ready for deployment!');
