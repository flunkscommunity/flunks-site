#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Paths
const stagingBaseDir = './public/images/jnr-traits/upload-staging';
const targetDir = './public/images/jnr-traits/full-traits';

// Clique folders
const cliques = ['FREAKS', 'GEEKS', 'JOCKS', 'PREPS'];

// Mapping of filename patterns to target directories
const fileMapping = {
  // Direct folder matches
  'BACKDROP': 'BACKDROPS',
  'EYEBROW': 'EYEBROWS', 
  'FIX': 'FIXES',
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

const clothingPatterns = [
  'HOODY', 'HOODIE', 'VEST', 'TEE', 'SHIRT', 'JACKET', 'COAT', 'SWEATER',
  'LEATHER', 'PUFFER', 'BUTTON', 'POLO', 'VARSITY', 'ARGYLE', 'BLAZER',
  'TANK', 'CROP', 'DRESS', 'SUIT', 'CARDIGAN'
];

const headPatterns = [
  'HAIR', 'AFRO', 'BALD', 'BUZZ', 'MOHAWK', 'PONYTAIL', 'BRAIDS', 
  'CURLY', 'STRAIGHT', 'WAVY', 'BANGS', 'FRINGE'
];

const facePatterns = [
  'EYE', 'MOUTH', 'NOSE', 'SMILE', 'FROWN', 'WINK', 'BLUSH',
  'FRECKLE', 'MOLE', 'SCAR', 'DIMPLE', 'ANGRY', 'ANNOYED', 'ANON',
  'ASTONISHED', 'BRUISED', 'BUBBLEGUM', 'CIGGY', 'COOL', 'SHADES',
  'CREEPY', 'CUTE', 'RASP', 'CYAN', 'DAZED', 'DIAM', 'GRILLZ',
  'ETERNAL', 'SKULL', 'FANGS', 'FLIRTY', 'FROWNY', 'GOLD', 'GRILLZ',
  'HEARTY', 'KISS', 'HOCKEY', 'IMPATIENT', 'QUIRKY', 'LOST', 'MAKEUP',
  '3D-GLASSES', 'GLASSES'
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
  
  // Check for hair/head patterns -> HEAD
  for (const pattern of headPatterns) {
    if (upperFilename.includes(pattern)) {
      return 'HEAD';
    }
  }
  
  // Check for facial features -> FACE
  for (const pattern of facePatterns) {
    if (upperFilename.includes(pattern)) {
      return 'FACE';
    }
  }
  
  // Default based on filename patterns
  if (upperFilename.startsWith('_')) {
    // Files starting with underscore are likely numbered traits
    if (upperFilename.match(/_\d{4}_/)) {
      // Try to determine from the content after the number
      const afterNumber = upperFilename.split('_').slice(2).join('_');
      
      // Check clothing patterns in the latter part
      for (const pattern of clothingPatterns) {
        if (afterNumber.includes(pattern)) {
          return 'TORSO';
        }
      }
      
      // Check head patterns
      for (const pattern of headPatterns) {
        if (afterNumber.includes(pattern)) {
          return 'HEAD';
        }
      }
      
      // Check face patterns
      for (const pattern of facePatterns) {
        if (afterNumber.includes(pattern)) {
          return 'FACE';
        }
      }
      
      // Default numbered files to TORSO (most common)
      return 'TORSO';
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

function organizeCliqueFiles(clique) {
  const cliqueStaging = path.join(stagingBaseDir, clique);
  
  console.log(`\n🎯 Processing ${clique} files...`);
  
  if (!fs.existsSync(cliqueStaging)) {
    console.log(`⚠️  ${clique} staging folder not found: ${cliqueStaging}`);
    return { processed: 0, summary: {} };
  }
  
  const files = fs.readdirSync(cliqueStaging);
  const imageFiles = files.filter(file => 
    file.toLowerCase().match(/\.(png|jpg|jpeg|gif|webp)$/i)
  );
  
  if (imageFiles.length === 0) {
    console.log(`📂 No image files found in ${clique} folder`);
    return { processed: 0, summary: {} };
  }
  
  console.log(`📁 Found ${imageFiles.length} files in ${clique}`);
  
  const summary = {};
  const unorganized = [];
  
  imageFiles.forEach(file => {
    const targetFolder = determineTargetFolder(file);
    
    if (targetFolder === 'MISC') {
      unorganized.push(file);
    } else {
      // Instead of putting everything in clique folder, categorize properly
      if (!summary[targetFolder]) {
        summary[targetFolder] = [];
      }
      summary[targetFolder].push({ file, clique: clique.slice(0, -1) });
    }
  });
  
  // Move files to appropriate category folders (not clique folders)
  Object.entries(summary).forEach(([categoryFolder, files]) => {
    const targetFolderPath = path.join(targetDir, categoryFolder);
    ensureDirectoryExists(targetFolderPath);
    
    files.forEach(({ file, clique }) => {
      const sourcePath = path.join(cliqueStaging, file);
      // Add clique prefix to filename to avoid conflicts
      const prefixedFilename = `${clique}_${file}`;
      const targetPath = path.join(targetFolderPath, prefixedFilename);
      
      try {
        fs.renameSync(sourcePath, targetPath);
        console.log(`✅ ${file} → ${categoryFolder}/${prefixedFilename}`);
      } catch (error) {
        console.log(`❌ Failed to move ${file}:`, error.message);
      }
    });
  });
  
  // Handle unorganized files
  if (unorganized.length > 0) {
    const miscPath = path.join(targetDir, 'MISC', clique.slice(0, -1));
    ensureDirectoryExists(miscPath);
    
    unorganized.forEach(file => {
      const sourcePath = path.join(cliqueStaging, file);
      const targetPath = path.join(miscPath, file);
      
      try {
        fs.renameSync(sourcePath, targetPath);
        console.log(`📋 ${file} → MISC/${clique.slice(0, -1)}/`);
      } catch (error) {
        console.log(`❌ Failed to move ${file}:`, error.message);
      }
    });
  }
  
  return { 
    processed: imageFiles.length, 
    summary: Object.fromEntries(Object.entries(summary).map(([k, v]) => [k, v.length])),
    unorganized: unorganized.length
  };
}

function organizeSharedFiles() {
  const sharedStaging = path.join(stagingBaseDir, 'SHARED');
  
  console.log(`\n🌐 Processing SHARED files...`);
  
  if (!fs.existsSync(sharedStaging)) {
    console.log(`⚠️  SHARED staging folder not found: ${sharedStaging}`);
    return { processed: 0, summary: {} };
  }
  
  const files = fs.readdirSync(sharedStaging);
  const imageFiles = files.filter(file => 
    file.toLowerCase().match(/\.(png|jpg|jpeg|gif|webp)$/i)
  );
  
  if (imageFiles.length === 0) {
    console.log(`📂 No image files found in SHARED folder`);
    return { processed: 0, summary: {} };
  }
  
  console.log(`� Found ${imageFiles.length} shared files`);
  
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
  
  // Move shared files to appropriate folders
  Object.entries(summary).forEach(([folder, files]) => {
    const targetFolderPath = path.join(targetDir, folder);
    ensureDirectoryExists(targetFolderPath);
    
    files.forEach(file => {
      const sourcePath = path.join(sharedStaging, file);
      const targetPath = path.join(targetFolderPath, file);
      
      try {
        fs.renameSync(sourcePath, targetPath);
        console.log(`✅ ${file} → ${folder}/`);
      } catch (error) {
        console.log(`❌ Failed to move ${file}:`, error.message);
      }
    });
  });
  
  // Handle unorganized shared files
  if (unorganized.length > 0) {
    const miscPath = path.join(targetDir, 'MISC', 'SHARED');
    ensureDirectoryExists(miscPath);
    
    unorganized.forEach(file => {
      const sourcePath = path.join(sharedStaging, file);
      const targetPath = path.join(miscPath, file);
      
      try {
        fs.renameSync(sourcePath, targetPath);
        console.log(`📋 ${file} → MISC/SHARED/`);
      } catch (error) {
        console.log(`❌ Failed to move ${file}:`, error.message);
      }
    });
  }
  
  return { 
    processed: imageFiles.length, 
    summary: Object.fromEntries(Object.entries(summary).map(([k, v]) => [k, v.length])),
    unorganized: unorganized.length
  };
}

function organizeFiles() {
  console.log('🚀 Starting clique-based file organization...');
  
  let totalProcessed = 0;
  const allSummary = {};
  
  // Process each clique
  cliques.forEach(clique => {
    const result = organizeCliqueFiles(clique);
    totalProcessed += result.processed;
    
    Object.entries(result.summary).forEach(([folder, count]) => {
      if (!allSummary[folder]) allSummary[folder] = 0;
      allSummary[folder] += count;
    });
  });
  
  // Process shared files
  const sharedResult = organizeSharedFiles();
  totalProcessed += sharedResult.processed;
  
  Object.entries(sharedResult.summary).forEach(([folder, count]) => {
    if (!allSummary[folder]) allSummary[folder] = 0;
    allSummary[folder] += count;
  });
  
  console.log('\n📊 Final Organization Summary:');
  Object.entries(allSummary).forEach(([folder, count]) => {
    console.log(`  ${folder}: ${count} files`);
  });
  
  console.log(`\n🎉 Organization complete! Processed ${totalProcessed} files total`);
  console.log('\n📋 Next steps:');
  console.log('1. Check the organized folders in:', targetDir);
  console.log('2. Review any files in MISC/ subfolders for manual sorting');
  console.log('3. Run: npm run generate-trait-data');
  console.log('4. The JNRS Creator will automatically detect the new files');
}

// Run the organization
organizeFiles();
