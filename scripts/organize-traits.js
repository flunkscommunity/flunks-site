#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Paths
const stagingDir = './public/images/jnr-traits/upload-staging';
const targetDir = './public/images/jnr-traits/full-traits';

// Mapping of filename patterns to target directories
const fileMapping = {
  // Direct folder matches
  'BACKDROP': 'BACKDROPS',
  'EYEBROW': 'EYEBROWS',
  'FIX': 'FIXES',
  'FREAK': 'FREAK',
  'GEEK': 'GEEK', 
  'JOCK': 'JOCK',
  'PREP': 'PREP',
  'NUMBER': 'NUMBERS',
  'FACE': 'FACE',
  'HEAD': 'HEAD',
  'PIGMENT': 'PIGMENT',
  'TORSO': 'TORSO',
  
  // Special cases
  'HEAD_OVERLAY': 'HEAD_OVERLAYERS',
  'OVERLAYER': 'HEAD_OVERLAYERS',
  '1OF1': '1OF1_S',
  'ONEOFONE': '1OF1_S'
};

// Colors and patterns that might indicate specific folders
const colorPatterns = [
  'BLUE', 'RED', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE', 'BLACK', 'WHITE',
  'CYAN', 'PINK', 'BROWN', 'GREY', 'GRAY', 'GOLD', 'SILVER'
];

const clothingPatterns = [
  'HOODY', 'HOODIE', 'VEST', 'TEE', 'SHIRT', 'JACKET', 'COAT', 'SWEATER',
  'LEATHER', 'PUFFER', 'BUTTON', 'POLO', 'VARSITY', 'ARGYLE'
];

function determineTargetFolder(filename) {
  const upperFilename = filename.toUpperCase();
  
  // Check direct mappings first
  for (const [pattern, folder] of Object.entries(fileMapping)) {
    if (upperFilename.includes(pattern)) {
      return folder;
    }
  }
  
  // Check for clothing patterns -> TORSO
  for (const pattern of clothingPatterns) {
    if (upperFilename.includes(pattern)) {
      return 'TORSO';
    }
  }
  
  // Check for hair/head patterns
  if (upperFilename.includes('HAIR') || upperFilename.includes('AFRO') || 
      upperFilename.includes('BALD') || upperFilename.includes('BUZZ')) {
    return 'HEAD';
  }
  
  // Check for facial features
  if (upperFilename.includes('EYE') || upperFilename.includes('MOUTH') || 
      upperFilename.includes('NOSE') || upperFilename.includes('SMILE')) {
    return 'FACE';
  }
  
  // Default based on filename patterns
  if (upperFilename.startsWith('_')) {
    // Files starting with underscore might be numbered/special
    if (upperFilename.match(/_\d{4}_/)) {
      return 'TORSO'; // Most numbered files seem to be clothing
    }
  }
  
  // If we can't determine, put in a misc folder for manual sorting
  return 'MISC';
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function organizeFiles() {
  console.log('🚀 Starting file organization...');
  
  // Check if staging directory exists and has files
  if (!fs.existsSync(stagingDir)) {
    console.log('❌ Staging directory not found:', stagingDir);
    return;
  }
  
  const files = fs.readdirSync(stagingDir);
  const imageFiles = files.filter(file => 
    file.toLowerCase().match(/\.(png|jpg|jpeg|gif|webp)$/i)
  );
  
  if (imageFiles.length === 0) {
    console.log('📂 No image files found in staging directory');
    return;
  }
  
  console.log(`📁 Found ${imageFiles.length} image files to organize`);
  
  // Create a summary of where files will go
  const summary = {};
  const unorganized = [];
  
  imageFiles.forEach(file => {
    const targetFolder = determineTargetFolder(file);
    
    if (targetFolder === 'MISC') {
      unorganized.push(file);
    } else {
      if (!summary[targetFolder]) {
        summary[targetFolder] = [];
      }
      summary[targetFolder].push(file);
    }
  });
  
  // Show summary
  console.log('\n📊 Organization Summary:');
  Object.entries(summary).forEach(([folder, files]) => {
    console.log(`  ${folder}: ${files.length} files`);
  });
  
  if (unorganized.length > 0) {
    console.log(`  MISC (needs manual sorting): ${unorganized.length} files`);
  }
  
  // Ask for confirmation (in a real scenario)
  console.log('\n🔄 Organizing files...');
  
  // Create target directories and move files
  Object.entries(summary).forEach(([folder, files]) => {
    const targetFolderPath = path.join(targetDir, folder);
    ensureDirectoryExists(targetFolderPath);
    
    files.forEach(file => {
      const sourcePath = path.join(stagingDir, file);
      const targetPath = path.join(targetFolderPath, file);
      
      try {
        fs.renameSync(sourcePath, targetPath);
        console.log(`✅ Moved ${file} → ${folder}/`);
      } catch (error) {
        console.log(`❌ Failed to move ${file}:`, error.message);
      }
    });
  });
  
  // Handle unorganized files
  if (unorganized.length > 0) {
    const miscPath = path.join(targetDir, 'MISC');
    ensureDirectoryExists(miscPath);
    
    unorganized.forEach(file => {
      const sourcePath = path.join(stagingDir, file);
      const targetPath = path.join(miscPath, file);
      
      try {
        fs.renameSync(sourcePath, targetPath);
        console.log(`📋 Moved ${file} → MISC/ (needs manual sorting)`);
      } catch (error) {
        console.log(`❌ Failed to move ${file}:`, error.message);
      }
    });
  }
  
  console.log('\n🎉 File organization complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Check the organized folders in:', targetDir);
  console.log('2. Review any files in MISC/ folder for manual sorting');
  console.log('3. The JNRS Creator app will automatically detect the new files');
}

// Run the organization
organizeFiles();
