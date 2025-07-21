#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Generate trait data for the JNRS Creator app
function generateTraitData() {
  const traitsDir = './public/images/jnr-traits/full-traits';
  const outputFile = './src/data/traitData.ts';
  
  const traitData = {
    PIGMENT: [], // Base color - prioritized first
    BACKDROPS: [],
    TORSO: [],
    HEAD: [],
    FACE: [],
    EYEBROWS: [],
    HEAD_OVERLAYERS: [],
    FIXES: [],
    FREAK: [],
    GEEK: [],
    JOCK: [],
    PREP: [],
    NUMBERS: [],
    '1OF1_S': []
  };
  
  // Scan each trait folder
  Object.keys(traitData).forEach(folder => {
    const folderPath = path.join(traitsDir, folder);
    
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath)
        .filter(file => file.toLowerCase().match(/\.(png|jpg|jpeg|gif|webp)$/i))
        .map(file => ({
          name: file.replace(/\.(png|jpg|jpeg|gif|webp)$/i, ''),
          filename: file,
          path: `/images/jnr-traits/full-traits/${folder}/${file}`
        }));
      
      traitData[folder] = files;
      console.log(`📁 ${folder}: Found ${files.length} files`);
    } else {
      console.log(`⚠️  ${folder}: Folder not found`);
    }
  });
  
  // Generate TypeScript file
  const tsContent = `// Auto-generated trait data
// Last updated: ${new Date().toISOString()}

export interface TraitFile {
  name: string;
  filename: string;
  path: string;
}

export interface TraitData {
  [category: string]: TraitFile[];
}

export const TRAIT_DATA: TraitData = ${JSON.stringify(traitData, null, 2)};

export const getTraitsByCategory = (category: string): TraitFile[] => {
  return TRAIT_DATA[category] || [];
};

export const getAllCategories = (): string[] => {
  return Object.keys(TRAIT_DATA);
};

export const getTraitCount = (): number => {
  return Object.values(TRAIT_DATA).reduce((total, traits) => total + traits.length, 0);
};

// Helper function to get trait options for UI
export const getTraitOptions = (category: string): Array<{value: string, label: string}> => {
  const traits = getTraitsByCategory(category);
  return [
    { value: 'none', label: 'None' },
    ...traits.map(trait => ({
      value: trait.filename,
      label: trait.name.replace(/_/g, ' ').replace(/-/g, ' ')
    }))
  ];
};
`;

  // Write the file
  fs.writeFileSync(outputFile, tsContent);
  console.log(`✅ Generated trait data file: ${outputFile}`);
  
  const totalTraits = Object.values(traitData).reduce((total, traits) => total + traits.length, 0);
  console.log(`🎨 Total traits found: ${totalTraits}`);
}

// Run if called directly
if (require.main === module) {
  console.log('🔍 Scanning trait files...');
  generateTraitData();
}

module.exports = { generateTraitData };
