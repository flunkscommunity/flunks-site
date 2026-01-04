#!/usr/bin/env node
/**
 * Mobile Build Script for Flunks iOS/Android App
 * 
 * This script builds the Next.js app in static export mode for Capacitor
 * without modifying the main next.config.mjs (which needs API routes for Vercel)
 * 
 * Usage: node scripts/build-mobile.js [ios|android|all]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT_DIR, 'out');
const NEXT_DIR = path.join(ROOT_DIR, '.next');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.cyan}[${step}]${colors.reset} ${colors.bright}${message}${colors.reset}`);
}

function run(command, options = {}) {
  log(`  $ ${command}`, colors.yellow);
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: ROOT_DIR,
      env: { ...process.env, ...options.env }
    });
  } catch (error) {
    log(`\n❌ Command failed: ${command}`, colors.red);
    process.exit(1);
  }
}

async function main() {
  const target = process.argv[2] || 'all';

  const nodeMajor = Number(String(process.versions.node || '').split('.')[0]);
  
  console.log(`
${colors.bright}╔════════════════════════════════════════════════╗
║     🎮 FLUNKS MOBILE BUILD SYSTEM 🎮            ║
╚════════════════════════════════════════════════╝${colors.reset}
`);

  log(`Node: ${process.version}`, colors.blue);
  if (!Number.isNaN(nodeMajor) && nodeMajor !== 20) {
    log(
      `⚠ Recommended Node version for this repo is 20.x (detected ${process.version}). If you see weird build failures, switch to Node 20 and retry.`,
      colors.yellow
    );
  }
  
  log(`Target: ${target}`, colors.blue);
  log(`Building for: ${target === 'all' ? 'iOS & Android' : target.toUpperCase()}`, colors.blue);

  // Step 1: Clean previous builds
  logStep('1/6', 'Cleaning previous builds...');
  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true });
    log('  ✓ Removed out/', colors.green);
  }
  if (fs.existsSync(NEXT_DIR)) {
    fs.rmSync(NEXT_DIR, { recursive: true });
    log('  ✓ Removed .next/', colors.green);
  }

  // Step 2: Build Next.js
  logStep('2/6', 'Building Next.js for mobile...');
  run('npm run build', {
    env: { 
      MOBILE_BUILD: 'true',
      SKIP_ENV_VALIDATION: 'true',
      NODE_ENV: 'production',
      NEXT_PUBLIC_BUILD_MODE: 'public'  // Ensure public/production mode for mobile
    }
  });

  // Step 3: Verify static export output
  // Next.js 14.2+ removed `next export`; for mobile we use `output: 'export'` in next.config.mjs.
  logStep('3/6', 'Verifying static export output...');

  // Verify out directory exists
  if (!fs.existsSync(OUT_DIR) || !fs.existsSync(path.join(OUT_DIR, 'index.html'))) {
    log('\n❌ Build failed: out/index.html not found', colors.red);
    log('   Make sure MOBILE_BUILD=true enables `output: "export"` in next.config.mjs', colors.yellow);
    process.exit(1);
  }
  
  log('  ✓ Static export created in out/', colors.green);

  // Step 4: Copy public assets
  logStep('4/6', 'Copying public assets...');
  const publicDir = path.join(ROOT_DIR, 'public');
  if (fs.existsSync(publicDir)) {
    // Copy files that might not be included in Next.js export
    const copyRecursive = (src, dest) => {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          copyRecursive(srcPath, destPath);
        } else if (!fs.existsSync(destPath)) {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };
    copyRecursive(publicDir, OUT_DIR);
    log('  ✓ Public assets copied', colors.green);
  }

  // Step 5: Sync to native platforms
  logStep('5/6', 'Syncing to native platforms...');
  
  if (target === 'ios' || target === 'all') {
    log('\n  📱 Syncing iOS...', colors.blue);
    run('npx cap sync ios');
    log('  ✓ iOS synced', colors.green);
  }
  
  if (target === 'android' || target === 'all') {
    log('\n  🤖 Syncing Android...', colors.blue);
    run('npx cap sync android');
    log('  ✓ Android synced', colors.green);
  }

  // Step 6: Summary
  logStep('6/6', 'Build complete!');
  
  console.log(`
${colors.green}${colors.bright}✅ Mobile build successful!${colors.reset}

${colors.cyan}Next steps:${colors.reset}
`);

  if (target === 'ios' || target === 'all') {
    console.log(`  ${colors.bright}iOS:${colors.reset}
    $ npx cap open ios
    Then press ⌘R in Xcode to run on simulator
`);
  }
  
  if (target === 'android' || target === 'all') {
    console.log(`  ${colors.bright}Android:${colors.reset}
    $ npx cap open android
    Then click Run in Android Studio
`);
  }

  logStep('7/7', 'Opening Xcode...');
  if (target === 'ios' || target === 'all') {
    run('npx cap open ios');
  }
}

main().catch(console.error);
