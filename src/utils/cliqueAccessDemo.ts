/**
 * Clique Access System Demo Script
 * 
 * This script demonstrates the clique-based access control system for Semester Zero.
 * Run this in the browser console when connected to a wallet to test the functionality.
 */

// Extend window interface for our demo functions
declare global {
  interface Window {
    testCliqueAccess: () => void;
    simulateNFTOwnership: (clique: string) => void;
    Dynamic?: any;
  }
}

// Test function to simulate different clique ownership scenarios
function testCliqueAccess() {
  console.log('🏠 Clique Access System Demo');
  console.log('============================');
  
  // Check if user is connected
  const userConnected = !!(window as any).Dynamic?.primaryWallet?.address;
  console.log(`✅ User connected: ${userConnected}`);
  
  if (!userConnected) {
    console.log('❌ Please connect your wallet first to test clique access');
    return;
  }
  
  console.log(`📝 Wallet: ${(window as any).Dynamic?.primaryWallet?.address}`);
  
  // Available cliques
  const cliques = ['GEEK', 'JOCK', 'PREP', 'FREAK'];
  
  console.log('\n📚 Clique Access Requirements:');
  cliques.forEach(clique => {
    console.log(`   ${getCliqueIcon(clique)} ${clique}: Need ${clique} NFT trait`);
  });
  
  console.log('\n🎯 Test Scenarios:');
  console.log('1. Try double-clicking any clique house on the Semester Zero map');
  console.log('2. If you own the required clique NFT → Access granted ✅');
  console.log('3. If you don\'t own the required clique NFT → Access denied ❌');
  
  console.log('\n🔧 How It Works:');
  console.log('• System scans your wallet for Flunks NFTs');
  console.log('• Checks the "clique" trait on each NFT');
  console.log('• Grants access to corresponding clique houses');
  console.log('• Shows access status in the Clique Access window');
}

// Helper function for clique icons
function getCliqueIcon(clique: string): string {
  switch (clique) {
    case 'GEEK': return '🤓';
    case 'JOCK': return '🏈';
    case 'PREP': return '💅';
    case 'FREAK': return '🖤';
    default: return '❓';
  }
}

// Test NFT ownership simulation
function simulateNFTOwnership(clique: string) {
  console.log(`\n🧪 Simulating ownership of ${clique} NFT...`);
  console.log(`This would grant access to the ${clique}'s House!`);
  
  // In a real implementation, this would:
  // 1. Query the blockchain for user's NFTs
  // 2. Parse metadata for clique traits
  // 3. Update the access control state
  
  console.log('Real implementation checks:');
  console.log('• Flow blockchain NFT metadata');
  console.log('• MetadataViews.Traits for clique information');
  console.log('• Updates useCliqueAccess hook state');
}

// Export functions for testing
if (typeof window !== 'undefined') {
  window.testCliqueAccess = testCliqueAccess;
  window.simulateNFTOwnership = simulateNFTOwnership;
}

console.log('🎮 Clique Access Demo Script Loaded!');
console.log('Run testCliqueAccess() to see how the system works');
console.log('Run simulateNFTOwnership("GEEK") to test a specific clique');

export { testCliqueAccess, simulateNFTOwnership };
