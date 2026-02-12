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

  // Step 4.1: Remove macOS duplicate folders (e.g. "images 2", "_next 3")
  // macOS sometimes creates these during copy operations and they bloat the build
  logStep('4.1/8', 'Removing macOS duplicate folders...');
  const outEntries = fs.readdirSync(OUT_DIR);
  let dupeCount = 0;
  for (const entry of outEntries) {
    // Match folders like "images 2", "_next 3", "admin 3", etc.
    if (/\s\d+$/.test(entry)) {
      const fullPath = path.join(OUT_DIR, entry);
      if (fs.statSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        log(`  ✓ Removed duplicate folder: ${entry}`, colors.green);
        dupeCount++;
      }
    }
  }
  if (dupeCount === 0) {
    log('  ✓ No duplicate folders found', colors.green);
  }

  // Step 4.5: Remove large assets not needed for mobile
  // This keeps the build under 200MB for Play Store/App Store
  logStep('4.5/6', 'Optimizing for mobile (removing large unused assets)...');
  
  const ASSETS_TO_REMOVE = [
    'images/jnr-traits',      // 570MB - NFT traits, not needed in app
    'slots/animations',        // 117MB - Slot animations (not needed)
    'slots/sounds',            // 2MB - Slot sounds (we have sounds/ folder)
    'audio',                   // 48MB - Radio stations (not needed)
    '3d',                      // 11MB - 3D models not used in mobile
    'images/cutscenes',        // 86MB - Large cutscene images
    'images/myplace',          // 43MB - MyPlace room images (not used in mobile)
    'images/profiles',         // 29MB - Profile images (loaded from web)
    'images/jackets',          // 16MB - Jacket images
    'images/about-us',         // 7.6MB - About us images
    // 'sounds',               // KEEP - Sound effects needed for games!
    // 'cards',                // KEEP - Card SVGs for Jacks or Better (8MB)
    // 'slots/images',         // KEEP - slot-machine.png needed for games
    // 'music',                // KEEP SOME - see MUSIC_TO_KEEP below
    'Games',                   // 8.8MB - Standalone game assets
  ];
  
  // Music files to keep for mobile (underground, story mode, locations)
  const MUSIC_TO_KEEP = [
    'underground.mp3',        // Underground casino music
    'homecomingstory.mp3',    // Story mode - Chapter 3/4/5
    'child.mp3',              // Story mode - Chapter 1/2
    'homecoming.mp3',         // Football field
    'arcade.mp3',             // Arcade
    'enter.mp3',              // Arcade entrance
    'paradisemotel.mp3',      // Paradise Motel (day)
    'night.mp3',              // Paradise Motel (night)
    'tvaudio.mp3',              // Freaks TV
    'pool-music.mp3',           // Pool game music
  ];
  
  let totalRemoved = 0;
  for (const assetPath of ASSETS_TO_REMOVE) {
    const fullPath = path.join(OUT_DIR, assetPath);
    if (fs.existsSync(fullPath)) {
      // Get size before removing
      const getSize = (dir) => {
        let size = 0;
        try {
          const files = fs.readdirSync(dir, { withFileTypes: true });
          for (const file of files) {
            const filePath = path.join(dir, file.name);
            if (file.isDirectory()) {
              size += getSize(filePath);
            } else {
              size += fs.statSync(filePath).size;
            }
          }
        } catch (e) {}
        return size;
      };
      const sizeMB = Math.round(getSize(fullPath) / 1024 / 1024);
      totalRemoved += sizeMB;
      
      fs.rmSync(fullPath, { recursive: true, force: true });
      log(`  ✓ Removed ${assetPath} (~${sizeMB}MB)`, colors.green);
    }
  }
  
  // Compress large images in specific folders
  const FOLDERS_TO_COMPRESS = [
    'images/icons/slot-icons',
    'images/icons',
    'images/locations',
    'images/backgrounds',
    'images/backdrops',
    'images/pins',
    'images/jerseys',
    'images/arcade',
    'cards',
  ];
  
  log(`  📦 Compressing large images (max 768px)...`, colors.blue);
  for (const folder of FOLDERS_TO_COMPRESS) {
    const folderPath = path.join(OUT_DIR, folder);
    if (fs.existsSync(folderPath)) {
      try {
        // Use sips to resize images larger than 768px (macOS only) - more aggressive for mobile
        execSync(`find "${folderPath}" -type f \\( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \\) | while read f; do
          width=$(sips -g pixelWidth "$f" 2>/dev/null | tail -1 | awk '{print $2}')
          if [ -n "$width" ] && [ "$width" -gt 768 ] 2>/dev/null; then
            sips -Z 768 "$f" >/dev/null 2>&1
          fi
        done`, { stdio: 'pipe', cwd: ROOT_DIR });
        log(`  ✓ Compressed images in ${folder}`, colors.green);
      } catch (e) {
        // Silently continue if sips fails (non-macOS or no large images)
      }
    }
  }

  // Compress large individual images in images/ root (maps, backgrounds, etc.)
  log(`  📦 Compressing large root images (max 1536px)...`, colors.blue);
  const LARGE_IMAGES_TO_COMPRESS = [
    'images/season-zero-map.png',      // 40MB -> compress to 1536px
    'images/flunks-map.png',           // 23MB -> compress to 1536px
    'images/my-locker-front.png',      // 8MB
    'images/bulletin-august.png',      // 8MB
    'images/my-background.png',        // 6MB
    'images/zoltar-background.png',    // 3MB
    'images/pause-screen.png',         // 3MB
    'images/game-manual-cover.png',    // 3MB
    'images/radio-dashboard.png',      // 2MB
    'images/coming-soon.png',          // 2MB
  ];
  
  for (const imgPath of LARGE_IMAGES_TO_COMPRESS) {
    const fullPath = path.join(OUT_DIR, imgPath);
    if (fs.existsSync(fullPath)) {
      try {
        const beforeSize = fs.statSync(fullPath).size;
        execSync(`sips -Z 1536 "${fullPath}" >/dev/null 2>&1`, { stdio: 'pipe', cwd: ROOT_DIR });
        const afterSize = fs.statSync(fullPath).size;
        const savedMB = Math.round((beforeSize - afterSize) / 1024 / 1024);
        if (savedMB > 0) {
          totalRemoved += savedMB;
          log(`  ✓ Compressed ${imgPath} (saved ~${savedMB}MB)`, colors.green);
        }
      } catch (e) {
        // Silently continue
      }
    }
  }

  // Remove old slot theme images but keep slot-machine.png
  const slotsImagesDir = path.join(OUT_DIR, 'slots/images');
  if (fs.existsSync(slotsImagesDir)) {
    const oldThemeImages = ['bat.png', 'beetle.png', 'freespins.png', 'ghost.png', 'goblin.png', 
      'haunted_background.png', 'haunted_house.png', 'mummy.png', 'skeleton.png', 
      'spider.png', 'vampire.png', 'werewolf.png', 'witch.png'];
    for (const img of oldThemeImages) {
      const imgPath = path.join(slotsImagesDir, img);
      if (fs.existsSync(imgPath)) {
        const sizeMB = Math.round(fs.statSync(imgPath).size / 1024 / 1024);
        fs.rmSync(imgPath);
        totalRemoved += sizeMB;
      }
    }
    log(`  ✓ Removed old slot theme images (~30MB), kept slot-machine.png`, colors.green);
  }

  // Clean up music folder - remove unused tracks but keep essential ones
  const musicDir = path.join(OUT_DIR, 'music');
  if (fs.existsSync(musicDir)) {
    const musicFiles = fs.readdirSync(musicDir);
    let musicRemoved = 0;
    for (const file of musicFiles) {
      if (file.endsWith('.mp3') && !MUSIC_TO_KEEP.includes(file)) {
        const filePath = path.join(musicDir, file);
        const sizeMB = Math.round(fs.statSync(filePath).size / 1024 / 1024);
        fs.rmSync(filePath);
        musicRemoved += sizeMB;
        totalRemoved += sizeMB;
      }
    }
    log(`  ✓ Cleaned music folder: removed ~${musicRemoved}MB, kept ${MUSIC_TO_KEEP.length} essential tracks`, colors.green);
  }

  log(`  📊 Total space saved: ~${totalRemoved}MB`, colors.cyan);

  // Step 5: Size gate — verify out/ is under 200MB before syncing
  logStep('5/8', 'Checking build size...');
  const getDirectorySize = (dir) => {
    let size = 0;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          size += getDirectorySize(fullPath);
        } else {
          size += fs.statSync(fullPath).size;
        }
      }
    } catch (e) {}
    return size;
  };
  const outSizeMB = Math.round(getDirectorySize(OUT_DIR) / 1024 / 1024);
  log(`  📦 Build output size: ${outSizeMB}MB`, outSizeMB <= 200 ? colors.green : colors.red);
  
  if (outSizeMB > 200) {
    log(`\n  ❌ BUILD TOO LARGE: ${outSizeMB}MB exceeds 200MB limit!`, colors.red);
    log(`  Top folders:`, colors.yellow);
    const topFolders = fs.readdirSync(OUT_DIR, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => ({ name: e.name, size: Math.round(getDirectorySize(path.join(OUT_DIR, e.name)) / 1024 / 1024) }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
    for (const f of topFolders) {
      log(`    ${f.name}: ${f.size}MB`, colors.yellow);
    }
    log(`\n  Add large folders to ASSETS_TO_REMOVE in scripts/build-mobile.js`, colors.yellow);
    process.exit(1);
  }
  
  log(`  ✅ Size OK (${outSizeMB}MB ≤ 200MB)`, colors.green);

  // Step 6: Sync to native platforms
  logStep('6/8', 'Syncing to native platforms...');
  
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

  // Step 7: Build signed AAB for Android
  if (target === 'android' || target === 'all') {
    logStep('7/8', 'Building signed Android AAB...');
    const androidDir = path.join(ROOT_DIR, 'android');
    try {
      run(`cd "${androidDir}" && ./gradlew bundleRelease`);
      
      const aabPath = path.join(androidDir, 'app/build/outputs/bundle/release/app-release.aab');
      if (fs.existsSync(aabPath)) {
        const aabSizeMB = Math.round(fs.statSync(aabPath).size / 1024 / 1024);
        
        // Read version from build.gradle
        const buildGradle = fs.readFileSync(path.join(androidDir, 'app/build.gradle'), 'utf8');
        const versionMatch = buildGradle.match(/versionCode\s+(\d+)/);
        const versionCode = versionMatch ? versionMatch[1] : 'unknown';
        
        // Copy to Desktop with version in filename
        const desktopPath = path.join(require('os').homedir(), 'Desktop', `flunks-v${versionCode}.aab`);
        fs.copyFileSync(aabPath, desktopPath);
        
        log(`  ✅ AAB built: ${aabSizeMB}MB`, colors.green);
        log(`  📁 Copied to: ${desktopPath}`, colors.green);
      } else {
        log(`  ❌ AAB not found at expected path`, colors.red);
      }
    } catch (error) {
      log(`  ❌ AAB build failed — you can build manually in Android Studio`, colors.red);
    }
  }

  // Step 8: Summary
  logStep('8/8', 'Build complete!');
  
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
    Upload the AAB from your Desktop to Google Play Console
    → Internal Testing track for testing
    → Production track when ready
`);
  }
}

main().catch(console.error);
