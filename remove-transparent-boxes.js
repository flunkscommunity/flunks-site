// Script to remove all transparent icon divs from Semester0Map.tsx
// These were added by the add-map-icons.sh script and create transparent boxes on the map

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/windows/Semester0Map.tsx');

console.log('🧹 Removing transparent icon divs from Semester0Map...');

let content = fs.readFileSync(filePath, 'utf8');

// Remove the specific transparent icon div patterns
// Each pattern starts with <div className containing styles.icon and ends with emoji + </div>

const patterns = [
  // junkyard
  /\s+<div\s+className={`\${styles\.icon}[^}]+styles\.junkyard[^}]*`}[^>]*>[^<]*onClick[^<]*<[^>]*>[^<]*onMouseEnter[^<]*<[^>]*>[^<]*onMouseLeave[^<]*<[^>]*>[^<]*onTouchStart[^<]*<[^>]*>[^<]*onTouchEnd[^<]*<[^>]*>[^<]*onDoubleClick[\s\S]*?>\s*⚰️\s*<\/div>/,
  
  // lake-tree
  /\s+<div\s+className={`\${styles\.icon}[^}]+lake-tree[^}]*`}[^>]*>[^<]*onClick[^<]*<[^>]*>[^<]*onMouseEnter[^<]*<[^>]*>[^<]*onMouseLeave[^<]*<[^>]*>[^<]*onTouchStart[^<]*<[^>]*>[^<]*onTouchEnd[^<]*<[^>]*>[^<]*onDoubleClick[\s\S]*?>\s*🌳\s*<\/div>/,
  
  // rug-doctor
  /\s+<div\s+className={`\${styles\.icon}[^}]+rug-doctor[^}]*`}[^>]*>[^<]*onClick[^<]*<[^>]*>[^<]*onMouseEnter[^<]*<[^>]*>[^<]*onMouseLeave[^<]*<[^>]*>[^<]*onTouchStart[^<]*<[^>]*>[^<]*onTouchEnd[^<]*<[^>]*>[^<]*onDoubleClick[\s\S]*?>\s*🔧\s*<\/div>/,
  
  // shed
  /\s+<div\s+className={`\${styles\.icon}[^}]+shed[^}]*`}[^>]*>[^<]*onClick[^<]*<[^>]*>[^<]*onMouseEnter[^<]*<[^>]*>[^<]*onMouseLeave[^<]*<[^>]*>[^<]*onTouchStart[^<]*<[^>]*>[^<]*onTouchEnd[^<]*<[^>]*>[^<]*onDoubleClick[\s\S]*?>\s*🚽\s*<\/div>/,
  
  // treehouse (secret-treehouse)
  /\s+<div\s+className={`\${styles\.icon}[^}]+treehouse[^}]*`}[^>]*>[^<]*onClick[^<]*<[^>]*>[^<]*onMouseEnter[^<]*<[^>]*>[^<]*onMouseLeave[^<]*<[^>]*>[^<]*onTouchStart[^<]*<[^>]*>[^<]*onTouchEnd[^<]*<[^>]*>[^<]*onDoubleClick[\s\S]*?>\s*👻\s*<\/div>/,
  
  // high-school 
  /\s+<div\s+className={`\${styles\.icon}[^}]+high-school[^}]*`}[^>]*>[^<]*onClick[^<]*<[^>]*>[^<]*onMouseEnter[^<]*<[^>]*>[^<]*onMouseLeave[^<]*<[^>]*>[^<]*onTouchStart[^<]*<[^>]*>[^<]*onTouchEnd[^<]*<[^>]*>[^<]*handleLocationAccess[\s\S]*?>\s*🏫\s*<\/div>/,
  
  // paradise-motel
  /\s+<div\s+className={`\${styles\.icon}[^}]+paradise-motel[^}]*`}[^>]*>[^<]*onClick[^<]*<[^>]*>[^<]*onMouseEnter[^<]*<[^>]*>[^<]*onMouseLeave[^<]*<[^>]*>[^<]*onTouchStart[^<]*<[^>]*>[^<]*onTouchEnd[^<]*<[^>]*>[^<]*onDoubleClick[\s\S]*?>\s*🏩\s*<\/div>/,
];

let removedCount = 0;

patterns.forEach((pattern, index) => {
  const before = content.length;
  content = content.replace(pattern, '');
  const after = content.length;
  
  if (before !== after) {
    removedCount++;
    console.log(`✅ Removed transparent box ${index + 1}`);
  }
});

fs.writeFileSync(filePath, content);

console.log(`\n🎉 Successfully removed ${removedCount} transparent icon boxes from the map!`);
console.log('The map should now be cleaner without the scattered transparent divs.');
