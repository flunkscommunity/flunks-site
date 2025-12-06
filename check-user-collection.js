/**
 * Check if a user has SemesterZero Chapter 5 collection set up correctly
 * Usage: node check-user-collection.js <wallet_address>
 * 
 * Example: node check-user-collection.js 0xdca7ac623136e447
 */

import * as fcl from '@onflow/fcl';

// Configure FCL for Mainnet
fcl.config()
  .put('accessNode.api', 'https://rest-mainnet.onflow.org')
  .put('flow.network', 'mainnet');

const CHECK_COLLECTION_SCRIPT = `
import SemesterZero from 0xce9dd43888d99574
import NonFungibleToken from 0x1d7e57aa55817448

access(all) fun main(address: Address): {String: AnyStruct} {
  let account = getAccount(address)
  
  // Check for CORRECT collection path
  let hasCorrectStorage = account.storage.type(at: /storage/SemesterZeroChapter5Collection) != nil
  
  // Check for WRONG collection path (from old code)
  let hasWrongStorage = account.storage.type(at: /storage/SemesterZeroV3Collection) != nil
  
  // Check public capability
  let collectionCap = account.capabilities.get<&SemesterZero.Chapter5Collection>(
    /public/SemesterZeroChapter5Collection
  )
  let hasCorrectCapability = collectionCap.check()
  
  // Try to borrow and get NFT count
  var nftCount: Int = 0
  if hasCorrectCapability {
    if let collection = collectionCap.borrow() {
      nftCount = collection.getIDs().length
    }
  }
  
  return {
    "hasCorrectCollection": hasCorrectStorage && hasCorrectCapability,
    "hasCorrectStorage": hasCorrectStorage,
    "hasCorrectCapability": hasCorrectCapability,
    "hasWrongStorage": hasWrongStorage,
    "nftCount": nftCount,
    "readyForFlowty": hasCorrectStorage && hasCorrectCapability
  }
}
`;

async function checkUserCollection(address) {
  console.log('\n🔍 Checking SemesterZero Collection Setup\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`👤 Wallet Address: ${address}`);
  console.log(`🔗 Flowty Collection: https://www.flowty.io/collection/0xce9dd43888d99574/SemesterZero\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const result = await fcl.query({
      cadence: CHECK_COLLECTION_SCRIPT,
      args: (arg, t) => [arg(address, t.Address)]
    });
    
    console.log('📊 Collection Status:\n');
    
    // Main status
    if (result.hasCorrectCollection) {
      console.log('✅ COLLECTION READY FOR FLOWTY!');
      console.log(`   - Storage: ✅ Set up correctly`);
      console.log(`   - Capability: ✅ Public access enabled`);
      console.log(`   - NFT Count: ${result.nftCount} NFTs`);
    } else {
      console.log('❌ COLLECTION NOT SET UP CORRECTLY');
      console.log(`   - Storage: ${result.hasCorrectStorage ? '✅' : '❌'} ${result.hasCorrectStorage ? 'Found' : 'Missing'}`);
      console.log(`   - Capability: ${result.hasCorrectCapability ? '✅' : '❌'} ${result.hasCorrectCapability ? 'Enabled' : 'Not enabled'}`);
    }
    
    console.log();
    
    // Check for wrong path
    if (result.hasWrongStorage) {
      console.log('⚠️  WARNING: OLD COLLECTION DETECTED');
      console.log('   You have a collection at the WRONG storage path.');
      console.log('   This was created by the old version of the code.');
      console.log('   Flowty will NOT recognize this collection.\n');
      console.log('   📋 Action Required:');
      console.log('   1. Contact support to migrate your collection');
      console.log('   2. Or create a new collection at the correct path\n');
    }
    
    // Recommendations
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (result.readyForFlowty) {
      console.log('🎉 NEXT STEPS:\n');
      console.log('1. Visit Flowty marketplace:');
      console.log('   https://www.flowty.io/collection/0xce9dd43888d99574/SemesterZero\n');
      console.log('2. Connect your wallet\n');
      console.log('3. Your NFTs should appear automatically!\n');
      
      if (result.nftCount === 0) {
        console.log('📝 Note: You have 0 NFTs in this collection.');
        console.log('   Complete objectives in Flunks: Semester Zero to earn NFTs!\n');
      }
    } else {
      console.log('⚙️  SETUP REQUIRED:\n');
      console.log('Option 1 - Use flunks.net (Recommended):\n');
      console.log('   1. Visit https://flunks.net');
      console.log('   2. Connect your Flow Wallet (not Dapper)');
      console.log('   3. Go to Paradise Motel → Lobby');
      console.log('   4. Click "🎫 Set up Collection"\n');
      
      console.log('Option 2 - Use Flowty:\n');
      console.log('   1. Visit https://www.flowty.io/collection/0xce9dd43888d99574/SemesterZero');
      console.log('   2. Connect your Flow Wallet');
      console.log('   3. Click "Enable Collection" if available\n');
      
      console.log('💡 TIP: If you\'re using Dapper Wallet:');
      console.log('   Dapper has limitations with collection setup.');
      console.log('   Use Flow Wallet extension or Dapper\'s Account Linking feature.');
      console.log('   Guide: https://support.meetdapper.com/hc/en-us/articles/20744347884819\n');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('\n❌ Error checking collection:', error.message);
    console.error('\nPlease verify:');
    console.error('- Wallet address is correct');
    console.error('- Address starts with 0x');
    console.error('- Address is 18 characters long');
    console.error('- You are connected to Flow Mainnet\n');
  }
}

// Get wallet address from command line
const walletAddress = process.argv[2];

if (!walletAddress) {
  console.error('\n❌ Error: No wallet address provided\n');
  console.error('Usage: node check-user-collection.js <wallet_address>\n');
  console.error('Example: node check-user-collection.js 0xdca7ac623136e447\n');
  process.exit(1);
}

// Validate address format
if (!walletAddress.startsWith('0x') || walletAddress.length !== 18) {
  console.error('\n❌ Error: Invalid wallet address format\n');
  console.error('Flow wallet addresses must:');
  console.error('- Start with 0x');
  console.error('- Be 18 characters long (including 0x)');
  console.error('\nExample: 0xdca7ac623136e447\n');
  process.exit(1);
}

// Run the check
checkUserCollection(walletAddress);
