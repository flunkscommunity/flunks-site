#!/usr/bin/env node

/**
 * Pre-deployment verification script
 * Checks that all components are ready for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Flunks Deployment Verification');
console.log('=================================');

const checks = [
  {
    name: 'Access Gate Component',
    check: () => fs.existsSync('src/components/AccessGate.tsx'),
    fix: 'AccessGate component is missing - it should have been created'
  },
  {
    name: 'Production Environment',
    check: () => fs.existsSync('.env.production'),
    fix: 'Missing .env.production file'
  },
  {
    name: 'Package.json Scripts',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.scripts && pkg.scripts.build && pkg.scripts.start;
    },
    fix: 'Missing required npm scripts (build, start)'
  },
  {
    name: 'Deployment Guide',
    check: () => fs.existsSync('DEPLOYMENT_GUIDE.md'),
    fix: 'Missing deployment documentation'
  },
  {
    name: 'Migration Plan',
    check: () => fs.existsSync('MIGRATION_PLAN.md'),
    fix: 'Missing migration documentation'
  },
  {
    name: 'Access Code Script',
    check: () => fs.existsSync('scripts/check-access-codes.js'),
    fix: 'Missing access code management script'
  }
];

let allPassed = true;

console.log('\n📋 Running pre-deployment checks...\n');

checks.forEach((check, index) => {
  const passed = check.check();
  const status = passed ? '✅' : '❌';
  const number = `${index + 1}.`.padEnd(3);
  
  console.log(`${number}${status} ${check.name}`);
  
  if (!passed) {
    console.log(`     💡 ${check.fix}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(40));

if (allPassed) {
  console.log('🎉 All checks passed! Ready for deployment.');
  console.log('');
  console.log('🚀 Next steps:');
  console.log('   1. Run: ./deploy.sh');
  console.log('   2. Or: vercel --prod');
  console.log('   3. Add flunks.net domain to hosting');
  console.log('   4. Test access codes');
  console.log('');
  console.log('📖 See MIGRATION_PLAN.md for detailed instructions');
} else {
  console.log('⚠️  Some checks failed. Please fix the issues above before deploying.');
}

console.log('\n🔐 Access Codes for Testing:');
console.log('   FLUNKS2025 (Admin)');
console.log('   SEMESTER0 (Beta)');
console.log('   HIGHSCHOOL95 (Community)');
console.log('');
